import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('R25 Cloudflare field docs template CLS/LCP minimal fix', () => {
  it('scopes generic docs desktop geometry stabilization to only the field-flagged docs pages', () => {
    const docsPage = read('app/docs/[...slug]/page.tsx')
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    for (const slug of ['/docs-overview', '/solutions', '/solutions/xiaohongshu', '/china/entry/feishu']) {
      assert.match(docsPage, new RegExp(`genericDocsDesktopClsStabilizerSlugs[\\s\\S]*?${slug.replaceAll('/', '\\/')}`))
    }

    assert.match(docsPage, /data-doc-desktop-cls-stabilizer=\{docDesktopClsStabilizer\}/)
    assert.match(docsPage, /page\.slug === '\/start' \? 'start' : genericDocsDesktopClsStabilizerSlugs\.has\(page\.slug\) \? 'generic-field' : undefined/)

    for (const source of [layout, globals]) {
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="generic-field"\][\s\S]*?grid-template-columns:\s*280px minmax\(0, 1fr\) 250px;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="generic-field"\][\s\S]*?min-height:\s*1320px;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="generic-field"\][\s\S]*?contain:\s*layout paint;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="generic-field"\] > article[\s\S]*?min-height:\s*640px;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="generic-field"\] \.site-doc-header h1[\s\S]*?content-visibility:\s*visible;[\s\S]*?contain-intrinsic-size:\s*auto;[\s\S]*?min-height:\s*2\.5rem;/)
      assert.match(source, /site-doc-page-grid\[data-doc-desktop-cls-stabilizer="generic-field"\] \.site-doc-header \[data-ai-summary="true"\][\s\S]*?line-height:\s*2rem;/)
    }
  })

  it('adds route-and-asset scoped priority treatment for only the Cloudflare field LCP images', () => {
    const docsPage = read('app/docs/[...slug]/page.tsx')
    const markdownBody = read('components/docs/markdown-body.tsx')
    const globals = read('app/globals.css')

    for (const [slug, asset] of [
      ['/start/practical/home-assistant', 'solution-practical-10-home-assistant-control-loop-v1.webp'],
      ['/start/build/memory-providers/holographic', 'rm2-5-memory-providers-02-holographic-first-route.webp'],
      ['/china/deploy/tencent-lite-server', 'tencent-buy-hermes-agent.webp'],
    ]) {
      assert.match(docsPage, new RegExp(`slug: '${slug.replaceAll('/', '\\/')}', href: '\\/content-assets\\/${asset}'`))
      assert.match(markdownBody, new RegExp(`${slug.replaceAll('/', '\\/')}::${asset}`))
    }

    assert.match(docsPage, /fieldImagePreloads\.map\(\(image\) => \([\s\S]*?<link key=\{image\.href\} rel="preload" as="image" href=\{image\.href\} fetchPriority="high" \/>/)
    assert.match(markdownBody, /const isPriorityMarkdownImage = isDocsStartHeroImage \|\| Boolean\(fieldLcpImage\)/)
    assert.match(markdownBody, /loading=\{isPriorityMarkdownImage \? 'eager' : 'lazy'\}/)
    assert.match(markdownBody, /fetchPriority=\{isPriorityMarkdownImage \? 'high' : 'auto'\}/)
    assert.match(markdownBody, /decoding=\{isPriorityMarkdownImage \? 'sync' : 'async'\}/)
    assert.match(markdownBody, /width=\{imageWidth\}/)
    assert.match(markdownBody, /height=\{imageHeight\}/)
    assert.match(globals, /\.docs-start-lcp-image\s*\{[\s\S]*?content-visibility:\s*visible;[\s\S]*?contain:\s*paint;/)
    assert.match(globals, /\.docs-lcp-image\s*\{[\s\S]*?content-visibility:\s*visible;[\s\S]*?contain:\s*paint;/)
  })
})
