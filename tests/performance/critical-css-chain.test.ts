import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('mobile critical CSS chain', () => {
  it('inlines the single critical CSS asset to remove the mobile render-blocking stylesheet request', () => {
    const nextConfig = read('next.config.ts')

    assert.match(
      nextConfig,
      /experimental:\s*\{[\s\S]*?inlineCss:\s*true[\s\S]*?\}/,
      'Next.js app-router production build should inline imported CSS instead of emitting a blocking <link rel="stylesheet"> on first paint',
    )
  })

  it('preserves R13 GA4 idle loading and delegated nav_start_click analytics contracts', () => {
    const layout = read('app/layout.tsx')
    const header = read('components/layout/site-header.tsx')

    assert.match(layout, /id="ga4-idle-loader"[\s\S]*?strategy="lazyOnload"/)
    assert.match(layout, /window\.setTimeout\(loadGtag, 12000\)/)
    assert.match(layout, /id="ga4-gtag-config"[\s\S]*?strategy="afterInteractive"/)
    assert.match(layout, /window\.gtag\('event', detail\.event/)
    assert.match(header, /data-analytics-event="nav_start_click"/)
  })
})
