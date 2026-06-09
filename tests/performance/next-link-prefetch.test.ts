import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

function nextLinkBlocks(source: string) {
  return Array.from(source.matchAll(/<Link\b[\s\S]*?>/g)).map((match) => match[0])
}

function requireNoPrefetch(blocks: string[], description: string) {
  assert.ok(blocks.length > 0, `${description} should expose at least one route Link`)
  for (const block of blocks) {
    assert.match(block, /prefetch=\{false\}/, `${description} should disable automatic RSC prefetch for: ${block}`)
  }
}

describe('Next Link RSC prefetch guards', () => {
  it('disables automatic prefetch on first-screen header docs links without removing analytics markers', () => {
    const header = read('components/layout/site-header.tsx')
    const headerBlocks = nextLinkBlocks(header).filter((block) =>
      /href=\{item\.href\}|href="\/docs\/start"/.test(block),
    )

    requireNoPrefetch(headerBlocks, 'site header high-fanout docs links')
    assert.match(header, /data-analytics-event=\{item\.analyticsEvent\}/, 'nav analytics events must remain')
    assert.match(header, /data-analytics-event="nav_start_click"/, 'nav_start_click must remain')
  })

  it('disables automatic prefetch on homepage docs route clusters while preserving visible classes and analytics', () => {
    const hero = read('components/marketing/hero.tsx')
    const home = read('app/(marketing)/page.tsx')
    const heroBlocks = nextLinkBlocks(hero).filter((block) => /href="\/docs\//.test(block))
    const homeRouteBlocks = nextLinkBlocks(home).filter((block) =>
      /href=\{item\.href\}|href="\/docs\//.test(block),
    )

    requireNoPrefetch([...heroBlocks, ...homeRouteBlocks], 'homepage docs route clusters')
    assert.match(hero, /className="site-hero-cta-primary"/, 'hero primary CTA visual class must remain')
    assert.match(hero, /className="site-hero-cta-secondary"/, 'hero secondary CTA visual class must remain')
    assert.match(home, /data-analytics-event="home_primary_path_click"/, 'primary path analytics must remain')
    assert.match(home, /data-analytics-event="home_china_landing_click"/, 'china landing analytics must remain')
  })

  it('disables automatic prefetch on footer local route links without changing footer link copy', () => {
    const footer = read('components/layout/site-footer.tsx')
    const footerBlocks = nextLinkBlocks(footer).filter((block) => /href=\{link\.href\}/.test(block))

    requireNoPrefetch(footerBlocks, 'footer local docs links')
    assert.match(footer, /本站入口/, 'footer local links column must remain')
    assert.match(footer, /Hermes Agent 中文站/, 'footer brand copy must remain')
  })
})
