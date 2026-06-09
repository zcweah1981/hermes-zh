import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const cloudflareBeaconSrc = '/cdn-cgi/rum/beacon.min.js'
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

  it('keeps the first-party /cdn-cgi/rum mirror route out of app source so Cloudflare can cache the vendor beacon as a static asset', () => {
    const layoutSource = readFileSync(join(repoRoot, 'app/layout.tsx'), 'utf8')
    const mirrorPath = join(repoRoot, 'public/cdn-cgi/rum/beacon.min.js')

    assert.match(layoutSource, /src=['"]\/cdn-cgi\/rum\/beacon\.min\.js['"]/, 'site should load a same-origin mirror for the Cloudflare beacon')
    assert.doesNotMatch(layoutSource, /static\.cloudflareinsights\.com\/beacon\.min\.js/, 'layout should not put the third-party beacon host on every page')
    assert.ok(statSync(mirrorPath).size > 10_000, 'Cloudflare beacon mirror should be committed as a real static asset')
  })
})
