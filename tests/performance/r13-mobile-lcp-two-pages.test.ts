import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('R13 mobile LCP stoploss for home and /docs/start only', () => {
  it('keeps the mobile homepage LCP heading off the blocking Chinese webfont path while preserving desktop hero CSS', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    for (const source of [layout, globals]) {
      assert.match(
        source,
        /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?font-family:\s*system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;/,
        'mobile critical/full CSS should let the LCP H1 paint with system UI fonts instead of waiting on /fonts/noto-sans-sc.woff2',
      )
    }

    assert.match(
      globals,
      /\.site-hero-title\s*\{[\s\S]*?font-family:\s*'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;/,
      'desktop/tablet hero typography contract must remain unchanged outside the mobile override',
    )
  })

  it('prevents /docs/start mobile LCP from being attributed to the client sidebar rail before article content', () => {
    const docsPage = read('app/docs/[...slug]/page.tsx')
    const sidebar = read('components/docs/doc-sidebar.tsx')

    assert.match(
      docsPage,
      /<DocSidebar[\s\S]*?className="[^"]*order-2[^"]*xl:order-none[^"]*"/,
      'mobile docs route should render article before the sidebar rail; desktop xl grid order must remain unchanged',
    )
    assert.match(
      sidebar,
      /export function DocSidebar\(\{ items, currentSlug, className = '' \}: \{ items: DocSidebarItem\[\]; currentSlug: string; className\?: string \}\)/,
      'DocSidebar should accept a scoped layout class from the docs route instead of changing desktop sticky/scroll behavior',
    )
    assert.match(sidebar, /className=\{`site-panel-docs site-doc-sidebar-shell p-4 lg:p-5 \$\{className\}`\.trim\(\)\}/)
  })

  it('keeps required analytics and official beacons intact', () => {
    const layout = read('app/layout.tsx')
    const header = read('components/layout/site-header.tsx')

    assert.match(layout, /G-N2Q0TXQDRZ/)
    assert.match(layout, /id="ga4-idle-loader"[\s\S]*?strategy="lazyOnload"/)
    assert.match(layout, /src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"/)
    assert.match(header, /data-analytics-event="nav_start_click"/)
  })
})
