import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
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
    assert.match(layoutSource, /id=['"]cloudflare-web-analytics['"][\s\S]*?strategy=['"]lazyOnload['"]/, 'Cloudflare analytics should stay delayed and non-render-blocking')
  })

  it('loads the official Cloudflare beacon URL instead of the Cloudflare-reserved /cdn-cgi path', () => {
    const layoutSource = readFileSync(join(repoRoot, 'app/layout.tsx'), 'utf8')
    const mirrorPath = join(repoRoot, 'public/cdn-cgi/rum/beacon.min.js')

    assert.match(layoutSource, /src=['"]https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js['"]/, 'site should load the official Cloudflare beacon URL')
    assert.doesNotMatch(layoutSource, /src=['"]\/cdn-cgi\/rum\/beacon\.min\.js['"]/, 'layout must not request the Cloudflare-reserved /cdn-cgi RUM path that returns 404 before origin')
    assert.ok(statSync(mirrorPath).size > 10_000, 'legacy mirror remains committed but must not be referenced by layout')
  })
})
