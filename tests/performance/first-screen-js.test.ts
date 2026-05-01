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

  it('renders the site header as a server component without pathname hydration', () => {
    const header = read('components/layout/site-header.tsx')

    assert.doesNotMatch(header, /'use client'/, 'site header should remain a server component')
    assert.doesNotMatch(header, /usePathname|ActiveNavLinks|next\/navigation/, 'header navigation should not hydrate only to compute active pathname')
    assert.match(header, /navItems\.map/, 'header should render nav links directly on the server')
  })
})
