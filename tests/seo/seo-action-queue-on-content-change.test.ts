import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const scriptPath = join(repoRoot, 'scripts/build-seo-action-queue.ts')

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function makeFixtureRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'seo-action-queue-'))
  const generated = join(dir, 'content-cache/generated')
  mkdirSync(generated, { recursive: true })

  writeJson(join(dir, 'content-cache/content-lock.json'), {
    schemaVersion: 1,
    contentRepo: 'zcweah1981/awesome-hermes-agent-zh',
    contentRef: 'main',
    contentSha: 'a'.repeat(40),
    lockedAt: '2026-05-17T08:00:00.000+08:00',
  })
  writeJson(join(generated, 'routes-manifest.json'), [
    {
      sourcePath: 'docs/new-page.md',
      slug: '/new-page',
      pageType: 'doc-page',
      module: 'start',
      section: 'guide',
      title: '新增页面',
      description: '新增页面说明会进入 SEO 与 GEO 索引队列，避免关键词堆砌。',
      status: 'published',
      updated: '2026-05-17',
      sourceType: 'original',
      navGroup: 'start',
    },
    {
      sourcePath: 'docs/draft.md',
      slug: '/draft',
      title: 'Draft',
      description: 'Draft',
      status: 'draft',
      updated: '2026-05-17',
    },
  ])
  writeJson(join(generated, 'pages-manifest.json'), [
    {
      sourcePath: 'docs/new-page.md',
      slug: '/new-page',
      title: '新增页面',
      module: 'start',
      section: 'guide',
      description: '新增页面说明会进入 SEO 与 GEO 索引队列，避免关键词堆砌。',
      order: 1,
      status: 'published',
      updated: '2026-05-17',
      sourceType: 'original',
      navGroup: 'start',
      pageType: 'doc-page',
      headings: [{ depth: 2, text: '下一步', id: 'next' }],
      body: '# 新增页面\n\n请继续阅读 [站点总览](/docs/docs-overview)。',
      githubUrl: 'https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/main/docs/new-page.md',
      prev: '/docs-overview',
    },
  ])
  writeJson(join(generated, 'packs-manifest.json'), [
    {
      id: 'tweet-lab',
      title: 'Hermes Tweet 第三方页面收集',
      category: 'third-party',
      modes: ['solo'],
      doc: 'https://x.com/example/status/1',
      install: '',
      status: 'published',
      featured: false,
    },
  ])
  writeJson(join(generated, 'search-index.json'), [
    {
      type: 'page',
      title: '新增页面',
      slug: '/new-page',
      description: '新增页面说明会进入 SEO 与 GEO 索引队列，避免关键词堆砌。',
      module: 'start',
      headings: ['下一步'],
    },
  ])

  return dir
}

function runQueue(cwd: string, args: string[] = [], env: Record<string, string> = {}) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [join(repoRoot, 'node_modules/tsx/dist/cli.mjs'), scriptPath, ...args], {
      cwd,
      env: { ...process.env, BAIDU_PUSH_TOKEN: 'baidu-super-secret-token', INDEXNOW_KEY: '0123456789abcdef0123456789abcdef', ...env },
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

describe('SEO/GEO action queue on content change', () => {
  it('creates queue items only for new or updated published URLs with SEO/GEO checks and safe platform actions', async () => {
    const cwd = makeFixtureRepo()
    try {
      const outputFile = join(cwd, 'content-cache/generated/seo-action-queue.json')
      const stateFile = join(cwd, 'content-cache/seo-action-state.json')
      const result = await runQueue(cwd, [], {
        SEO_ACTION_QUEUE_FILE: outputFile,
        SEO_ACTION_QUEUE_STATE_FILE: stateFile,
      })

      assert.equal(result.status, 0, result.stderr)
      assert.match(result.stdout, /seo_action_queue_status=CHANGED/)
      assert.match(result.stdout, /queued_count=2/) // one doc URL plus one third-party boundary monitor item
      assert.doesNotMatch(result.stdout + result.stderr, /baidu-super-secret-token|0123456789abcdef0123456789abcdef/)

      const queue = JSON.parse(readFileSync(outputFile, 'utf8'))
      assert.equal(queue.schemaVersion, 1)
      assert.equal(queue.source.contentSha, 'a'.repeat(40))
      assert.equal(queue.actions.length, 2)

      const docAction = queue.actions.find((action: { url: string }) => action.url === 'https://hermes-zh.com/docs/new-page')
      assert.ok(docAction, JSON.stringify(queue.actions))
      assert.equal(docAction.changeType, 'new')
      assert.deepEqual(docAction.platforms, ['indexnow', 'bing', 'baidu', 'gsc_monitor'])
      assert.equal(docAction.gscMode, 'read_report_only')
      assert.equal(docAction.baiduQuotaClass, 'daily_quota_controlled')
      assert.equal(docAction.thirdPartyBoundary, 'first_party_content')
      assert.equal(docAction.seoChecks.title, 'pass')
      assert.equal(docAction.seoChecks.description, 'pass')
      assert.equal(docAction.seoChecks.canonical, 'pass')
      assert.equal(docAction.seoChecks.openGraph, 'pass')
      assert.equal(docAction.seoChecks.twitterCard, 'pass')
      assert.equal(docAction.seoChecks.breadcrumb, 'pass')
      assert.equal(docAction.seoChecks.jsonLd, 'pass')
      assert.equal(docAction.seoChecks.sitemap, 'pass')
      assert.equal(docAction.seoChecks.llms, 'pass')
      assert.equal(docAction.seoChecks.searchIndex, 'pass')
      assert.equal(docAction.seoChecks.internalLinks, 'pass')
      assert.equal(docAction.seoChecks.lastmod, 'pass')
      assert.equal(docAction.seoChecks.keywordStuffing, 'pass')

      const thirdParty = queue.actions.find((action: { thirdPartyBoundary: string }) => action.thirdPartyBoundary === 'third_party_reference')
      assert.ok(thirdParty, 'Hermes Tweet / third-party pack must stay as boundary monitor, not first-party capability')
      assert.deepEqual(thirdParty.platforms, ['gsc_monitor'])
      assert.match(thirdParty.notes.join('\n'), /第三方|not official built-in capability/i)
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })

  it('skips queue generation when content-lock and generated manifests are unchanged', async () => {
    const cwd = makeFixtureRepo()
    try {
      const outputFile = join(cwd, 'content-cache/generated/seo-action-queue.json')
      const stateFile = join(cwd, 'content-cache/seo-action-state.json')
      const first = await runQueue(cwd, [], { SEO_ACTION_QUEUE_FILE: outputFile, SEO_ACTION_QUEUE_STATE_FILE: stateFile })
      assert.equal(first.status, 0, first.stderr)
      const second = await runQueue(cwd, [], { SEO_ACTION_QUEUE_FILE: outputFile, SEO_ACTION_QUEUE_STATE_FILE: stateFile })

      assert.equal(second.status, 0, second.stderr)
      assert.match(second.stdout, /seo_action_queue_status=NO_CHANGE/)
      assert.match(second.stdout, /queued_count=0/)
      const queue = JSON.parse(readFileSync(outputFile, 'utf8'))
      assert.deepEqual(queue.actions, [])
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })
})
