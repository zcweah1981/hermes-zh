import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'

import { GET as rawAssetGET } from '../../app/api/assets/raw/route'
import { GET as searchGET } from '../../app/api/search/route'
import { GET as llmsGET } from '../../app/llms.txt/route'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

const LLMS_BROWSER_CACHE = 'public, max-age=3600'
const LLMS_CDN_CACHE = 'public, s-maxage=86400, stale-while-revalidate=604800'
const SEARCH_BROWSER_CACHE = 'public, max-age=60'
const SEARCH_CDN_CACHE = 'public, s-maxage=300, stale-while-revalidate=600'

type HeaderRule = {
  source: string
  headers: Array<{ key: string; value: string }>
}

function headerValue(rule: HeaderRule | undefined, key: string) {
  return rule?.headers.find((header) => header.key.toLowerCase() === key.toLowerCase())?.value ?? ''
}

function cacheHeader(rule: HeaderRule | undefined) {
  return headerValue(rule, 'Cache-Control')
}

function cdnCacheHeader(rule: HeaderRule | undefined) {
  return headerValue(rule, 'Vercel-CDN-Cache-Control') || headerValue(rule, 'CDN-Cache-Control')
}

describe('route redirect/cache response contracts', () => {
  it('redirects /api/assets/raw?path=<file> to the stable static asset pathname without preserving the query as destination state', async () => {
    const nextConfig = read('next.config.ts')
    assert.doesNotMatch(
      nextConfig,
      /source:\s*['"]\/api\/assets\/raw\/:path\*['"]/,
      'query-style raw asset URLs must be handled by the route, not by a path-param redirect that preserves ?path=',
    )

    const response = await rawAssetGET(
      new NextRequest('https://hermes-zh.com/api/assets/raw?path=docs/diagram.png'),
    )

    assert.equal(response.status, 308)
    assert.equal(response.headers.get('location'), 'https://hermes-zh.com/content-assets/docs/diagram.png')
    assert.doesNotMatch(response.headers.get('location') ?? '', /\?path=/)
  })

  it('keeps missing or unsafe raw asset path requests on safe 400 responses', async () => {
    const missing = await rawAssetGET(new NextRequest('https://hermes-zh.com/api/assets/raw'))
    const invalid = await rawAssetGET(new NextRequest('https://hermes-zh.com/api/assets/raw?path=../..'))

    assert.equal(missing.status, 400)
    assert.equal(invalid.status, 400)
  })

  it('declares /llms.txt as a dynamic route-handler response with browser cache separated from CDN cache', async () => {
    const source = read('app/llms.txt/route.ts')
    const response = await llmsGET()

    assert.match(source, /export const dynamic = ['"]force-dynamic['"]/, 'hosted Preview must run the route handler instead of a static prerender artifact')
    assert.equal(response.headers.get('cache-control'), LLMS_BROWSER_CACHE)
    assert.equal(response.headers.get('vercel-cdn-cache-control'), LLMS_CDN_CACHE)
    assert.doesNotMatch(response.headers.get('cache-control') ?? '', /s-maxage|stale-while-revalidate/)
  })

  it('declares Vercel platform headers after broader fallbacks so hosted Preview egress is not downgraded', () => {
    const vercel = JSON.parse(read('vercel.json')) as { headers: HeaderRule[] }
    const sources = vercel.headers.map((entry) => entry.source)
    const pageFallbackIndex = sources.findIndex((source) => source.startsWith('/((?!api/'))
    const apiFallbackIndex = sources.indexOf('/api/(.*)')
    const llmsIndex = sources.indexOf('/llms.txt')
    const searchIndex = sources.indexOf('/api/search')
    const llmsCache = cacheHeader(vercel.headers[llmsIndex])
    const searchCache = cacheHeader(vercel.headers[searchIndex])

    assert.notEqual(pageFallbackIndex, -1, 'missing broad page fallback header rule')
    assert.notEqual(apiFallbackIndex, -1, 'missing broad API no-store fallback header rule')
    assert.notEqual(llmsIndex, -1, 'missing explicit /llms.txt platform header rule')
    assert.notEqual(searchIndex, -1, 'missing explicit /api/search platform header rule')
    assert.ok(llmsIndex > pageFallbackIndex, '/llms.txt must be declared after the broad page fallback')
    assert.ok(searchIndex > apiFallbackIndex, '/api/search must be declared after /api/(.*)')
    assert.equal(llmsCache, LLMS_BROWSER_CACHE)
    assert.equal(cdnCacheHeader(vercel.headers[llmsIndex]), LLMS_CDN_CACHE)
    assert.doesNotMatch(llmsCache, /s-maxage|stale-while-revalidate/)
    assert.equal(searchCache, SEARCH_BROWSER_CACHE)
    assert.equal(cdnCacheHeader(vercel.headers[searchIndex]), SEARCH_CDN_CACHE)
    assert.doesNotMatch(searchCache, /s-maxage|stale-while-revalidate|no-store|no-cache|private/)
  })

  it('serves /api/search with browser cache separated from CDN cache', async () => {
    const response = await searchGET(new Request('https://hermes-zh.com/api/search?q=hermes'))

    assert.equal(response.headers.get('cache-control'), SEARCH_BROWSER_CACHE)
    assert.equal(response.headers.get('vercel-cdn-cache-control'), SEARCH_CDN_CACHE)
    assert.doesNotMatch(response.headers.get('cache-control') ?? '', /s-maxage|stale-while-revalidate/)
  })
})
