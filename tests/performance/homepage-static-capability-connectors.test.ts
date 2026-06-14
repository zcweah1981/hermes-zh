import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('homepage Issue #2.1 static capability connectors', () => {
  it('removes the homepage-specific connector client boundary without touching analytics markers', () => {
    const home = read('app/(marketing)/page.tsx')
    const layout = read('app/layout.tsx')
    const header = read('components/layout/site-header.tsx')

    assert.doesNotMatch(home, /LazyCapabilityConnectorLayer|lazy-capability-connectors/, 'homepage should not import or render the connector client boundary')
    assert.doesNotMatch(home, /dynamic\(|useEffect|useState|requestIdleCallback|ResizeObserver|getBoundingClientRect/, 'homepage connector layer should not depend on client-side geometry measurement')
    assert.match(home, /data-connector-layer="static-svg"/, 'homepage must keep a static connector visual layer')
    assert.match(home, /data-connector-line="top-left"[\s\S]*data-target="left-top"/, 'static SVG must preserve the top-left connector contract')
    assert.match(home, /data-connector-line="top-right"[\s\S]*data-target="right-top"/, 'static SVG must preserve the top-right connector contract')
    assert.match(home, /data-connector-line="middle-left"[\s\S]*data-target="left-middle"/, 'static SVG must preserve the middle-left connector contract')
    assert.match(home, /data-connector-line="middle-right"[\s\S]*data-target="right-middle"/, 'static SVG must preserve the middle-right connector contract')
    assert.match(home, /data-connector-line="bottom-left"[\s\S]*data-target="left-bottom"/, 'static SVG must preserve the bottom-left connector contract')
    assert.match(home, /data-connector-line="bottom-right"[\s\S]*data-target="right-bottom"/, 'static SVG must preserve the bottom-right connector contract')

    assert.match(layout, /id="ga4-idle-loader"[\s\S]*?strategy="lazyOnload"/, 'GA4 idle loader must remain unchanged')
    assert.match(layout, /G-N2Q0TXQDRZ|GA_MEASUREMENT_ID/, 'GA4 marker/config must remain')
    assert.match(header, /data-analytics-event="nav_start_click"/, 'nav_start_click marker must remain')
  })

  it('keeps removed connector modules out of the production source tree', () => {
    assert.ok(!existsSync(join(repoRoot, 'components/marketing/lazy-capability-connectors.tsx')), 'obsolete lazy connector wrapper should be removed')
    assert.ok(!existsSync(join(repoRoot, 'components/marketing/capability-connectors.tsx')), 'obsolete runtime measurement connector should be removed')
  })
})
