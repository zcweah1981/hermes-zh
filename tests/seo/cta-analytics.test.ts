import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

const homePageSource = read('app/(marketing)/page.tsx')
const heroSource = read('components/marketing/hero.tsx')
const headerSource = read('components/layout/site-header.tsx')
const packDetailSource = read('app/packs/[id]/page.tsx')
const layoutSource = read('app/layout.tsx')
const analyticsComponentPath = join(repoRoot, 'components/analytics/analytics-events.tsx')

describe('core CTA analytics markers', () => {
  it('loads a lightweight click analytics entrypoint from the root layout', () => {
    assert.ok(existsSync(analyticsComponentPath), 'analytics event client component should exist')
    const analyticsSource = read('components/analytics/analytics-events.tsx')

    assert.match(analyticsSource, /'use client'/)
    assert.match(analyticsSource, /addEventListener\(['"]click['"]/, 'click listener should be delegated')
    assert.match(analyticsSource, /closest\(['"]\[data-analytics-event\]['"]\)/, 'listener should use stable data-analytics markers')
    assert.match(analyticsSource, /CustomEvent\(['"]hermes:analytics['"]/, 'listener should emit a local custom event for downstream hooks')
    assert.doesNotMatch(analyticsSource, /navigator\.sendBeacon|fetch\(/, 'lightweight entrypoint should not send PII or call a new tracking endpoint')

    assert.match(layoutSource, /AnalyticsEvents/)
    assert.match(layoutSource, /<AnalyticsEvents\s*\/>/)
  })

  it('marks homepage hero, docs, packs, github, and china CTAs with stable analytics attributes', () => {
    const source = [homePageSource, heroSource, headerSource, packDetailSource].join('\n')
    const expectedEvents = [
      'hero_start_click',
      'hero_docs_overview_click',
      'hero_github_click',
      'nav_packs_click',
      'nav_github_click',
      'nav_start_click',
      'home_primary_path_click',
      'home_china_landing_click',
      'home_content_repo_click',
      'pack_install_click',
      'pack_download_click',
    ]

    assert.match(source, /data-analytics-event=/)
    assert.match(source, /data-analytics-label=/)
    assert.match(source, /data-analytics-destination=/)
    assert.match(source, /data-analytics-section=/)

    for (const eventName of expectedEvents) {
      assert.match(source, new RegExp(`['\"]${eventName}['\"]`), `${eventName} stable event name should exist`)
    }

    assert.doesNotMatch(source, /data-analytics-user|data-analytics-email|data-analytics-token/)
  })
})
