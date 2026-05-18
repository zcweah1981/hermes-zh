import * as assert from 'assert'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')
const sizeOf = (path: string) => statSync(join(repoRoot, path)).size
const pngDimensions = (path: string) => {
  const png = readFileSync(join(repoRoot, path))
  assert.equal(png.toString('ascii', 1, 4), 'PNG', `${path} must remain a PNG file`)
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}

describe('desktop no-style performance regression guard', () => {
  it('keeps metadata icons compressed without changing their published dimensions', () => {
    assert.deepEqual(pngDimensions('app/icon.png'), { width: 512, height: 512 })
    assert.deepEqual(pngDimensions('app/apple-icon.png'), { width: 180, height: 180 })
    assert.ok(sizeOf('app/icon.png') <= 96 * 1024, 'metadata icon.png should stay <= 96KB')
    assert.ok(sizeOf('app/apple-icon.png') <= 32 * 1024, 'apple touch icon should stay <= 32KB')
  })

  it('preserves first-screen markers and analytics entry points while optimizing hydration', () => {
    const layout = read('app/layout.tsx')
    const header = read('components/layout/site-header.tsx')
    const searchTrigger = read('components/ui/search-dialog.tsx')

    assert.match(layout, /<Analytics \/>/, 'Vercel Analytics must remain mounted')
    assert.match(layout, /id="cloudflare-web-analytics"/, 'Cloudflare Web Analytics script marker must remain')
    assert.match(layout, /id="hermes-analytics-events"/, 'delegated analytics bridge must remain')
    assert.match(layout, /window\.dispatchEvent\(new CustomEvent\('hermes:analytics'/, 'analytics custom event semantic must remain')

    assert.match(header, /data-analytics-event="nav_start_click"/, 'primary nav start marker must remain')
    assert.match(header, /打开 GitHub 真相源/, 'GitHub entry label must remain')
    assert.match(header, /data-analytics-event="nav_github_click"/, 'GitHub analytics marker must remain')

    assert.match(searchTrigger, /data-search-trigger="true"/, 'search trigger marker must remain')
    assert.match(searchTrigger, /href="\/search"/, 'search trigger must keep a no-JS fallback')
    assert.doesNotMatch(searchTrigger, /'use client'|useEffect|useState|fetch\(/, 'closed search trigger must not hydrate first-screen React code')
  })

  it('does not reintroduce runtime Google Fonts or next/font/google', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    assert.doesNotMatch(layout, /fonts\.googleapis\.com|fonts\.gstatic\.com|next\/font\/google/i)
    assert.doesNotMatch(globals, /fonts\.googleapis\.com|fonts\.gstatic\.com|@import\s+url\(['"]?https?:\/\//i)
  })
})
