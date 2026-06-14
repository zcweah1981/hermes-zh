import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

function vercelHeaderRule(source: string) {
  const config = JSON.parse(read('vercel.json')) as {
    headers: { source: string; headers: { key: string; value: string }[] }[]
  }
  const rule = config.headers.find((entry) => entry.source === source)
  assert.ok(rule, `missing vercel header rule for ${source}`)
  return rule
}

describe('R7 PageSpeed minimal zero-visual-change guards', () => {
  it('preloads the critical self-hosted UI font without reintroducing render-blocking external font CSS', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    assert.doesNotMatch(layout, /fonts\.googleapis\.com|fonts\.gstatic\.com|from ['"]next\/font\/google['"]/i)
    assert.doesNotMatch(globals, /fonts\.googleapis\.com|fonts\.gstatic\.com|@import\s+url\(['"]?https?:\/\//i)
    assert.doesNotMatch(
      layout,
      /href="\/fonts\/noto-sans-sc\.woff2"[\s\S]{0,220}?rel="preload"|rel="preload"[\s\S]{0,220}?href="\/fonts\/noto-sans-sc\.woff2"/,
      'full Noto Sans SC should not be promoted to a high-priority mobile preload',
    )
    assert.doesNotMatch(
      layout,
      /href="\/fonts\/noto-serif-sc\.woff2"[\s\S]{0,220}?rel="preload"|rel="preload"[\s\S]{0,220}?href="\/fonts\/noto-serif-sc\.woff2"/,
      'large decorative serif face should stay off the first-screen preload path',
    )
    assert.match(globals, /font-display:\s*swap;/, 'font-face should keep non-blocking text rendering')
    assert.match(globals, /@font-face\s*\{[\s\S]*?font-family:\s*'Noto Sans SC'[\s\S]*?ascent-override:/, 'critical font should expose stable fallback metrics through CSS instead of a high-priority preload')
  })

  it('guards the hero CLS source with explicit intrinsic sizing and stable font fallback metrics', () => {
    const globals = read('app/globals.css')
    const hero = read('components/marketing/hero.tsx')

    assert.match(globals, /@font-face\s*\{[\s\S]*?font-family:\s*'Noto Sans SC'[\s\S]*?size-adjust:\s*104\.5%;[\s\S]*?ascent-override:\s*88%;[\s\S]*?descent-override:\s*12%;[\s\S]*?line-gap-override:\s*0%;[\s\S]*?\}/)
    assert.match(globals, /@font-face\s*\{[\s\S]*?font-family:\s*'Noto Serif SC'[\s\S]*?ascent-override:\s*88%;[\s\S]*?descent-override:\s*12%;[\s\S]*?line-gap-override:\s*0%;[\s\S]*?\}/)
    assert.match(globals, /\.site-hero-fullscreen\s*\{[\s\S]*?contain-intrinsic-size:\s*calc\(100vh - var\(--site-header-height\)\);/)
    assert.match(hero, /className="site-hero-title max-w-4xl/, 'hero title visual class contract must remain')
    assert.match(hero, />\s*Hermes Agent 中文站\s*</, 'hero title copy must remain unchanged')
  })

  it('keeps homepage-specific connector JavaScript off the initial page while preserving infographic visuals', () => {
    const home = read('app/(marketing)/page.tsx')

    assert.doesNotMatch(home, /LazyCapabilityConnectorLayer|lazy-capability-connectors/, 'homepage should not import or render connector client JS')
    assert.match(home, /data-connector-layer="static-svg"/, 'infographic connector visual layer must remain as static SVG')
    assert.match(home, /data-connector-scope="capability-infographic"/, 'infographic DOM anchor scope must remain')
    assert.match(home, /data-connector-node="core"/, 'core anchor contract must remain')
    assert.match(home, /left-top/, 'left mechanism anchor contract must remain')
    assert.match(home, /data-connector-node="right-bottom"/, 'right MCP anchor contract must remain')
  })

  it('keeps immutable CDN headers for preloaded font resources and does not weaken SEO or GA4 source markers', () => {
    const fontRule = vercelHeaderRule('/fonts/(.*)')
    const layout = read('app/layout.tsx')

    assert.equal(fontRule.headers.find((header) => header.key === 'Cache-Control')?.value, 'public, max-age=31536000, immutable')
    assert.equal(fontRule.headers.find((header) => header.key === 'Vercel-CDN-Cache-Control')?.value, 'public, s-maxage=31536000, immutable')
    assert.match(layout, /<SiteJsonLd data=\{\[buildWebSiteJsonLd\(\), buildOrganizationJsonLd\(\), buildSoftwareApplicationJsonLd\(\)\]\}/)
    assert.match(layout, /id="ga4-idle-loader"[\s\S]*?strategy="lazyOnload"/)
    assert.match(layout, /window\.setTimeout\(loadGtag, 12000\)/)
    assert.match(layout, /id="ga4-gtag-config"[\s\S]*?strategy="afterInteractive"/)
    assert.match(layout, /gtag\('config', '\$\{GA_MEASUREMENT_ID\}'\)/)
  })
})
