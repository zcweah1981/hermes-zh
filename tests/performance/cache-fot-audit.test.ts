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
    assert.match(vercel, /public, max-age=1800, s-maxage=7200, stale-while-revalidate=3600/)
    assert.match(vercel, /"source":\s*"\/api\/\(\.\*\)"/)
    assert.match(vercel, /private, no-cache, no-store, max-age=0, must-revalidate/)
    assert.match(vercel, /"source":\s*"\/_next\/static\/\(\.\*\)"/)
    for (const source of ['/_next/static/(.*)', '/fonts/(.*)', '/assets/(.*)', '/og/(.*)', '/hermes-logo.png']) {
      assert.ok(vercel.includes(`"source": "${source}"`), `missing immutable static header for ${source}`)
    }
    assert.match(vercel, /public, max-age=31536000, immutable/)
  })

  it('keeps search API responses edge-cacheable and bounded to reduce repeated origin reads and JSON payload amplification', () => {
    const route = read('app/api/search/route.ts')

    assert.match(route, /s-maxage=300/)
    assert.match(route, /stale-while-revalidate=600/)
    assert.match(route, /let cachedIndex:/)
    assert.match(route, /slice\(0, 64\)/)
    assert.match(route, /q\.length < 2/)
    assert.match(route, /\.slice\(0, 20\)/)
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
