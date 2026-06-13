import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

describe('R17 mobile LCP hard rework for home and /docs/start', () => {
  it('makes the homepage mobile hero H1 font override win after full CSS utilities load', () => {
    const layout = read('app/layout.tsx')
    const globals = read('app/globals.css')

    for (const source of [layout, globals]) {
      assert.match(
        source,
        /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?font-family:\s*system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;/,
        'mobile H1 system font override must be important so Tailwind font-sans cannot put LCP back on the Noto Sans webfont path',
      )
      assert.match(source, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?background:\s*none !important;/)
      assert.match(source, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?-webkit-text-fill-color:\s*#fff !important;/)
      assert.match(source, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-title\s*\{[\s\S]*?contain:\s*layout paint;/)
      assert.match(source, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.site-hero-content > :not\(\.site-hero-title\),[\s\S]*?\.site-home-below-fold\s*\{[\s\S]*?content-visibility:\s*hidden;/)
    }

    const homePage = read('app/(marketing)/page.tsx')
    assert.match(homePage, /<main className="site-home-below-fold flex flex-col">/)
  })

  it('renders /docs/start article before the client sidebar in mobile HTML while preserving desktop grid order explicitly', () => {
    const docsPage = read('app/docs/[...slug]/page.tsx')
    const articleIndex = docsPage.indexOf('<article')
    const sidebarIndex = docsPage.indexOf('<DocSidebar')

    assert.ok(articleIndex > -1, 'docs page should render an article')
    assert.ok(sidebarIndex > -1, 'docs page should render the sidebar')
    assert.ok(articleIndex < sidebarIndex, 'article must appear before DocSidebar in source HTML to avoid mobile CSS-load reordering CLS and delayed text LCP')
    assert.match(docsPage, /<article className="[^"]*order-1[^"]*xl:order-2[^"]*"/)
    assert.match(docsPage, /<DocSidebar[\s\S]*?className="[^"]*order-2[^"]*xl:order-1[^"]*"/)
    assert.match(docsPage, /<DocOutline page=\{page\} className="[^"]*order-3[^"]*" \/>/)
  })

  it('eagerly fetches the above-fold /docs/start markdown image with intrinsic dimensions to remove the image LCP load delay', () => {
    const markdownBody = read('components/docs/markdown-body.tsx')

    assert.match(markdownBody, /const isDocsStartHeroImage = page\.slug === '\/start' && resolved\.endsWith\('rm2-learning-path-gemini-final-v2\.webp'\)/)
    assert.match(markdownBody, /const imageSrc = isDocsStartHeroImage \? '\/content-assets\/rm2-learning-path-gemini-final-v2-lcp\.webp' : resolved/)
    assert.match(markdownBody, /className=\{isDocsStartHeroImage \? 'docs-start-lcp-image h-auto w-full' : 'h-auto w-full'\}/)
    assert.match(markdownBody, /loading=\{isDocsStartHeroImage \? 'eager' : 'lazy'\}/)
    assert.match(markdownBody, /fetchPriority=\{isDocsStartHeroImage \? 'high' : 'auto'\}/)
    assert.match(markdownBody, /width=\{isDocsStartHeroImage \? 720 : undefined\}/)
    assert.match(markdownBody, /height=\{isDocsStartHeroImage \? 402 : undefined\}/)

    const docsPage = read('app/docs/[...slug]/page.tsx')
    assert.match(
      docsPage,
      /page\.slug === '\/start'[\s\S]*?<link rel="preload" as="image" href="\/content-assets\/rm2-learning-path-gemini-final-v2-lcp\.webp" fetchPriority="high" \/>/,
      'the confirmed /docs/start LCP image should be discoverable before markdown body parsing/rendering',
    )

    const globals = read('app/globals.css')
    assert.match(globals, /\.docs-start-lcp-image\s*\{[\s\S]*?content-visibility:\s*visible;[\s\S]*?contain:\s*paint;/)
  })
})
