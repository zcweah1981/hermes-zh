import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('docs RSC payload projection stoploss', () => {
  it('keeps docs route static while passing only light navigation/link projections across render boundaries', () => {
    const pageSource = read('app/docs/[...slug]/page.tsx')

    assert.match(pageSource, /export const dynamic = ['"]force-static['"]/, 'docs catch-all must remain static')
    assert.match(pageSource, /export const dynamicParams = false/, 'docs catch-all must not allow runtime fallback params')
    assert.match(pageSource, /export const revalidate = false/, 'docs catch-all must not schedule ISR regeneration')
    assert.match(pageSource, /export const fetchCache = ['"]force-cache['"]/, 'docs catch-all should not opt into per-request origin reads')
    assert.doesNotMatch(pageSource, /<DocSidebar\s+pages=\{pages\}/, 'DocSidebar must not receive full SitePage[] across the client boundary')
    assert.doesNotMatch(pageSource, /<MarkdownBody\s+page=\{page\}\s+pages=\{pages\}/, 'MarkdownBody must not receive full SitePage[] when only link resolution fields are needed')
    assert.match(pageSource, /<DocSidebar\s+items=\{sidebarItems\}/, 'docs route should pass a lightweight sidebar projection')
    assert.match(pageSource, /<MarkdownBody\s+page=\{page\}\s+linkTargets=\{linkTargets\}/, 'docs route should pass a lightweight link projection')
  })

  it('defines sidebar and markdown link projections without large content/SEO fields', () => {
    const projectionSource = read('lib/docs/docs-page-projections.ts')

    assert.match(projectionSource, /export type DocSidebarItem = Pick<SitePage, 'sourcePath' \| 'slug' \| 'title' \| 'module' \| 'order'>/)
    assert.match(projectionSource, /export type DocLinkTarget = Pick<SitePage, 'sourcePath' \| 'slug'>/)
    assert.doesNotMatch(projectionSource, /body|description|githubUrl|headings|prev|next/, 'projection types must not include large content, SEO, or prev/next fields')
  })
})
