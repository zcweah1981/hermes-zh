import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const indexNowKey = '668040d910c747aca5f3763d0c2c2737'

describe('IndexNow submission tooling', () => {
  it('hosts the IndexNow key file from the public site root', () => {
    const keyFile = join(repoRoot, 'public', `${indexNowKey}.txt`)

    assert.ok(existsSync(keyFile), 'IndexNow key file must exist in public/')
    assert.equal(readFileSync(keyFile, 'utf8'), `${indexNowKey}\n`)
  })

  it('exposes an npm script and uses the official IndexNow endpoint', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
    const script = readFileSync(join(repoRoot, 'scripts/submit-indexnow-urls.ts'), 'utf8')

    assert.equal(pkg.scripts['submit:indexnow'], 'tsx scripts/submit-indexnow-urls.ts')
    assert.match(script, /https:\/\/api\.indexnow\.org\/IndexNow/)
    assert.match(script, /INDEXNOW_HOST/)
    assert.match(script, /INDEXNOW_KEY_LOCATION/)
    assert.match(script, /urlList/)
  })
})
