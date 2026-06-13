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
      assert.match(block, /line-height:\s*1\.28;/, `${name} should keep the desktop line-height stable before and after full CSS loads`)
      assert.match(block, /min-height:\s*calc\(82px \* 1\.28 \+ 1\.25rem\);/, `${name} should reserve the one-line desktop h1 box plus existing descender padding`)
      assert.match(block, /contain-intrinsic-size:\s*calc\(82px \* 1\.28 \+ 1\.25rem\);/, `${name} should expose an intrinsic size guard for lab CLS`)
    }

    assert.match(layout, /@media \(min-width:\s*768px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?font-size:\s*82px;[\s\S]*?line-height:\s*1\.28;[\s\S]*?min-height:\s*calc\(82px \* 1\.28 \+ 1\.25rem\);[\s\S]*?\}/, 'desktop critical override should not only set font-size; it must also reserve line-box height')
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
