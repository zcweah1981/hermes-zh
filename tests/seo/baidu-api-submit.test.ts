import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()

describe('Baidu API URL submit tooling', () => {
  it('exposes an npm script for Baidu API submission', () => {
    const pkg = JSON.parse(readFileSync(`${repoRoot}/package.json`, 'utf8')) as { scripts: Record<string, string> }

    assert.equal(pkg.scripts['submit:baidu'], 'tsx scripts/submit-baidu-urls.ts')
  })

  it('keeps the Baidu push token out of committed source', () => {
    const script = readFileSync(`${repoRoot}/scripts/submit-baidu-urls.ts`, 'utf8')

    assert.match(script, /process\.env\.BAIDU_PUSH_TOKEN/)
    assert.doesNotMatch(script, /token=[A-Za-z0-9]{8,}/)
    assert.doesNotMatch(script, /BAIDU_PUSH_TOKEN_PLACEHOLDER/)
  })

  it('uses Baidu official URL push endpoint', () => {
    const script = readFileSync(`${repoRoot}/scripts/submit-baidu-urls.ts`, 'utf8')

    assert.match(script, /http:\/\/data\.zz\.baidu\.com\/urls/)
    assert.match(script, /Content-Type': 'text\/plain'/)
  })
})
