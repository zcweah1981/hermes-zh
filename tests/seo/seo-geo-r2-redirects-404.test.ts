import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')

const legacyRedirects = [
  ['/docs/quickstart', '/docs/start'],
  ['/docs/model-provider', '/docs/china'],
  ['/docs/starter', '/packs'],
  ['/docs/examples', '/docs/solutions'],
  ['/docs/faq', '/docs/issues'],
  ['/docs/00-文档总览', '/docs/docs-overview'],
  ['/docs/00-%E6%96%87%E6%A1%A3%E6%80%BB%E8%A7%88', '/docs/docs-overview'],
  ['/docs/01-从这开始', '/docs/start'],
  ['/docs/01-%E4%BB%8E%E8%BF%99%E5%BC%80%E5%A7%8B', '/docs/start'],
  ['/docs/02-现成方案', '/docs/solutions'],
  ['/docs/02-%E7%8E%B0%E6%88%90%E6%96%B9%E6%A1%88', '/docs/solutions'],
  ['/docs/03-国内落地', '/docs/china'],
  ['/docs/03-%E5%9B%BD%E5%86%85%E8%90%BD%E5%9C%B0', '/docs/china'],
  ['/docs/04-从OpenClaw过来', '/docs/openclaw'],
  ['/docs/04-%E4%BB%8EOpenClaw%E8%BF%87%E6%9D%A5', '/docs/openclaw'],
  ['/docs/05-遇到问题', '/docs/issues'],
  ['/docs/05-%E9%81%87%E5%88%B0%E9%97%AE%E9%A2%98', '/docs/issues'],
  ['/docs/06-reference', '/docs/reference'],
  ['/docs/packs', '/packs'],
]

describe('SEO-GEO-R2 404 redirects and metadata baseline', () => {
  it('ships a custom Chinese 404 page with recovery links instead of the Next default page', () => {
    const notFoundPath = 'app/not-found.tsx'
    assert.ok(existsSync(join(repoRoot, notFoundPath)), `${notFoundPath} must exist`)
    const notFound = read(notFoundPath)

    assert.match(notFound, /页面没有找到|没有找到页面|找不到这个页面/)
    assert.doesNotMatch(notFound, /404: This page could not be found\./)

    for (const href of ['/', '/docs/start', '/docs/docs-overview', '/docs/solutions', '/packs', '/docs/issues']) {
      assert.ok(notFound.includes(`href: '${href}'`) || notFound.includes(`href="${href}"`) || notFound.includes('href={item.href}'), `404 page must link to ${href}`)
    }
  })

  it('declares permanent redirects for old SEO paths and legacy Chinese directory paths', () => {
    const config = read('next.config.ts')

    assert.match(config, /async redirects\(\)/)
    assert.match(config, /permanent:\s*true/)

    for (const [source, destination] of legacyRedirects) {
      assert.ok(config.includes(`source: '${source}'`), `missing redirect source ${source}`)
      assert.ok(config.includes(`destination: '${destination}'`), `missing redirect destination ${destination}`)
    }
  })

  it('keeps existing marketing aliases and www canonical host middleware intact', () => {
    const middleware = read('middleware.ts')
    const startAlias = read('app/(marketing)/start/page.tsx')
    const solutionsAlias = read('app/(marketing)/solutions/page.tsx')
    const chinaAlias = read('app/(marketing)/china/page.tsx')
    const openclawAlias = read('app/(marketing)/openclaw/page.tsx')
    const issuesAlias = read('app/(marketing)/issues/page.tsx')
    const referenceAlias = read('app/(marketing)/reference/page.tsx')

    assert.match(middleware, /www\.hermes-zh\.com/)
    assert.match(middleware, /hermes-zh\.com/)
    assert.match(middleware, /NextResponse\.redirect\(redirectUrl,\s*308\)/)
    assert.match(startAlias, /permanentRedirect\('\/docs\/start'\)/)
    assert.match(solutionsAlias, /permanentRedirect\('\/docs\/solutions'\)/)
    assert.match(chinaAlias, /permanentRedirect\('\/docs\/china'\)/)
    assert.match(openclawAlias, /permanentRedirect\('\/docs\/openclaw'\)/)
    assert.match(issuesAlias, /permanentRedirect\('\/docs\/issues'\)/)
    assert.match(referenceAlias, /permanentRedirect\('\/docs\/reference'\)/)
  })

  it('aligns homepage SEO baseline with the current SEO closure plan', () => {
    const metadata = read('lib/seo/metadata.ts')

    assert.match(metadata, /Hermes Agent 中文站：快速上手、现成方案、国内落地与 OpenClaw 迁移/)
    assert.match(metadata, /面向中文用户的 AI Agent 全流程实践指南/)
    assert.match(metadata, /Packs 方案包与问题排查/)
  })
})
