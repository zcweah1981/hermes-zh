import * as assert from 'assert'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()

function read(path: string) {
  return readFileSync(join(repoRoot, path), 'utf8')
}

function exists(path: string) {
  return existsSync(join(repoRoot, path))
}

function size(path: string) {
  return statSync(join(repoRoot, path)).size
}

describe('font loading and visual fidelity', () => {
  it('does not use runtime Google Fonts or gstatic font hosts', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    assert.doesNotMatch(layout, /fonts\.googleapis\.com|fonts\.gstatic\.com/i)
    assert.doesNotMatch(globals, /fonts\.googleapis\.com|fonts\.gstatic\.com/i)
    assert.doesNotMatch(globals, /@import\s+url\(['"]?https?:\/\//i)
    assert.doesNotMatch(layout, /<link[^>]+rel="stylesheet"/, 'layout should not add a manual runtime font stylesheet')
  })

  it('defines self-hosted Noto Sans SC and Noto Serif SC font faces in site CSS', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    assert.doesNotMatch(layout, /from ['"]next\/font\/google['"]/, 'build should not depend on Google font downloads')
    assert.match(globals, /font-family:\s*'Noto Sans SC'/, 'site CSS should define Noto Sans SC')
    assert.match(globals, /font-family:\s*'Noto Serif SC'/, 'site CSS should define Noto Serif SC')
    assert.match(globals, /url\('\/fonts\/noto-sans-sc\.woff2'\) format\('woff2'\)/, 'Noto Sans SC should resolve to a local woff2 asset')
    assert.match(globals, /url\('\/fonts\/noto-serif-sc\.woff2'\) format\('woff2'\)/, 'Noto Serif SC should resolve to a local woff2 asset')
    assert.match(globals, /font-display:\s*(swap|block);/, 'self-hosted fonts should avoid blocking text rendering')
  })

  it('keeps self-hosted CJK font faces for visual fidelity without high-priority full-font preloads', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    assert.doesNotMatch(layout, /href="\/fonts\/noto-sans-sc\.woff2"[\s\S]{0,220}?rel="preload"|rel="preload"[\s\S]{0,220}?href="\/fonts\/noto-sans-sc\.woff2"/, 'full Noto Sans SC must not be preloaded on the mobile critical path')
    assert.doesNotMatch(layout, /href="\/fonts\/noto-serif-sc\.woff2"[\s\S]{0,220}?rel="preload"|rel="preload"[\s\S]{0,220}?href="\/fonts\/noto-serif-sc\.woff2"/, 'full Noto Serif SC must not be preloaded on the mobile critical path')
    assert.match(globals, /font-family:\s*'Noto Sans SC'/, 'Noto Sans SC font-face stays available for final visual fidelity')
    assert.match(globals, /font-family:\s*'Noto Serif SC'/, 'Noto Serif SC font-face stays available for final visual fidelity')
  })

  it('optimizes long content rendering with content-visibility', () => {
    const globals = read('app/globals.css')
    assert.match(globals, /\[data-home-section="primary-paths"\]\s*\{[\s\S]*?content-visibility:\s*auto/, 'homepage primary paths should use content-visibility')
    assert.match(globals, /\[data-home-section="evolving-assistant"\]\s*\{[\s\S]*?content-visibility:\s*auto/, 'homepage infographic should use content-visibility')
    assert.match(globals, /\.site-doc-sidebar\s*\{[\s\S]*?content-visibility:\s*auto/, 'doc sidebar should use content-visibility')
    assert.doesNotMatch(globals, /\.site-hero-fullscreen\s*\{[^}]*?content-visibility:\s*auto/, 'hero must not use content-visibility to avoid LCP delay')
  })

  it('uses lazy loading strategy for non-critical third-party and analytics scripts', () => {
    const layout = read('app/layout.tsx')
    assert.match(layout, /id="cloudflare-web-analytics"[^>]+strategy="lazyOnload"/, 'Cloudflare beacon should use lazyOnload')
    assert.match(layout, /id="hermes-analytics-events"[^>]+strategy="lazyOnload"/, 'Hermes internal analytics should use lazyOnload')
  })

  it('commits the local font binaries used by the stylesheet', () => {
    assert.equal(exists('public/fonts/noto-sans-sc.woff2'), true)
    assert.equal(exists('public/fonts/noto-serif-sc.woff2'), true)
    assert.ok(size('public/fonts/noto-sans-sc.woff2') > 10_000, 'Noto Sans SC font binary should not be an empty placeholder')
    assert.ok(size('public/fonts/noto-serif-sc.woff2') > 10_000, 'Noto Serif SC font binary should not be an empty placeholder')
  })

  it('defines CSS font variables used by custom homepage selectors', () => {
    const globals = read('app/globals.css')
    const tailwind = read('tailwind.config.ts')

    assert.match(tailwind, /sans: \['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'\]/, 'Chinese UI should prefer Noto Sans SC')
    assert.match(tailwind, /serif: \['Noto Serif SC', 'Songti SC', 'serif'\]/, 'large hero/homepage headings should prefer Noto Serif SC')
    assert.match(tailwind, /mono: \['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'monospace'\]/, 'code blocks should keep JetBrains Mono first')
    assert.match(globals, /--font-noto-sans-sc:\s*'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;/)
    assert.match(globals, /--font-noto-serif-sc:\s*'Noto Serif SC', 'Songti SC', serif;/)
    assert.match(globals, /--font-jetbrains-mono:\s*'JetBrains Mono', 'Fira Code', 'SFMono-Regular', monospace;/)
    assert.doesNotMatch(globals, /var\(--font-noto-serif-sc\), serif/, 'custom selectors should not fall back because of an undefined font variable')
  })
})
