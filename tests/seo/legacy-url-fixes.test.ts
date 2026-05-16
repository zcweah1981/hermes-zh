import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const highValueRedirects = [
  { source: '/quick-start.html', destination: '/docs/start' },
  { source: '/models.html', destination: '/docs/china/models' },
  { source: '/team-flow.html', destination: '/docs/solutions' },
  { source: '/docs/quick-start', destination: '/docs/start' },
  { source: '/docs/team-flow', destination: '/docs/solutions' },
  { source: '/docs/china/models.html', destination: '/docs/china/models' },
] as const

describe('SEO R3 legacy Google/Bing URL fixes', () => {
  it('keeps high-value Bing legacy paths as permanent redirects to canonical 200 targets', () => {
    const nextConfig = read('next.config.ts')

    for (const redirect of highValueRedirects) {
      assert.match(
        nextConfig,
        new RegExp(`source:\\s*['"]${escapeRegExp(redirect.source)}['"],\\s*destination:\\s*['"]${escapeRegExp(redirect.destination)}['"]`),
        `${redirect.source} must redirect to ${redirect.destination}`,
      )
    }

    assert.match(nextConfig, /permanent:\s*true/)
  })

  it('does not leak legacy .html paths into sitemap and keeps canonical helper path-normalized', () => {
    const sitemap = read('app/sitemap.ts')
    const canonical = read('lib/seo/canonical.ts')

    for (const redirect of highValueRedirects) {
      assert.doesNotMatch(sitemap, new RegExp(escapeRegExp(redirect.source)))
    }

    assert.match(canonical, /slug === '\/' \? '\/' : slug\.replace/, 'canonical helper should keep root stable before normalizing')
    assert.match(canonical, /slug\.replace\(/, 'canonical helper should remove trailing slash noise except root')
    assert.match(canonical, /buildCanonicalUrl\('\/docs\/china\/models'\)/)
  })

  it('adds index-recovery summaries and durable internal links for discovered-not-indexed docs', () => {
    const metadata = read('lib/seo/metadata.ts')
    const docsPage = read('app/docs/[...slug]/page.tsx')

    assert.match(metadata, /'\/docs\/china\/models'/)
    assert.match(metadata, /国内模型路线/)
    assert.match(metadata, /'\/docs\/solutions'/)
    assert.match(metadata, /团队工作流/)

    for (const href of ['/docs/start', '/docs/solutions', '/docs/china/models', '/packs']) {
      assert.match(docsPage, new RegExp(`href=\\{?['"]${escapeRegExp(href)}['"]`), `${href} must be a visible docs internal link`)
    }

    assert.match(docsPage, /data-seo-internal-links="index-recovery"/)
  })
})
