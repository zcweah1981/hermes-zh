import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const baiduVerificationCode = 'codeva-hwY05tbXV2'
const baiduVerificationFile = `baidu_verify_${baiduVerificationCode}.html`

describe('Baidu site verification', () => {
  it('serves the Baidu verification HTML file from the public site root', () => {
    const verificationFileSource = readFileSync(join(repoRoot, 'public', baiduVerificationFile), 'utf8')

    assert.equal(verificationFileSource, `<html>${baiduVerificationCode}</html>\n`)
  })

  it('keeps the metadata verification code aligned with the root HTML file', () => {
    const layoutSource = readFileSync(join(repoRoot, 'app/layout.tsx'), 'utf8')

    assert.match(layoutSource, new RegExp(`['\"]baidu-site-verification['\"]:\\s*['\"]${baiduVerificationCode}['\"]`))
  })
})
