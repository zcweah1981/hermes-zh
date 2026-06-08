import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { buildCanonicalUrl } from '../../lib/seo/canonical'
import { SITE_URL } from '../../lib/site-config'

describe('Canonical URL construction', () => {
  it('adds a trailing slash to the homepage canonical URL', () => {
    const result = buildCanonicalUrl('/')
    assert.equal(result, `${SITE_URL}/`)
  })

  it('keeps the App Router homepage metadata canonical aligned with sitemap loc', () => {
    const layoutSource = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8')
    assert.match(layoutSource, /alternates:\s*{[\s\S]*canonical:\s*buildCanonicalUrl\('\/'\)/)
    assert.doesNotMatch(layoutSource, /canonical:\s*['"]\/['"]/, 'homepage canonical must not use the slashless relative shortcut')
  })

  it('does NOT add a trailing slash to internal doc pages', () => {
    const result = buildCanonicalUrl('/docs/start')
    assert.equal(result, `${SITE_URL}/docs/start`)
  })

  it('normalizes input with existing trailing slashes for non-homepages', () => {
    const result = buildCanonicalUrl('/docs/china/')
    assert.equal(result, `${SITE_URL}/docs/china`)
  })
})
