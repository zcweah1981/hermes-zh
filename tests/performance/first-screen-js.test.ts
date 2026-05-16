import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('first-screen JavaScript budget', () => {
  it('keeps the global analytics click bridge out of the React client bundle', () => {
    const layout = read('app/layout.tsx')

    assert.doesNotMatch(layout, /AnalyticsEvents/, 'root layout should not import or render a React analytics client component')
    assert.match(layout, /id="hermes-analytics-events"/, 'root layout should still install the delegated analytics bridge')
    assert.match(layout, /dangerouslySetInnerHTML/, 'analytics bridge should be an inline afterInteractive script, not a hydrated component')
    assert.ok(!existsSync(join(repoRoot, 'components/analytics/analytics-events.tsx')), 'obsolete React analytics component should be removed')
  })

  it('renders the site header and search entry as server-only first-screen markup', () => {
    const shell = read('components/layout/site-shell.tsx')
    const header = read('components/layout/site-header.tsx')
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
  })
})
