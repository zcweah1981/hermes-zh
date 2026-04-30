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
    assert.match(homePageSource, /data-infographic-source="prototype-html-css-vfix3"/)
    assert.match(homePageSource, /data-infographic-part="mechanisms"/)
    assert.match(homePageSource, /data-infographic-part="core-engine"/)
    assert.match(homePageSource, /data-infographic-part="advantages"/)
    assert.match(homePageSource, /data-infographic-part="mcp-network"/)
    assert.match(homePageSource, /data-infographic-part="comparison"/)
    assert.match(homePageSource, /site-capability-inner/)
    assert.match(homePageSource, /site-capability-compare-heading/)
    assert.match(homePageSource, /内置[\s\S]*40\+ 工具/)
    assert.match(homePageSource, /无缝接入[\s\S]*6000\+[\s\S]*外部应用/)
    assert.match(homePageSource, /闭环学习系统/)
    assert.match(homePageSource, /三层记忆架构/)
    assert.match(homePageSource, /Skill 自我进化能力/)
    assert.match(homePageSource, /MCP 协议连接万物/)
    assert.match(globalsSource, /\.site-capability-web\s*{[^}]*--cap-bg:[^}]*--cap-glow:[^}]*overflow:\s*hidden[^}]*background:/s)
    assert.match(globalsSource, /\.site-capability-inner\s*{[^}]*width:\s*min\(100%,\s*1120px\)[^}]*margin-inline:\s*auto/s)
    assert.match(globalsSource, /\.site-capability-layout\s*{[^}]*grid-template-columns:\s*40%\s+18%\s+36%[^}]*max-width:\s*100%/s)
    assert.match(globalsSource, /\.site-capability-connectors path\s*{[^}]*stroke-dasharray:/s)
    assert.match(globalsSource, /\.site-capability-title-block p::before,[\s\S]*\.site-capability-title-block p::after/s)
    assert.match(globalsSource, /\.site-capability-compare-heading::before,[\s\S]*\.site-capability-compare-heading::after/s)
    assert.match(homePageSource, /data-home-section="ready-made-solutions" className="relative bg-\[#030812\]/)
    assert.doesNotMatch(globalsSource, /\.site-capability-(?:layout|comparison)\s*{[^}]*max-width:\s*1480px/s)
    assert.doesNotMatch(sectionSource, /<img|<Image|hermes-agent-capability-1to1\.jpg|site-capability-reference/)
  })

  it('keeps the VFIX5 infographic polish: no white band, smaller title, centered core, and six clear arrows', () => {
    assert.match(homePageSource, /data-home-section="evolving-assistant" className="relative overflow-hidden bg-\[#030812\]/)
    assert.match(globalsSource, /\[data-home-section="primary-paths"\]\s*{[^}]*background:\s*#f8fafc/s)
    assert.match(globalsSource, /\[data-home-section="primary-paths"\]::after\s*{[^}]*bottom:\s*-1px[^}]*height:\s*clamp\(120px,\s*12vw,\s*180px\)[^}]*rgba\(25,\s*62,\s*116,\s*\.92\) 42%[^}]*#030812 68%[^}]*#030812 100%/s)
    assert.match(globalsSource, /\[data-home-section="evolving-assistant"\]\s*{[^}]*margin-top:\s*-1px[^}]*background:\s*#030812/s)
    assert.match(globalsSource, /\[data-home-section="evolving-assistant"\]::before\s*{[^}]*height:\s*clamp\(120px,\s*10vw,\s*180px\)[^}]*linear-gradient\(180deg,\s*#030812 0%,\s*rgba\(3,\s*8,\s*18,\s*\.98\) 48%,\s*rgba\(3,\s*8,\s*18,\s*0\) 100%\)/s)

    assert.match(globalsSource, /\.site-capability-title-block\s*{[^}]*max-width:\s*min\(100%,\s*920px\)[^}]*margin:\s*0 auto clamp\(1\.75rem,\s*2\.8vw,\s*2\.35rem\)/s)
    assert.match(globalsSource, /\.site-capability-title-block h2\s*{[^}]*font-size:\s*clamp\(1\.85rem,\s*2\.65vw,\s*2\.45rem\)[^}]*line-height:\s*1\.16[^}]*text-shadow:\s*0 0 8px rgba\(94,\s*177,\s*255,\s*\.24\),\s*0 0 18px rgba\(0,\s*136,\s*255,\s*\.12\)/s)
    assert.match(globalsSource, /\.site-capability-title-block p\s*{[^}]*font-size:\s*clamp\(\.86rem,\s*1\.1vw,\s*\.98rem\)[^}]*text-shadow:\s*0 0 6px rgba\(39,\s*186,\s*255,\s*\.16\)/s)

    assert.match(homePageSource, /<defs>[\s\S]*id="site-capability-arrowhead"/)
    assert.match(homePageSource, /data-flow="mechanism-to-core"/)
    assert.match(homePageSource, /data-flow="core-to-advantage"/)
    assert.equal([...homePageSource.matchAll(/data-flow="mechanism-to-core"/g)].length, 3)
    assert.equal([...homePageSource.matchAll(/data-flow="core-to-advantage"/g)].length, 3)
    assert.match(globalsSource, /\.site-capability-layout\s*{[^}]*grid-template-columns:\s*40%\s+18%\s+36%[^}]*gap:\s*clamp\(24px,\s*2\.2vw,\s*32px\)/s)
    assert.match(globalsSource, /\.site-capability-core\s*{[^}]*justify-items:\s*center[^}]*align-items:\s*center/s)
    assert.match(globalsSource, /\.site-capability-core-node\s*{[^}]*width:\s*clamp\(150px,\s*12vw,\s*172px\)[^}]*height:\s*clamp\(150px,\s*12vw,\s*172px\)/s)
    assert.match(globalsSource, /\.site-capability-core-orbit-outer\s*{[^}]*width:\s*clamp\(190px,\s*16vw,\s*236px\)[^}]*height:\s*clamp\(190px,\s*16vw,\s*236px\)/s)
    assert.match(globalsSource, /\.site-capability-connectors path\s*{[^}]*stroke-width:\s*3\.4[^}]*stroke-dasharray:\s*9\s+6[^}]*marker-end:\s*url\(#site-capability-arrowhead\)/s)
  })

  it('keeps the hero background responsive across narrow viewports', () => {
    assert.match(globalsSource, /\.site-hero-fullscreen\s*{[^}]*overflow:\s*hidden/s)
    assert.match(globalsSource, /\.site-hero-orbit-line-a\s*{[^}]*width:\s*clamp\(320px,\s*68vw,\s*780px\)[^}]*height:\s*clamp\(88px,\s*16vw,\s*180px\)/s)
    assert.match(globalsSource, /\.site-hero-orbit-line-b\s*{[^}]*width:\s*clamp\(420px,\s*86vw,\s*980px\)[^}]*height:\s*clamp\(120px,\s*21vw,\s*240px\)/s)
    assert.match(globalsSource, /@media \(max-width:\s*640px\)\s*{[\s\S]*\.site-hero-circuit\s*{[^}]*width:\s*180px[^}]*height:\s*180px/s)
    assert.match(globalsSource, /@media \(max-width:\s*640px\)\s*{[\s\S]*\.site-hero-horizon\s*{[^}]*width:\s*115vw[^}]*height:\s*220px/s)
  })

  it('links homepage doc entries only to generated docs routes', () => {
    const hrefs = [...homePageSource.matchAll(/href: ['"](\/docs\/[^'"]+)['"]/g)].map((match) => match[1])
    const linkHrefs = [...homePageSource.matchAll(/href=['"](\/docs\/[^'"]+)['"]/g)].map((match) => match[1])

    for (const href of [...hrefs, ...linkHrefs]) {
      assert.ok(docRoutes.has(href), `${href} must exist in generated docs routes`)
    }
  })
})
