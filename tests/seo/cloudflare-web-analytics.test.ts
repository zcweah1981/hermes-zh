import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const cloudflareBeaconSrc = 'https://static.cloudflareinsights.com/beacon.min.js'
const cloudflareRumToken = 'b653102bed904fb289cf6e3dd1f8baaa'

describe('Cloudflare Web Analytics RUM', () => {
  it('injects the Cloudflare Web Analytics beacon from the global layout', () => {
    const layoutSource = readFileSync(join(repoRoot, 'app/layout.tsx'), 'utf8')

    assert.match(layoutSource, /from ['"]next\/script['"]/, 'Next Script should be used for the analytics beacon')
    assert.match(layoutSource, new RegExp(cloudflareBeaconSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(layoutSource, new RegExp(`CLOUDFLARE_WEB_ANALYTICS_TOKEN\\s*=\\s*['\"]${cloudflareRumToken}['\"]`))
    assert.match(layoutSource, /data-cf-beacon=/)
    assert.match(layoutSource, /token:\s*CLOUDFLARE_WEB_ANALYTICS_TOKEN/)
  })
})
