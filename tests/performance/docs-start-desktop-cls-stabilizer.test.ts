import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync('app/docs/[...slug]/page.tsx', 'utf8')
const cssSource = readFileSync('app/globals.css', 'utf8')
const layoutSource = readFileSync('app/layout.tsx', 'utf8')

describe('/docs/start desktop CLS stabilizer', () => {
  it('scopes the stabilizer to the canonical /docs/start page only', () => {
    assert.match(pageSource, /page\.slug === '\/start'/)
    assert.match(pageSource, /data-doc-desktop-cls-stabilizer=\{docsStartDesktopClsStabilizer\}/)
  })

  it('reserves the desktop docs grid, columns, and first-screen h1 before web font swap', () => {
    for (const source of [cssSource, layoutSource]) {
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\]/)
      assert.match(source, /grid-template-columns:\s*280px minmax\(0, 1fr\) 250px;/)
      assert.match(source, /min-height:\s*1620px;/)
      assert.match(source, /contain:\s*layout paint;/)
      assert.match(source, /font-family:\s*system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;/)
      assert.match(source, /font-family:\s*system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] > article[\s\S]*min-height:\s*720px;/)
      assert.match(
        source,
        /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\] \.site-doc-header h1\s*\{[\s\S]*?line-height:\s*2\.5rem;[\s\S]*?content-visibility:\s*visible;[\s\S]*?contain-intrinsic-size:\s*auto;[\s\S]*?min-height:\s*2\.5rem;/,
      )
    }
    assert.match(layoutSource, /body:has\(\.site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\]\) main\.flex-1/)
    assert.match(cssSource, /font-display:\s*optional;/)
    assert.match(cssSource, /body:has\(\.site-doc-page-grid\[data-doc-desktop-cls-stabilizer="start"\]\) main\.flex-1/)
    assert.match(pageSource, /suppressHydrationWarning/)
  })
})
