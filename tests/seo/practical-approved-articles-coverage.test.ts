import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')
const readJson = <T>(path: string): T => JSON.parse(read(path)) as T

type GeneratedPage = {
  slug: string
  sourcePath: string
  title: string
  description: string
  status: string
}

type GeneratedRoute = GeneratedPage

type SearchEntry = {
  type: string
  slug: string
  title: string
  description: string
}

const approvedPracticalSlugs = [
  '/start/practical/discord-entry',
  '/start/practical/mcp-universal-plug',
  '/start/practical/ollama-local-model',
  '/start/practical/hermes-ollama-fastest',
  '/start/practical/custom-skills',
  '/start/practical/github-pr-reviewer',
  '/start/practical/hermes-advanced-production',
  '/start/practical/hermes-control-room',
  '/start/practical/60day-analyst-lessons',
  '/start/practical/hermes-deep-dive-build-your-own',
  '/start/practical/security-hardening',
  '/start/practical/voice-mode',
]

describe('approved practical articles SEO/GEO coverage', () => {
  it('keeps all 12 approved practical docs in generated pages, routes, and search manifests', () => {
    const pages = readJson<GeneratedPage[]>('content-cache/generated/pages-manifest.json')
    const routes = readJson<GeneratedRoute[]>('content-cache/generated/routes-manifest.json')
    const searchIndex = readJson<SearchEntry[]>('content-cache/generated/search-index.json')

    for (const slug of approvedPracticalSlugs) {
      const page = pages.find((item) => item.slug === slug)
      const route = routes.find((item) => item.slug === slug)
      const searchEntry = searchIndex.find((item) => item.type === 'page' && item.slug === slug)

      assert.ok(page, `pages-manifest must include ${slug}`)
      assert.ok(route, `routes-manifest must include ${slug}`)
      assert.ok(searchEntry, `search-index must include ${slug}`)
      assert.equal(page.status, 'published')
      assert.equal(route.status, 'published')
      assert.match(page.sourcePath, /^docs\/01-从这开始\/05-实战应用\//)
      assert.ok(page.title.length > 4, `${slug} must keep a real title`)
      assert.ok(page.description.length > 20, `${slug} must keep a useful description`)
    }
  })

  it('exposes the 12 approved practical docs through llms.txt and ai-index without leaking internal proof artifacts', () => {
    const llmsRoute = read('app/llms.txt/route.ts')
    const aiIndexPage = read('app/ai-index/page.tsx')
    const publicSurface = `${llmsRoute}\n${aiIndexPage}`

    for (const slug of approvedPracticalSlugs) {
      const docsPath = `/docs${slug}`
      assert.match(llmsRoute, new RegExp(`https://hermes-zh\\.com${docsPath.replace(/\//g, '\\/')}`))
      assert.match(aiIndexPage, new RegExp(docsPath.replace(/\//g, '\\/')))
    }

    assert.doesNotMatch(publicSurface, /proof|dispatch|worker|prompt|BLOCKED|HERMES-ZH-PRACTICAL-APPROVED-ARTICLES-STRICT-REWORK/i)
  })
})
