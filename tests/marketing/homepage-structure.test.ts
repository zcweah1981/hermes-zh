import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const homePageSource = readFileSync(join(repoRoot, 'app/(marketing)/page.tsx'), 'utf8')
const heroSource = readFileSync(join(repoRoot, 'components/marketing/hero.tsx'), 'utf8')
const headerSource = readFileSync(join(repoRoot, 'components/layout/site-header.tsx'), 'utf8')
const footerSource = readFileSync(join(repoRoot, 'components/layout/site-footer.tsx'), 'utf8')
const globalsSource = readFileSync(join(repoRoot, 'app/globals.css'), 'utf8')
const routesManifest = JSON.parse(readFileSync(join(repoRoot, 'content-cache/generated/routes-manifest.json'), 'utf8')) as Array<{
  slug: string
}>
const githubUrl = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'
const docRoutes = new Set(routesManifest.map((route) => `/docs${route.slug}`))

describe('R19 homepage structure', () => {
  it('exposes the accepted homepage sections as stable anchors without a duplicate bottom CTA', () => {
    const requiredSections = [
      'hero',
      'primary-paths',
      'evolving-assistant',
      'ready-made-solutions',
      'china-landing',
      'support-and-trust',
    ]

    for (const section of requiredSections) {
      assert.match(homePageSource + heroSource, new RegExp(`data-home-section=["']${section}["']`))
    }

    assert.doesNotMatch(homePageSource, /data-home-section=["']final-cta["']/)
    assert.doesNotMatch(homePageSource, /快速跳转|继续浏览/)
  })

  it('keeps the hero focused on the site promise without internal design notes', () => {
    assert.match(heroSource, /data-home-section=["']hero["']/)
    assert.match(heroSource, /Hermes Agent 中文站/)
    assert.match(heroSource, /一套面向中文用户的 AI Agent 全流程实践指南/)
    assert.match(heroSource, /快速上手/)
    assert.match(heroSource, /浏览文档/)
    assert.match(heroSource, /GitHub/)
    assert.doesNotMatch(heroSource, /真相源可追溯|六条主线分流|深蓝科技感首页|首页先帮你判断|占位页/)
  })

  it('keeps the hero title visually above center and protects the Agent g descender from clipping', () => {
    assert.match(heroSource, /className=\"site-hero-content/)
    assert.match(heroSource, /className=\"site-hero-title/)
    assert.match(globalsSource, /\.site-hero-content\s*{[^}]*transform:\s*translateY\(-1\.5rem\)/s)
    assert.match(globalsSource, /@media \(min-width:\s*768px\)\s*{[^}]*\.site-hero-content\s*{[^}]*transform:\s*translateY\(-2rem\)/s)
    assert.match(globalsSource, /\.site-hero-title\s*{[^}]*overflow:\s*visible[^}]*padding-bottom:\s*1\.25rem[^}]*line-height:\s*1\.28/s)
  })

  it('surfaces the GitHub truth-source entry in header hero and footer without exposing the private site repo', () => {
    assert.match(headerSource, new RegExp(githubUrl))
    assert.match(heroSource, new RegExp(githubUrl))
    assert.match(footerSource, new RegExp(githubUrl))
    assert.doesNotMatch(footerSource, /github\.com\/NousResearch\/hermes-agent|Hermes Agent 官方仓库|zcweah1981\/hermes-zh|独立站代码仓/)
  })

  it('reconstructs the evolving assistant infographic as DOM/CSS/SVG instead of embedding the reference bitmap', () => {
    const sectionStart = homePageSource.indexOf('data-home-section="evolving-assistant"')
    const sectionEnd = homePageSource.indexOf('data-home-section="ready-made-solutions"')
    assert.ok(sectionStart > -1, 'evolving assistant section must exist')
    assert.ok(sectionEnd > sectionStart, 'evolving assistant section must sit before ready-made solutions')

    const sectionSource = homePageSource.slice(sectionStart, sectionEnd)
    assert.match(homePageSource, /function CapabilityInfographic/)
    assert.match(homePageSource, /data-infographic-medium="dom-css-svg"/)
    assert.match(homePageSource, /data-infographic-part="mechanisms"/)
    assert.match(homePageSource, /data-infographic-part="core-engine"/)
    assert.match(homePageSource, /data-infographic-part="advantages"/)
    assert.match(homePageSource, /data-infographic-part="mcp-network"/)
    assert.match(homePageSource, /data-infographic-part="comparison"/)
    assert.match(homePageSource, /闭环学习系统/)
    assert.match(homePageSource, /三层记忆架构/)
    assert.match(homePageSource, /Skill 自我进化能力/)
    assert.match(homePageSource, /MCP 协议连接万物/)
    assert.match(globalsSource, /\.site-capability-web\s*{[^}]*min-height:[^}]*overflow:\s*hidden[^}]*background:/s)
    assert.match(globalsSource, /\.site-capability-connectors path\s*{[^}]*stroke-dasharray:/s)
    assert.doesNotMatch(sectionSource, /<img|<Image|hermes-agent-capability-1to1\.jpg|site-capability-reference|max-w-site-marketing|px-6|py-16/)
  })

  it('links homepage doc entries only to generated docs routes', () => {
    const hrefs = [...homePageSource.matchAll(/href: ['"](\/docs\/[^'"]+)['"]/g)].map((match) => match[1])
    const linkHrefs = [...homePageSource.matchAll(/href=['"](\/docs\/[^'"]+)['"]/g)].map((match) => match[1])

    for (const href of [...hrefs, ...linkHrefs]) {
      assert.ok(docRoutes.has(href), `${href} must exist in generated docs routes`)
    }
  })
})
