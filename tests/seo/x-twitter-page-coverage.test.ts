import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')
const readJson = <T>(path: string): T => JSON.parse(read(path)) as T

type GeneratedPage = {
  slug: string
  title: string
  description: string
  updated: string
  status: string
  body: string
  headings: Array<{ text: string }>
}

type GeneratedRoute = {
  slug: string
  title: string
  description: string
  updated: string
  status: string
}

type SearchEntry = {
  type: string
  slug: string
  title: string
  description: string
  headings: string[]
}

const xTwitterPath = '/docs/solutions/x-twitter'
const xTwitterSlug = '/solutions/x-twitter'

describe('X/Twitter solution SEO and AI index coverage', () => {
  it('keeps the new X/Twitter page in generated pages, routes, and search manifests', () => {
    const pages = readJson<GeneratedPage[]>('content-cache/generated/pages-manifest.json')
    const routes = readJson<GeneratedRoute[]>('content-cache/generated/routes-manifest.json')
    const searchIndex = readJson<SearchEntry[]>('content-cache/generated/search-index.json')

    const page = pages.find((item) => item.slug === xTwitterSlug)
    const route = routes.find((item) => item.slug === xTwitterSlug)
    const searchEntry = searchIndex.find((item) => item.type === 'page' && item.slug === xTwitterSlug)

    assert.ok(page, 'pages-manifest must include /solutions/x-twitter')
    assert.ok(route, 'routes-manifest must include /solutions/x-twitter')
    assert.ok(searchEntry, 'search-index must include /solutions/x-twitter')

    for (const item of [page, route, searchEntry]) {
      assert.equal(item.title, 'X/Twitter 内容与互动助手')
      assert.match(item.description, /第三方插件 Hermes Tweet/)
      assert.match(item.description, /非官方内置/)
    }

    assert.equal(page.updated, '2026-05-17')
    assert.equal(route.updated, '2026-05-17')
    assert.equal(page.status, 'published')
    assert.equal(route.status, 'published')
    assert.match(page.body, /Hermes Tweet 是由 \[Xquik-dev]/)
    assert.match(page.body, /不是 Hermes 官方内置功能/)
    assert.match(page.body, /本页最后核验 \| 2026-05-16/)
    assert.ok(searchEntry.headings.some((heading) => heading.includes('X/Twitter 内容与互动助手')))
  })

  it('keeps content overview links and AI index/llms recommendations aligned with the X/Twitter page', () => {
    const pages = readJson<GeneratedPage[]>('content-cache/generated/pages-manifest.json')
    const contentOverview = pages.find((item) => item.slug === '/solutions/content')
    const llmsRoute = read('app/llms.txt/route.ts')
    const aiIndexPage = read('app/ai-index/page.tsx')

    assert.ok(contentOverview, 'content overview must exist')
    assert.equal(contentOverview.updated, '2026-05-16')
    assert.match(contentOverview.body, /当前这一层已经能直接进入 4 套现成方案/)
    assert.match(contentOverview.body, /X\/Twitter 内容与互动助手/)
    assert.match(contentOverview.body, /05-X-Twitter%20/)

    assert.match(llmsRoute, /X\/Twitter 内容与互动助手：https:\/\/hermes-zh\.com\/docs\/solutions\/x-twitter/)
    assert.match(llmsRoute, /Hermes Tweet 第三方插件，不是 Hermes 官方内置功能/)
    assert.match(aiIndexPage, /X\/Twitter 内容与互动助手/)
    assert.match(aiIndexPage, /const xTwitterPath = '\/docs\/solutions\/x-twitter'/)
    assert.match(aiIndexPage, /\['X\/Twitter 内容与互动助手', xTwitterPath,/)
    assert.match(aiIndexPage, /Hermes Tweet 第三方插件，不是 Hermes 官方内置功能/)
  })

  it('renders docs metadata and structured data through the shared docs route', () => {
    const docsPage = read('app/docs/[...slug]/page.tsx')
    const metadata = read('lib/seo/metadata.ts')
    const jsonLd = read('lib/seo/json-ld.tsx')

    assert.match(docsPage, /generateMetadata/)
    assert.match(docsPage, /buildSeoMetadata\({[\s\S]*title: page\.title,[\s\S]*description,[\s\S]*pathname: docPath,[\s\S]*type: 'article'/)
    assert.match(docsPage, /buildTechArticleJsonLd\(page\)/)
    assert.match(docsPage, /buildBreadcrumbJsonLd/)
    assert.match(docsPage, /data-ai-summary="true"/)

    assert.match(metadata, /alternates:[\s\S]*canonical/)
    assert.match(metadata, /openGraph:[\s\S]*url: canonical[\s\S]*title: input\.title[\s\S]*description: input\.description/)
    assert.match(metadata, /twitter:[\s\S]*card: 'summary_large_image'[\s\S]*title: input\.title[\s\S]*description: input\.description/)
    assert.match(jsonLd, /'@type': 'BreadcrumbList'/)
    assert.match(jsonLd, /'@type': 'TechArticle'/)
    assert.equal(xTwitterPath, '/docs/solutions/x-twitter')
  })
})
