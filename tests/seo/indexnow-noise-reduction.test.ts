import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const scriptPath = join(repoRoot, 'scripts/submit-indexnow-urls.ts')
const key = '668040d910c747aca5f3763d0c2c2737'

function makeFixtureRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'indexnow-fixture-'))
  mkdirSync(join(dir, 'content-cache/generated'), { recursive: true })
  mkdirSync(join(dir, 'public'), { recursive: true })
  writeFileSync(join(dir, 'public', `${key}.txt`), `${key}\n`)
  writeFileSync(
    join(dir, 'content-cache/generated/routes-manifest.json'),
    JSON.stringify([
      { slug: '/quick-start', status: 'published', title: 'Quick Start', updated: '2026-05-16' },
      { slug: '/draft', status: 'draft', title: 'Draft' },
    ]),
  )
  writeFileSync(
    join(dir, 'content-cache/generated/packs-manifest.json'),
    JSON.stringify([{ id: 'starter', status: 'published', title: 'Starter Pack', updated: '2026-05-16' }]),
  )
  return dir
}

function runSubmit(cwd: string, args: string[] = [], env: Record<string, string> = {}) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [join(repoRoot, 'node_modules/tsx/dist/cli.mjs'), scriptPath, ...args], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', reject)
    child.on('close', (status) => resolve({ status, stdout, stderr }))
  })
}

describe('IndexNow noise reduction behavior', () => {
  it('dry-run previews URL candidates and does not write change state or call the endpoint', async () => {
    const cwd = makeFixtureRepo()
    try {
      const stateFile = join(cwd, '.indexnow-state.json')
      const result = await runSubmit(cwd, ['--dry-run'], {
        INDEXNOW_ENDPOINT: 'http://127.0.0.1:9/should-not-be-called',
        INDEXNOW_STATE_FILE: stateFile,
      })

      assert.equal(result.status, 0, result.stderr)
      assert.match(result.stdout, /dryRun=true/)
      assert.match(result.stdout, /IndexNow URL list preview:/)
      assert.match(result.stdout, /submitted_count=0/)
      assert.doesNotMatch(result.stdout, new RegExp(key), 'raw key must not be printed')
      assert.throws(() => readFileSync(stateFile, 'utf8'), /ENOENT/)
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })

  it('prints NO_CHANGE and skips IndexNow API when the manifest hash is unchanged', async () => {
    const cwd = makeFixtureRepo()
    try {
      const stateFile = join(cwd, '.indexnow-state.json')
      const first = await runSubmit(cwd, ['--dry-run'], { INDEXNOW_STATE_FILE: stateFile })
      assert.equal(first.status, 0, first.stderr)
      const manifestHash = first.stdout.match(/manifest_hash=([0-9a-f]{64})/)?.[1]
      assert.ok(manifestHash, first.stdout)
      writeFileSync(stateFile, JSON.stringify({ manifestHash, urlFingerprints: {}, submittedAt: '2026-05-16T00:00:00.000Z' }))

      const result = await runSubmit(cwd, [], {
        INDEXNOW_ENDPOINT: 'http://127.0.0.1:9/should-not-be-called',
        INDEXNOW_STATE_FILE: stateFile,
      })

      assert.equal(result.status, 0, result.stderr)
      assert.match(result.stdout, /NO_CHANGE/)
      assert.match(result.stdout, /submitted_count=0/)
      assert.doesNotMatch(result.stdout, /IndexNow submit succeeded/)
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })

  it('submits changed/core URLs with a cap, logs safe proof, and updates state', async () => {
    const cwd = makeFixtureRepo()
    const received: unknown[] = []
    const server = createServer((req, res) => {
      let body = ''
      req.setEncoding('utf8')
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => {
        received.push(JSON.parse(body))
        res.statusCode = 200
        res.end('OK')
      })
    })

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    assert.ok(address && typeof address === 'object')
    const port = (address as AddressInfo).port

    try {
      const stateFile = join(cwd, '.indexnow-state.json')
      writeFileSync(
        stateFile,
        JSON.stringify({
          manifestHash: '0'.repeat(64),
          urlFingerprints: { 'https://hermes-zh.com/docs/quick-start': 'old' },
          submittedAt: '2026-05-16T00:00:00.000Z',
        }),
      )

      const result = await runSubmit(cwd, [], {
        INDEXNOW_ENDPOINT: `http://127.0.0.1:${port}/IndexNow`,
        INDEXNOW_STATE_FILE: stateFile,
        INDEXNOW_MAX_URLS: '7',
      })

      assert.equal(result.status, 0, result.stderr)
      assert.match(result.stdout, /change_status=CHANGED/)
      assert.match(result.stdout, /submitted_count=7/)
      assert.match(result.stdout, /keyFingerprint=[0-9a-f]{12}/)
      assert.doesNotMatch(result.stdout, new RegExp(key), 'raw key must not be printed')
      assert.equal(received.length, 1)
      const payload = received[0] as { urlList: string[]; key: string; keyLocation: string }
      assert.equal(payload.key, key)
      assert.equal(payload.urlList.length, 7)
      assert.ok(payload.urlList.includes('https://hermes-zh.com/'))
      assert.ok(payload.urlList.some((url) => url.includes('/docs/quick-start')))
      assert.ok(JSON.parse(readFileSync(stateFile, 'utf8')).manifestHash.match(/^[0-9a-f]{64}$/))
    } finally {
      server.close()
      rmSync(cwd, { recursive: true, force: true })
    }
  })
})
