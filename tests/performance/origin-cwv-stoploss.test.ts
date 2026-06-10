import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

type HeaderRule = {
  source: string
  headers: Array<{ key: string; value: string }>
}

function headerValue(rule: HeaderRule | undefined, key: string) {
  return rule?.headers.find((header) => header.key.toLowerCase() === key.toLowerCase())?.value ?? ''
}

describe('origin-level CWV stoploss contracts', () => {
  it('keeps high-traffic static pages fully prerendered and cache-only to reduce TTFB/LCP/FCP origin risk', () => {
    const routes = [
      'app/(marketing)/packs/page.tsx',
      'app/search/page.tsx',
      'app/ai-index/page.tsx',
      'app/packs/[id]/page.tsx',
    ]
    const noIsrRoutes = routes.filter((route) => route !== 'app/ai-index/page.tsx')

    for (const route of routes) {
      const source = read(route)
      assert.match(source, /export const dynamic = ['"]force-static['"]/, `${route} must not depend on per-request dynamic rendering`)
      assert.match(source, /export const fetchCache = ['"]force-cache['"]/, `${route} should not opt into per-request origin reads`)
    }

    for (const route of noIsrRoutes) {
      const source = read(route)
      assert.match(source, /export const revalidate = false/, `${route} must not schedule ISR regeneration for unchanged generated content`)
    }
  })

  it('uses React cache for generated manifest reads so metadata and page render share one filesystem read per request/build pass', () => {
    const loader = read('lib/content/loaders/read-generated-json.ts')

    assert.match(loader, /import \{ cache \} from ['"]react['"]/, 'generated JSON loader should use React cache')
    assert.match(loader, /export const readGeneratedJson = cache\(/, 'readGeneratedJson should be wrapped in cache()')
    assert.match(loader, /fs\.readFile/, 'loader must still read the generated local JSON source of truth')
  })

  it('separates browser cache and Vercel CDN cache for public HTML fallbacks instead of putting CDN-only directives in Cache-Control', () => {
    const vercel = JSON.parse(read('vercel.json')) as { headers: HeaderRule[] }
    const fallback = vercel.headers.find((entry) => entry.source.startsWith('/((?!api/'))

    assert.ok(fallback, 'missing broad public HTML fallback cache rule')
    assert.equal(headerValue(fallback, 'Cache-Control'), 'public, max-age=1800')
    assert.equal(headerValue(fallback, 'Vercel-CDN-Cache-Control'), 'public, s-maxage=14400, stale-while-revalidate=7200')
    assert.doesNotMatch(headerValue(fallback, 'Cache-Control'), /s-maxage|stale-while-revalidate|private|no-store|no-cache/)
  })
})
