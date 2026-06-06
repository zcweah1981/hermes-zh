import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { GET as getLlmsText } from '../../app/llms.txt/route'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')
const readJson = <T>(path: string): T => JSON.parse(read(path)) as T

type PageEntry = {
  slug: string
  title: string
  description: string
  status: string
}

type SearchEntry = {
  type: string
  slug: string
  title: string
  description: string
}

function docPath(slug: string) {
  return `/docs${slug}`.replace(/\/docs\/docs-overview$/, '/docs/docs-overview')
}

describe('SEO/GEO discovery surface sync', () => {
  it('exposes every published generated page through llms.txt, ai-index, and search-index markers', async () => {
    const pages = readJson<PageEntry[]>('content-cache/generated/pages-manifest.json')
    const searchIndex = readJson<SearchEntry[]>('content-cache/generated/search-index.json')
    const llmsRoute = await (await getLlmsText()).text()
    const aiIndexPage = read('app/ai-index/page.tsx')

    const publishedPages = pages.filter((page) => page.status === 'published')
    assert.ok(publishedPages.length > 100, 'content-cache must include the synced published content set')

    for (const page of publishedPages) {
      const path = docPath(page.slug)
      const searchEntry = searchIndex.find((entry) => entry.type === 'page' && entry.slug === page.slug)
      assert.ok(page.title.trim().length > 0, `${page.slug} must have a real title`)
      assert.ok(searchEntry, `search-index must include ${page.slug}`)
      assert.ok(searchEntry.description.trim().length > 20, `${page.slug} must have a non-generic search description`)
      assert.match(llmsRoute, new RegExp(`https://hermes-zh\\.com${path.replace(/\//g, '\\/')}`), `llms.txt must include ${path}`)
      assert.match(aiIndexPage, new RegExp(`href=\\{entry\\.href\\}|${path.replace(/\//g, '\\/')}`), `ai-index must render generated link list for ${path}`)
    }
  })

  it('keeps discovery surfaces generated from manifests instead of hand-maintained partial fallback lists', () => {
    const llmsRoute = read('app/llms.txt/route.ts')
    const aiIndexPage = read('app/ai-index/page.tsx')

    assert.match(llmsRoute, /loadPagesManifest/)
    assert.match(llmsRoute, /loadPacksManifest/)
    assert.match(aiIndexPage, /loadPagesManifest/)
    assert.match(aiIndexPage, /loadPacksManifest/)
    assert.doesNotMatch(llmsRoute + aiIndexPage, /const approvedPracticalLinks|const primaryLinks/)
    assert.doesNotMatch(llmsRoute + aiIndexPage, /proof|dispatch|worker|prompt|BLOCKED/i)
  })

  it('keeps docs canonical and BreadcrumbList aligned with the visible breadcrumb UI', () => {
    const docsPage = read('app/docs/[...slug]/page.tsx')

    assert.match(docsPage, /const parentDocPath = toDocPath\(page\.slug\)\.split\('\/'\)\.slice\(0, 3\)\.join\('\/'\) \|\| '\/docs'/)
    assert.match(docsPage, /const parentName = page\.module \|\| '文档'/)
    assert.match(docsPage, /const breadcrumbItems:[\s\S]*\{ name: parentName, url: parentDocPath \}/)
    assert.match(docsPage, /const breadcrumbJsonLd = buildBreadcrumbJsonLd\(\[[\s\S]*\{ name: parentName, url: buildCanonicalUrl\(parentDocPath\) \}/)
    assert.doesNotMatch(docsPage, /\{ name: page\.module, url: `\/docs#\$\{page\.module\}` \}/)
  })
})
