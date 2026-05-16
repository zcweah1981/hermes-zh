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

  it('purges Cloudflare cache only after content-auto-sync production deploy succeeds', () => {
    const workflow = read('.github/workflows/content-auto-sync.yml')

    assert.match(workflow, /id:\s*vercel-deploy/)
    assert.match(workflow, /Purge Cloudflare cache after production deploy/)
    assert.match(workflow, /if:\s*steps\.vercel-deploy\.outcome == 'success'/)
    assert.match(workflow, /CLOUDFLARE_API_TOKEN:\s*\$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/)
    assert.match(workflow, /CLOUDFLARE_ZONE_ID:\s*\$\{\{ secrets\.CLOUDFLARE_ZONE_ID \}\}/)
    assert.match(workflow, /\/purge_cache/)
    assert.match(workflow, /content-cache\/generated\/routes-manifest\.json/)
    assert.match(workflow, /content-cache\/generated\/packs-manifest\.json/)
    assert.doesNotMatch(workflow, /purge_everything\s*:\s*true/)
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
