import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const homePageSource = readFileSync(join(repoRoot, 'app/(marketing)/page.tsx'), 'utf8')
const heroSource = readFileSync(join(repoRoot, 'components/marketing/hero.tsx'), 'utf8')
const headerSource = readFileSync(join(repoRoot, 'components/layout/site-header.tsx'), 'utf8')
const footerSource = readFileSync(join(repoRoot, 'components/layout/site-footer.tsx'), 'utf8')
const connectorSource = readFileSync(join(repoRoot, 'components/marketing/capability-connectors.tsx'), 'utf8')
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
    assert.doesNotMatch(sectionSource, /<img|<Image|hermes-agent-capability-1to1\.webp|site-capability-reference/)
  })

  it('keeps VFIX7 homepage split strict: no gradient seam and six connector lines without arrows', () => {
    assert.match(homePageSource, /data-home-section="evolving-assistant" className="relative overflow-hidden bg-\[#030812\]/)
    assert.match(homePageSource, /data-home-section="primary-paths" className="[^"]*pb-24[^"]*md:pb-28/)
    assert.doesNotMatch(homePageSource, /site-section-seam-light-to-blue/)
    assert.doesNotMatch(globalsSource, /\.site-section-seam-light-to-blue/)
    assert.doesNotMatch(globalsSource, /#f8fafc 0%,\s*#e6f0ff 28%,\s*#0b1f3f 70%,\s*#030812 100%/)
    assert.match(globalsSource, /\[data-home-section="primary-paths"\]::after\s*{[^}]*#f8fafc 100%/s)
    assert.match(globalsSource, /\[data-home-section="evolving-assistant"\]\s*{[^}]*margin-top:\s*-1px[^}]*background:\s*#030812/s)

    assert.doesNotMatch(homePageSource, /<defs>[\s\S]*site-capability-arrowhead/)
    assert.doesNotMatch(homePageSource, /<marker[\s\S]*arrowhead/)
    assert.doesNotMatch(connectorSource, /<marker|arrowhead/)
    assert.doesNotMatch(globalsSource, /marker-end:\s*url\(/)
    assert.match(globalsSource, /\.site-capability-connectors path\s*{[^}]*marker-start:\s*none[^}]*marker-mid:\s*none[^}]*marker-end:\s*none/s)
    assert.match(globalsSource, /@media \(max-width:\s*900px\)\s*{[\s\S]*\.site-capability-connectors\s*{\s*display:\s*none/s)
  })

  it('uses DOM anchors for VFIX9 connector lines and removes internal public copy', () => {
    const expectedNodes = ['core', 'left-top', 'left-middle', 'left-bottom', 'right-top', 'right-middle', 'right-bottom']
    const expectedLines = ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    const expectedTargets = ['left-top', 'right-top', 'left-middle', 'right-middle', 'left-bottom', 'right-bottom']

    assert.match(connectorSource, /'use client'/)
    assert.match(connectorSource, /ResizeObserver/)
    assert.match(connectorSource, /getBoundingClientRect/)
    assert.match(connectorSource, /function mirrorPointX/)
    assert.match(connectorSource, /function mirrorLeftLineToRight/)
    assert.match(connectorSource, /const leftStarts/)
    assert.match(connectorSource, /const rightStarts/)
    assert.match(connectorSource, /mirrorPointX\(leftStarts\.top, axisX\)/)
    assert.match(connectorSource, /end:\s*mirrorPointX\(leftLine\.end, axisX\)/)
    assert.match(connectorSource, /dot:\s*mirrorPointX\(leftLine\.dot, axisX\)/)
    assert.match(homePageSource, /CapabilityConnectorLayer/)
    assert.match(homePageSource, /data-connector-scope="capability-infographic"/)

    assert.match(homePageSource, /data-connector-node/)
    for (const node of expectedNodes) {
      assert.match(homePageSource, new RegExp(`['\"]${node}['\"]`))
    }

    for (const line of expectedLines) {
      assert.match(connectorSource, new RegExp(`['\"]${line}['\"]`))
    }
    assert.match(connectorSource, /data-connector-line={line\.id}/)
    for (const target of expectedTargets) {
      assert.match(connectorSource, new RegExp(`target:\\s*['\"]${target}['\"]`))
    }
    assert.match(connectorSource, /data-target={line\.target}/)
    assert.match(connectorSource, /data-connector-dot={line\.target}/)

    assert.doesNotMatch(homePageSource, /viewBox="0 0 1120 620"/)
    assert.doesNotMatch(homePageSource, /机制汇聚|机器汇聚|能力输出|同步口径|构建驱动的半自动同步/)
    assert.match(homePageSource, /内容特点/)
    assert.match(homePageSource, /按真实使用路径组织内容/)
    assert.match(globalsSource, /\.site-capability-connectors\s*{[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*100%/s)
    assert.match(globalsSource, /\.site-capability-connectors path\s*{[^}]*vector-effect:\s*non-scaling-stroke/s)
    assert.match(globalsSource, /\.site-capability-connectors \[data-connector-dot\]\s*{/)
  })

  it('keeps the hero background responsive across narrow viewports', () => {
    assert.match(globalsSource, /\.site-hero-fullscreen\s*{[^}]*overflow:\s*hidden/s)
    assert.match(globalsSource, /\.site-hero-orbit-line-a\s*{[^}]*width:\s*clamp\(280px,\s*68vw,\s*780px\)[^}]*height:\s*clamp\(76px,\s*16vw,\s*180px\)/s)
    assert.match(globalsSource, /\.site-hero-orbit-line-b\s*{[^}]*width:\s*clamp\(340px,\s*86vw,\s*980px\)[^}]*height:\s*clamp\(96px,\s*21vw,\s*240px\)/s)
    assert.match(globalsSource, /\.site-hero-circuit\s*{[^}]*width:\s*clamp\(160px,\s*18vw,\s*270px\)[^}]*height:\s*clamp\(160px,\s*18vw,\s*270px\)/s)
    assert.match(globalsSource, /\.site-hero-horizon\s*{[^}]*width:\s*clamp\(420px,\s*112vw,\s*1080px\)[^}]*height:\s*clamp\(210px,\s*26vw,\s*330px\)/s)
    assert.match(globalsSource, /@media \(max-width:\s*640px\)\s*{[\s\S]*\.site-hero-circuit-left\s*{[^}]*left:\s*clamp\(-74px,\s*-12vw,\s*-42px\)/s)
  })

  it('links homepage doc entries only to generated docs routes', () => {
    const hrefs = [...homePageSource.matchAll(/href: ['"](\/docs\/[^'"]+)['"]/g)].map((match) => match[1])
    const linkHrefs = [...homePageSource.matchAll(/href=['"](\/docs\/[^'"]+)['"]/g)].map((match) => match[1])

    for (const href of [...hrefs, ...linkHrefs]) {
      assert.ok(docRoutes.has(href), `${href} must exist in generated docs routes`)
    }
  })
})
