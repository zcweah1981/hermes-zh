import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('Vercel FOT cache amplification guards', () => {
  it('caches public pages, generated text endpoints, and immutable Next static assets while bypassing API cache by default', () => {
    const vercel = read('vercel.json')

    assert.match(vercel, /"source":\s*"\/\(\(\?!api\/\|_next\/data\/\|fonts\/\|assets\/\|og\//)
    assert.match(vercel, /public, max-age=1800, s-maxage=14400, stale-while-revalidate=7200/)
    assert.match(vercel, /"key":\s*"Vercel-CDN-Cache-Control"/)
    assert.match(vercel, /"source":\s*"\/api\/\(\.\*\)"/)
    assert.match(vercel, /private, no-cache, no-store, max-age=0, must-revalidate/)
    assert.match(vercel, /"source":\s*"\/_next\/static\/\(\.\*\)"/)
    for (const source of ['/_next/static/(.*)', '/content-assets/(.*)', '/fonts/(.*)', '/assets/(.*)', '/og/(.*)', '/hermes-logo.webp']) {
      assert.ok(vercel.includes(`"source": "${source}"`), `missing immutable static header for ${source}`)
    }
    assert.match(vercel, /public, max-age=31536000, immutable/)
  })

  it('caches the Cloudflare Web Analytics mirror path as an immutable static stoploss without weakening API no-store', () => {
    const config = JSON.parse(read('vercel.json')) as {
      headers: { source: string; headers: { key: string; value: string }[] }[]
    }
    const rumRule = config.headers.find((entry) => entry.source === '/cdn-cgi/rum/(.*)')
    const apiRule = config.headers.find((entry) => entry.source === '/api/(.*)')

    assert.ok(rumRule, 'missing first-party Cloudflare RUM mirror cache rule')
    assert.equal(rumRule.headers.find((header) => header.key === 'Cache-Control')?.value, 'public, max-age=31536000, immutable')
    assert.equal(rumRule.headers.find((header) => header.key === 'Vercel-CDN-Cache-Control')?.value, 'public, s-maxage=31536000, immutable')
    assert.equal(apiRule?.headers.find((header) => header.key === 'Cache-Control')?.value, 'private, no-cache, no-store, max-age=0, must-revalidate')
  })

  it('sets explicit Vercel CDN immutable cache headers for T1-confirmed high-FOT static path families', () => {
    const config = JSON.parse(read('vercel.json')) as {
      headers: { source: string; headers: { key: string; value: string }[] }[]
    }
    const highFotStaticSources = ['/content-assets/(.*)', '/fonts/(.*)', '/hermes-logo.webp']

    for (const source of highFotStaticSources) {
      const rule = config.headers.find((entry) => entry.source === source)
      assert.ok(rule, `missing header rule for ${source}`)
      const browserHeader = rule.headers.find((header) => header.key === 'Cache-Control')?.value
      const cdnHeader = rule.headers.find((header) => header.key === 'Vercel-CDN-Cache-Control')?.value
      assert.equal(browserHeader, 'public, max-age=31536000, immutable', `${source} browser cache should stay immutable`)
      assert.equal(cdnHeader, 'public, s-maxage=31536000, immutable', `${source} should explicitly stay immutable at Vercel CDN edge`)
    }
  })

  it('keeps the confirmed uncached /api/search driver as a tiny redirect stoploss instead of an origin JSON payload', () => {
    const route = read('app/api/search/route.ts')
    const searchTrigger = read('components/ui/search-dialog.tsx')
    const searchPage = read('app/search/page.tsx')

    assert.doesNotMatch(route, /from ['"]fs['"]|from ['"]path['"]|readFileSync|search-index\.json/, 'uncached API route must not read or serialize the search index')
    assert.match(route, /NextResponse\.redirect\(redirectUrl, \{[\s\S]*?status:\s*308/, 'legacy API search requests should receive a tiny permanent redirect')
    assert.match(route, /redirectUrl\.pathname = ['"]\/search['"]/, 'redirect target should be the cacheable noindex search page')
    assert.doesNotMatch(searchTrigger, /\/api\/search/, 'visible search entry should not point users at the uncached API route')
    assert.doesNotMatch(searchPage, /\/api\/search|fetch\(/, 'server-rendered search page should not rehydrate through the uncached API route')
  })

  it('does not execute Cloudflare purge within content-auto-sync to avoid redundant Active CPU overhead', () => {
    const workflow = read('.github/workflows/content-auto-sync.yml')

    assert.doesNotMatch(workflow, /id:\s*vercel-deploy/)
    assert.doesNotMatch(workflow, /Purge Cloudflare cache after production deploy/)
    assert.doesNotMatch(workflow, /\/purge_cache/)
  })

  it('does not add timestamp or random cache-busting query parameters in app and component code', () => {
    const files = [
      'app/layout.tsx',
      'components/ui/search-dialog.tsx',
      'components/docs/markdown-body.tsx',
      'lib/content/markdown/link-resolver.ts',
    ]

    for (const file of files) {
      const source = read(file)
      assert.doesNotMatch(source, /Date\.now\(|Math\.random\(|cacheBust|cache-bust|[?&](?:v|t|ts)=/i, `${file} should not inject cache-busting query params`)
    }
  })

  it('keeps direct file proxying, base64 payload embedding, and app-owned streaming endpoints out of the site runtime', () => {
    const runtimeFiles = [
      'app/api/search/route.ts',
      'app/api/revalidate/route.ts',
      'app/llms.txt/route.ts',
      'components/docs/markdown-body.tsx',
    ]

    for (const file of runtimeFiles) {
      const source = read(file)
      assert.doesNotMatch(source, /createReadStream|ReadableStream|text\/event-stream|base64|Buffer\.from\(/i, `${file} should not proxy large files, stream LLM output, or embed base64 payloads`)
    }
  })
})
