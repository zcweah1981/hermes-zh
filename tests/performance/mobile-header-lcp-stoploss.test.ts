import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('R9 mobile header overflow and FCP/LCP stoploss', () => {
  it('collapses low-priority header navigation behind a native mobile menu without losing key links or analytics', () => {
    const header = read('components/layout/site-header.tsx')
    const globals = read('app/globals.css')

    assert.match(header, /<details[^>]*className="[^"]*site-mobile-nav/, 'mobile header should use native details/summary instead of rendering the full nav row first-screen')
    assert.match(header, /<summary[^>]*aria-label="打开移动端导航"/, 'mobile menu must have an accessible label')
    assert.match(header, /className="[^"]*hidden[^"]*lg:flex/, 'desktop nav must remain available without the mobile disclosure')
    assert.match(header, /className="[^"]*flex[^"]*min-w-0[^"]*flex-1[^"]*items-center/, 'brand row should be allowed to shrink instead of forcing header overflow')
    assert.match(header, /className="[^"]*site-icon-link hidden min-\[360px\]:inline-flex/, 'lowest-priority GitHub icon should hide on ultra-narrow mobile while remaining reachable from wider mobile/header desktop')
    assert.match(header, /data-analytics-event="nav_start_click"/, 'primary nav_start_click analytics must not be removed')

    for (const label of ['从这开始', '现成方案', '国内落地', '从 OpenClaw 过来', '参考手册', 'Packs']) {
      assert.match(header, new RegExp(`label: '${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`), `missing nav label source: ${label}`)
    }

    assert.match(globals, /\.site-mobile-nav\s*\{[\s\S]*?max-width:\s*100%;[\s\S]*?\}/, 'mobile disclosure should be width-bound')
    assert.match(globals, /\.site-mobile-nav-panel\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?width:\s*min\(calc\(100vw - 1\.5rem\), 21rem\);[\s\S]*?\}/, 'mobile menu panel should overlay within the viewport instead of adding header height or horizontal scroll')
    assert.match(globals, /\.site-mobile-nav-panel\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?\}/, 'mobile menu should wrap links in a bounded grid, not a wide row')
    assert.match(globals, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*?\.site-mobile-nav\s*\{[\s\S]*?display:\s*none[\s\S]*?\}/, 'mobile disclosure must stay out of desktop layout')
  })

  it('keeps mobile hero critical CSS tighter and synchronized between inline critical CSS and globals', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    for (const source of [layout, globals]) {
      assert.match(source, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-fullscreen\s*\{[\s\S]*?min-height:\s*calc\(100svh - var\(--site-header-height\)\)/, 'mobile hero should use svh in both critical and full CSS')
      assert.match(source, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?font-size:\s*clamp\(2rem, 13\.5vw, 3\.25rem\)/, 'mobile LCP title should use the tighter R9 clamp in both critical and full CSS')
      assert.match(source, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?line-height:\s*1\.12/, 'mobile LCP title line-height should be synchronized')
    }

    assert.match(layout, /\.site-hero-title\s*\{[\s\S]*?font-family:\s*'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;/, 'inline critical LCP title should use the already-needed UI font family')
    assert.match(read('components/marketing/hero.tsx'), /className="site-hero-title[^\"]*font-sans/, 'homepage LCP title should not trigger the decorative serif face on the mobile critical path')
  })
})
