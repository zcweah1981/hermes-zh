import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

function firstRuleBlock(source: string, selector: string): string {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\}`)
  const match = source.match(pattern)
  assert.ok(match, `missing CSS rule for ${selector}`)
  return match[1]
}

describe('R10 desktop CLS critical CSS stoploss', () => {
  it('keeps desktop hero title line-box stable between inline critical CSS and full CSS', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')
    const criticalHeroTitle = firstRuleBlock(layout, '.site-hero-title')
    const fullHeroTitle = firstRuleBlock(globals, '.site-hero-title')

    for (const [name, block] of [
      ['inline critical CSS', criticalHeroTitle],
      ['full CSS', fullHeroTitle],
    ] as const) {
      assert.match(block, /font-family:\s*'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;/, `${name} should reserve the same UI font stack`)
      assert.match(block, /font-weight:\s*800;/, `${name} should use the loaded Noto Sans SC max weight instead of synthetic 900 that shifts on font swap`)
      assert.match(block, /line-height:\s*1\.28;/, `${name} should keep the desktop line-height stable before and after full CSS loads`)
      assert.match(block, /min-height:\s*calc\(82px \* 1\.28 \+ 1\.25rem\);/, `${name} should reserve the one-line desktop h1 box plus existing descender padding`)
      assert.match(block, /contain-intrinsic-size:\s*calc\(82px \* 1\.28 \+ 1\.25rem\);/, `${name} should expose an intrinsic size guard for lab CLS`)
    }

    assert.match(layout, /@media \(min-width:\s*768px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?font-size:\s*82px;[\s\S]*?line-height:\s*1\.28;[\s\S]*?min-height:\s*calc\(82px \* 1\.28 \+ 1\.25rem\);[\s\S]*?\}/, 'desktop critical override should not only set font-size; it must also reserve line-box height')
  })

  it('keeps desktop critical hero content geometry aligned with the hydrated Tailwind/full CSS state', () => {
    const layout = read('app/layout.tsx')

    assert.match(
      layout,
      /@media \(min-width:\s*768px\)\s*\{[\s\S]*?\.site-hero-content\s*\{[\s\S]*?transform:\s*translateY\(-2rem\);[\s\S]*?padding:\s*6rem 0;[\s\S]*?\}/,
      'desktop critical CSS must reserve the same hero-content transform and md vertical padding before full CSS loads',
    )
  })

  it('pins the desktop hero section and content boxes so font swap cannot resize the fullscreen CLS source node', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    const criticalHero = firstRuleBlock(layout, '.site-hero-fullscreen')
    const fullHero = firstRuleBlock(globals, '.site-hero-fullscreen')
    const criticalContent = firstRuleBlock(layout, '.site-hero-content')
    const fullContent = firstRuleBlock(globals, '.site-hero-content')

    for (const [name, block] of [
      ['inline critical hero section', criticalHero],
      ['full hero section', fullHero],
    ] as const) {
      assert.match(block, /min-height:\s*calc\(100vh - var\(--site-header-height\)\);/, `${name} must keep the viewport reservation`)
      assert.match(block, /height:\s*calc\(100vh - var\(--site-header-height\)\);/, `${name} must pin the Lighthouse culprit section height before and after font swap`)
      assert.match(block, /contain-intrinsic-size:\s*calc\(100vh - var\(--site-header-height\)\);/, `${name} must expose matching intrinsic height for CLS attribution`)
    }

    for (const [name, block] of [
      ['inline critical hero content', criticalContent],
      ['full hero content', fullContent],
    ] as const) {
      assert.match(block, /box-sizing:\s*border-box;/, `${name} must include vertical padding inside the reserved fullscreen box`)
      assert.match(block, /min-height:\s*calc\(100vh - var\(--site-header-height\)\);/, `${name} must reserve the same hero content height as the section`)
      assert.match(block, /height:\s*calc\(100vh - var\(--site-header-height\)\);/, `${name} must not grow from web-font metric changes`)
      assert.match(block, /contain-intrinsic-size:\s*calc\(100vh - var\(--site-header-height\)\);/, `${name} must match the section intrinsic reservation`)
    }
  })

  it('keeps desktop header in a single stable row without re-expanding the mobile nav into layout flow', () => {
    const header = read('components/layout/site-header.tsx')
    const globals = read('app/globals.css')

    assert.match(header, /<details[^>]*className="[^"]*site-mobile-nav[^"]*lg:hidden/, 'mobile nav must remain a disclosure, not a visible desktop row')
    assert.match(header, /className="[^"]*data-r10-header-row[^"]*"/, 'header row should carry the R10 stable-row marker')
    assert.match(header, /data-r10-header-row="compact-mobile-stable-desktop"/, 'header row marker should survive production HTML/cache probes')
    assert.match(header, /data-analytics-event="nav_start_click"/, 'nav_start_click analytics must remain intact')

    assert.match(globals, /\.site-mobile-nav-panel\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?\}/, 'mobile menu panel must stay out of document flow to avoid header height CLS')
    assert.match(globals, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*?\.site-mobile-nav\s*\{[\s\S]*?display:\s*none;[\s\S]*?\}/, 'mobile disclosure must not participate in desktop layout')
  })
})
