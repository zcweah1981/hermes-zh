import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { buildCanonicalUrl } from '../../lib/seo/canonical'
import { SITE_URL } from '../../lib/site-config'

describe('Canonical URL construction', () => {
  it('adds a trailing slash to the homepage canonical URL', () => {
    const result = buildCanonicalUrl('/')
    assert.equal(result, `${SITE_URL}/`)
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
