import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

function assertFile(path: string) {
  assert.ok(existsSync(join(repoRoot, path)), `${path} must exist`)
  return read(path)
}

describe('SEO-GEO-C no-token SEO and GEO contract', () => {
  it('ships llms.txt and ai-index as first-class public GEO entrypoints', () => {
    const llmsRoute = assertFile('app/llms.txt/route.ts')
    const aiIndexPage = assertFile('app/ai-index/page.tsx')

    assert.match(llmsRoute, /Hermes Agent 中文站/)
    assert.match(llmsRoute, /不是 Hermès/)
    assert.match(llmsRoute, /不是 Nous Research 官方文档镜像站/)
    assert.match(llmsRoute, /awesome-hermes-agent-zh/)
    assert.match(llmsRoute, /https:\/\/hermes-zh\.com\/ai-index/)
    assert.match(aiIndexPage, /data-ai-summary="true"/)
    assert.match(aiIndexPage, /AI 引用索引/)
    assert.match(aiIndexPage, /不是 Hermès 奢侈品牌网站/)
    assert.match(aiIndexPage, /Packs 是什么/)
    assert.doesNotMatch(aiIndexPage + llmsRoute, /VFIX|proof|dispatch|构建驱动的半自动同步|site-content-anchor|content-cache|generated manifest|revalidate/)
  })

  it('centralizes metadata, default OG image, description fallback, and JSON-LD helpers', () => {
    const metadata = assertFile('lib/seo/metadata.ts')
    const jsonLd = assertFile('lib/seo/json-ld.tsx')

    assert.match(metadata, /DEFAULT_OG_IMAGE/)
    assert.match(metadata, /hermes-zh-og\.png/)
    assert.match(metadata, /buildSeoMetadata/)
    assert.match(metadata, /getEffectiveDescription/)
    assert.match(metadata, /getDocsSeoDescription/)
    assert.match(metadata, /summary\.trim\(\)\.length >= 50/)
    assert.match(metadata, /这一页只解决一件事/)
    assert.match(jsonLd, /application\/ld\+json/)
    assert.match(jsonLd, /WebSite/)
    assert.match(jsonLd, /Organization/)
    assert.match(jsonLd, /BreadcrumbList/)
    assert.match(jsonLd, /TechArticle/)
    assert.match(jsonLd, /FAQPage/)
    assert.match(jsonLd, /SoftwareSourceCode/)
  })

  it('injects JSON-LD and page-specific metadata across layout docs packs and ai-index', () => {
    const layout = read('app/layout.tsx')
    const docsPage = read('app/docs/[...slug]/page.tsx')
    const packsPage = read('app/(marketing)/packs/page.tsx')
    const packDetail = read('app/packs/[id]/page.tsx')
    const aiIndexPage = read('app/ai-index/page.tsx')

    assert.match(layout, /SiteJsonLd/)
    assert.match(layout, /buildWebSiteJsonLd/)
    assert.match(layout, /buildOrganizationJsonLd/)
    assert.match(layout, /images:/)
    assert.match(layout, /DEFAULT_OG_IMAGE/)

    assert.match(docsPage, /buildSeoMetadata/)
    assert.match(docsPage, /getDocsSeoDescription\(page, docPath\)/)
    assert.doesNotMatch(docsPage, /corePageSeo\?\.description \?\? getEffectiveDescription\(page\)/)
    assert.match(docsPage, /CORE_PAGE_SEO\[docPath\] \? getCorePageSeo\(docPath\) : null/)
    assert.match(docsPage, /buildTechArticleJsonLd/)
    assert.match(docsPage, /buildBreadcrumbJsonLd/)
    assert.match(docsPage, /data-ai-summary="true"/)

    assert.match(packsPage, /buildSeoMetadata/)
    assert.match(packsPage, /buildCollectionPageJsonLd/)
    assert.match(packDetail, /buildSoftwareSourceCodeJsonLd/)
    assert.match(packDetail, /buildBreadcrumbJsonLd/)
    assert.match(packDetail, /getPackSeoDescription/)
    assert.match(aiIndexPage, /buildWebPageJsonLd/)
  })

  it('keeps sitemap and robots direct, crawlable, and inclusive of GEO endpoints', () => {
    const sitemap = read('app/sitemap.ts')
    const robots = read('app/robots.ts')

    assert.match(sitemap, /'\/llms.txt'/)
    assert.match(sitemap, /'\/ai-index'/)
    assert.match(sitemap, /lastModified:/)
    assert.doesNotMatch(sitemap, /sitemapIndex/i)
    assert.match(robots, /Sitemap/)
    assert.match(robots, /Allow/)
  })
})
