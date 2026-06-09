import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const gaMeasurementId = 'G-N2Q0TXQDRZ'
describe('GA4 gtag integration', () => {
  it('injects GA4 gtag scripts from the global App Router layout', () => {
    const layoutSource = readFileSync(join(repoRoot, 'app/layout.tsx'), 'utf8')

    assert.match(layoutSource, /from ['"]next\/script['"]/, 'Next Script should be used for GA4')
    assert.match(layoutSource, /NEXT_PUBLIC_GA_MEASUREMENT_ID/, 'GA4 ID should be configurable via public env')
    assert.match(layoutSource, new RegExp(gaMeasurementId), 'Production source must contain the fixed GA4 measurement ID')
    assert.match(layoutSource, /id=['"]ga4-gtag-js['"]/, 'External GA4 loader should have a stable script id')
    assert.match(layoutSource, /id=['"]ga4-gtag-config['"]/, 'Inline GA4 config should have a stable script id')
    assert.match(layoutSource, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/)
    assert.match(layoutSource, /src=\{`https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=\$\{GA_MEASUREMENT_ID\}`\}/)
    assert.match(layoutSource, /id=['"]ga4-gtag-js['"][\s\S]*?strategy=['"]lazyOnload['"]/, 'GA4 network loader should be preserved but delayed until browser idle to reduce mobile TBT')
    assert.match(layoutSource, /id=['"]ga4-gtag-config['"][\s\S]*?strategy=['"]afterInteractive['"]/, 'GA4 dataLayer stub should still initialize early enough to queue navigation analytics')
    assert.match(layoutSource, /window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\]/)
    assert.match(layoutSource, /function\s+gtag\(\)\s*{\s*window\.dataLayer\.push\(arguments\)/)
    assert.match(layoutSource, /gtag\(['"]js['"],\s*new Date\(\)\)/)
    assert.match(layoutSource, /gtag\(['"]config['"],\s*['"]\$\{GA_MEASUREMENT_ID\}['"]\)/)
  })
})
