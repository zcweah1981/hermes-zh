import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

const DESKTOP_HEADER_HEIGHT = '109px'
const DESKTOP_HEADER_INNER_MIN_HEIGHT = '108px'

describe('R18 desktop-only header/main geometry CLS stoploss', () => {
  it('mirrors the desktop header reservation in critical CSS and full CSS without touching the mobile header variable', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    assert.match(globals, /:root\s*\{[\s\S]*?--site-header-height:\s*56px;/, 'mobile/base header height must remain unchanged')

    for (const [label, source] of [['critical CSS', layout], ['full CSS', globals]] as const) {
      assert.match(
        source,
        new RegExp(`@media \\(min-width:\\s*1024px\\) \\{[\\s\\S]*?:root \\{[\\s\\S]*?--site-header-height:\\s*${DESKTOP_HEADER_HEIGHT};`),
        `${label} must reserve the measured desktop header height before first paint`,
      )
      assert.match(
        source,
        new RegExp(
          `@media \\(min-width:\\s*1024px\\) \\{[\\s\\S]*?\\.site-frame > div \\{[\\s\\S]*?min-height:\\s*${DESKTOP_HEADER_INNER_MIN_HEIGHT};[\\s\\S]*?display:\\s*flex;[\\s\\S]*?flex-direction:\\s*row;[\\s\\S]*?justify-content:\\s*space-between;[\\s\\S]*?align-items:\\s*center;[\\s\\S]*?gap:\\s*1rem;[\\s\\S]*?padding-top:\\s*12px;[\\s\\S]*?padding-bottom:\\s*12px;[\\s\\S]*?\\.site-frame > div > div\\.hidden \\{[\\s\\S]*?display:\\s*flex;[\\s\\S]*?flex-direction:\\s*row;`,
        ),
        `${label} must reserve the header inner wrapper final desktop flex geometry`,
      )
      assert.match(
        source,
        /@media \(min-width:\s*1024px\) \{[\s\S]*?main\.flex-1 \{[\s\S]*?min-height:\s*calc\(100vh - var\(--site-header-height\)\);/,
        `${label} must keep main geometry based on the same desktop header variable`,
      )
    }
  })

  it('keeps homepage hero and docs start stabilizers aligned to the same desktop reservation while preserving scoped docs behavior', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')
    const docsPage = read('app/docs/[...slug]/page.tsx')
    const header = read('components/layout/site-header.tsx')

    for (const source of [layout, globals]) {
      assert.match(source, /\.site-hero-fullscreen\s*\{[\s\S]*?height:\s*calc\(100vh - var\(--site-header-height\)\);/)
      assert.match(source, /\.site-hero-content\s*\{[\s\S]*?height:\s*calc\(100vh - var\(--site-header-height\)\);/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\]\s*\{[\s\S]*?gap:\s*1\.5rem;[\s\S]*?padding:\s*2rem 1\.5rem;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] > article\s*\{[\s\S]*?overflow:\s*hidden;[\s\S]*?padding:\s*2rem;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] nav\[aria-label="Breadcrumb"\]\s*\{[\s\S]*?margin-bottom:\s*1\.5rem;[\s\S]*?display:\s*flex;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] \.site-doc-header\s*\{[\s\S]*?padding:\s*2rem;[\s\S]*?padding-bottom:\s*2rem;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] \.site-doc-header \[data-ai-summary="true"\]\s*\{[\s\S]*?line-height:\s*2rem;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] \.docs-start-markdown-shell\s*\{[\s\S]*?min-height:\s*5434px;[\s\S]*?contain-intrinsic-size:\s*5434px;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] \.site-doc-prose h2\s*\{[\s\S]*?margin-top:\s*3rem;[\s\S]*?line-height:\s*2rem;/)
      assert.match(source, /body:has\(\.site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\]\) main\.flex-1\s*\{[\s\S]*?min-height:\s*1620px;[\s\S]*?contain:\s*layout paint;/)
    }

    assert.match(docsPage, /page\.slug === '\/start'/)
    assert.match(docsPage, /data-doc-desktop-cls-stabilizer=\{docsStartDesktopClsStabilizer\}/)
    assert.match(docsPage, /page\.slug === '\/start'[\s\S]*?\{ marginTop: '0', minHeight: '5434px', contain: 'layout paint' as const \}/)
    assert.match(docsPage, /className=\{page\.slug === '\/start' \? 'docs-start-markdown-shell' : 'mt-10'\}/)
    assert.match(header, /data-analytics-event="nav_start_click"/)
  })
})
