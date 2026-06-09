import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('first-screen JavaScript budget', () => {
  it('keeps analytics out of the first-screen React client bundle and defers third-party scripts', () => {
    const layout = read('app/layout.tsx')

    assert.doesNotMatch(layout, /AnalyticsEvents/, 'root layout should not import or render a React analytics client component')
    assert.match(layout, /id="hermes-analytics-events"/, 'root layout should still install the delegated analytics bridge')
    assert.match(layout, /dangerouslySetInnerHTML/, 'analytics bridge should be an inline script, not a hydrated component')
    assert.match(layout, /id="ga4-gtag-js"[\s\S]*?strategy="lazyOnload"/, 'GA4 network loader should be delayed until browser idle to reduce mobile TBT')
    assert.match(layout, /id="ga4-gtag-config"[\s\S]*?strategy="afterInteractive"/, 'GA4 dataLayer stub should stay early enough to queue nav_start_click before the lazy loader')
    assert.match(layout, /id="hermes-analytics-events"[\s\S]*?strategy="lazyOnload"/, 'delegated CTA bridge should remain delayed because it is non-critical and avoids React hydration')
    assert.match(layout, /window\.gtag\('event', detail\.event/, 'delegated bridge should forward stable CTA events to GA4 when the lazy loader is ready')
    assert.match(layout, /id="cloudflare-web-analytics"[\s\S]*?strategy="lazyOnload"/, 'Cloudflare analytics should remain delayed')
    assert.match(layout, /gtag\('config', '\$\{GA_MEASUREMENT_ID\}'\)/, 'GA4 config event must not be removed')
    assert.ok(!existsSync(join(repoRoot, 'components/analytics/analytics-events.tsx')), 'obsolete React analytics component should be removed')
  })

  it('renders the site header and search entry as server-only first-screen markup', () => {
    const shell = read('components/layout/site-shell.tsx')
    const header = read('components/layout/site-header.tsx')
    const footer = read('components/layout/site-footer.tsx')
    const searchTrigger = read('components/ui/search-dialog.tsx')

    assert.doesNotMatch(header, /'use client'/, 'site header should remain a server component')
    assert.doesNotMatch(header, /usePathname|ActiveNavLinks|next\/navigation/, 'header navigation should not hydrate only to compute active pathname')
    assert.match(header, /navItems\.map/, 'header should render nav links directly on the server')

    assert.doesNotMatch(shell, /SearchDialogRoot/, 'site shell should not hydrate a global search React root on every page')
    assert.doesNotMatch(searchTrigger, /'use client'|useEffect|useState|useTransition|fetch\(/, 'closed search entry should stay static')
    assert.match(searchTrigger, /href="\/search"/, 'search entry should keep search reachable without first-screen hydration')
    assert.match(searchTrigger, /data-search-trigger="true"/, 'search trigger must keep a stable DOM marker')
    assert.ok(!existsSync(join(repoRoot, 'components/ui/search-dialog-root.tsx')), 'obsolete global search root should be removed')
    assert.ok(!existsSync(join(repoRoot, 'components/ui/search-dialog-panel.tsx')), 'obsolete lazy search panel should be removed')

    for (const source of [header, footer]) {
      assert.doesNotMatch(source, /priority(?:=\{true\})?/, 'small logo images should not emit a first-screen preload that competes with mobile CSS/text')
      assert.doesNotMatch(source, /fetchPriority=["']high["']/, 'small logo images should not request high fetch priority')
      assert.match(source, /src="\/hermes-logo\.webp"/, 'logo visual asset URL should remain unchanged')
      assert.match(source, /className="h-(?:11|10) w-(?:11|10) object-contain"/, 'logo displayed dimensions/classes should remain unchanged')
    }
  })
})
