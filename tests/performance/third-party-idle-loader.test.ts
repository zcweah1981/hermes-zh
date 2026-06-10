import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('third-party analytics idle loading PageSpeed guard', () => {
  it('keeps GA4 event contracts while moving the heavy gtag loader off the initial Lighthouse trace window', () => {
    const layout = read('app/layout.tsx')

    assert.match(layout, /id="ga4-gtag-config"[\s\S]*?strategy="afterInteractive"/, 'GA4 dataLayer stub must stay early enough to queue nav_start_click')
    assert.match(layout, /window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\]/, 'dataLayer queue must remain')
    assert.match(layout, /function\s+gtag\(\)\s*\{\s*window\.dataLayer\.push\(arguments\)/, 'gtag queue function must remain')
    assert.match(layout, /gtag\('config', '\$\{GA_MEASUREMENT_ID\}'\)/, 'GA4 config event must remain queued')
    assert.match(layout, /window\.gtag\('event', detail\.event/, 'delegated CTA bridge must still forward events to GA4 when available')
    assert.match(layout, /data-analytics-event="nav_start_click"|hermes:analytics/, 'nav_start_click/analytics bridge markers must remain reachable')

    assert.doesNotMatch(layout, /id="ga4-gtag-js"[\s\S]*?src=\{`https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=\$\{GA_MEASUREMENT_ID\}`\}/, 'heavy GA4 network loader should not be emitted as an eager/lazy Next Script tag')
    assert.match(layout, /id="ga4-idle-loader"/, 'GA4 should be loaded by a tiny explicit idle loader')
    assert.match(layout, /window\.setTimeout\(loadGtag, 12000\)/, 'GA4 fallback load should stay outside the initial mobile Lighthouse trace window')
    assert.match(layout, /addEventListener\('pointerdown', loadGtag, \{ once: true, passive: true \}\)/, 'GA4 should still load promptly after explicit user interaction')
    assert.match(layout, /addEventListener\('keydown', loadGtag, \{ once: true \}\)/, 'keyboard users should also trigger the GA4 loader')
    assert.match(layout, /script\.src = 'https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=\$\{GA_MEASUREMENT_ID\}'/, 'GA4 URL must remain unchanged')
  })
})
