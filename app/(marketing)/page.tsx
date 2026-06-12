import Link from 'next/link'

import { Hero } from '@/components/marketing/hero'
import { LazyCapabilityConnectorLayer } from '@/components/marketing/lazy-capability-connectors'
import { SectionCard } from '@/components/ui/section-card'
import { SiteJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/json-ld'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

const githubHref = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'

const primaryPaths = [
  {
    href: '/docs/start',
    eyebrow: '快速上手',
    title: '第一次把 Hermes 跑起来',
    description: '从环境准备、安装到第一次正常互动，适合今天就想开始用的人。',
  },
  {
    href: '/docs/solutions',
    eyebrow: '现成方案',
    title: '按场景直接看怎么用',
    description: '内容创作、办公效率、应用原型等路径集中在这里，先看结果再深入。',
  },
  {
    href: '/docs/china',
    eyebrow: '国内落地',
    title: '在国内环境里稳定部署',
    description: '模型、服务器、消息入口与代理口径拆开说明，减少试错成本。',
  },
  {
    href: '/docs/reference',
    eyebrow: '参考手册',
    title: '查命令、配置和能力细节',
    description: '给已经开始使用 Hermes 的用户快速定位 CLI、配置、工具与扩展能力。',
  },
  {
    href: '/docs/issues',
    eyebrow: '遇到问题',
    title: '按症状定位问题',
    description: '安装、模型、网关、工具和远程环境问题都有可追溯的排查入口。',
  },
  {
    href: '/docs/openclaw',
    eyebrow: '迁移参考',
    title: '从 OpenClaw 过来',
    description: '理解两者关系、共存策略与迁移路径，避免一上来就重做。',
  },
]

const solutionCards = [
  { href: '/docs/solutions/content', title: '内容创作与发布', description: '小红书、公众号、PPT 等内容工作流。' },
  { href: '/docs/solutions/office', title: '办公效率与知识整理', description: '会议纪要、日报、资料总结等高频任务。' },
  { href: '/docs/solutions/dev', title: '应用开发与快速原型', description: '小程序、Web 原型和多助手协作。' },
]

const chinaCards = [
  { href: '/docs/china/deploy', title: '国内部署', description: '轻量服务器、远程连接与运行环境选择。' },
  { href: '/docs/china/models', title: '国内模型', description: '百炼、腾讯云、智谱、Kimi、DeepSeek 与兼容接口。' },
  { href: '/docs/china/entry', title: '国内入口', description: '网页控制台、API、CLI、飞书、企业微信、钉钉与个人微信。' },
]

const mechanismCards = [
  {
    number: '1',
    title: '闭环学习系统',
    subtitle: 'Learning Loop',
    description: '自动从对话中提炼经验，将解决方案转化为可复用的 Skill 文件。',
    steps: ['对话经验提炼', '提炼与转化', 'Skill 文件'],
    icon: 'loop',
  },
  {
    number: '2',
    title: '三层记忆架构',
    subtitle: 'Three-Layer Memory',
    description: '融合会话、持久化偏好与技能记忆，实现短时空的精准背景唤回。',
    steps: ['会话记忆', '技能记忆', '精准背景唤回'],
    icon: 'memory',
  },
  {
    number: '3',
    title: 'Skill 自我进化能力',
    subtitle: 'Skill Self-Evolution Ability',
    description: '遵循 agentskills.io 标准，技能会根据用户反馈与验收结果持续优化。',
    steps: ['用户反馈', 'Skill 修正', '持续进化'],
    icon: 'growth',
  },
]

const advantageCards = [
  { icon: 'coin', title: '极低部署门槛', description: '仅需一台低价 VPS 即可实现 24/7 全天候在线的私人助手。' },
  { icon: 'orbit', title: '自主后台', description: '区别于 Claude Code，Hermes 擅长无人值守的后台任务与定时巡检。' },
  { icon: 'terminal', title: '实时交互', description: '保留 Telegram / CLI 等入口，人可随时插入决策与校准。' },
]

const comparisonCards = [
  { name: 'Hermes Agent', tag: '自改进学习循环', tone: 'hermes', icon: '✦', points: ['核心理念：自改进学习循环', '运行模式：24/7 后台自主', 'Skill 维护：自动创建并优化'] },
  { name: 'OpenClaw', tag: '配置即行为', tone: 'openclaw', icon: '●', points: ['核心理念：配置即行为 (SOUL.md)', '运行模式：按需启动', 'Skill 维护：人工编写与维护'] },
  { name: 'Claude Code', tag: '交互式结对编程', tone: 'claude', icon: '</>', points: ['核心理念：交互式结对编程', '运行模式：实时在线交互', 'Skill 维护：人工手写指令'] },
]

function MiniIcon({ name }: { name: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.8 }

  if (name === 'coin') {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="12" fill="rgba(245, 178, 72, .18)" stroke="currentColor" strokeWidth="2" /><path {...common} d="M20 12v16M15 16.5c1.2-1.4 8-2.2 8.7 1.2.8 3.8-8.4 2-7.5 5.8.7 3.1 7.3 2.4 9 .5" /></svg>
  }

  if (name === 'orbit') {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="5" fill="currentColor" /><ellipse cx="20" cy="20" rx="15" ry="6" {...common} /><ellipse cx="20" cy="20" rx="6" ry="15" {...common} transform="rotate(32 20 20)" /></svg>
  }

  if (name === 'terminal') {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="10" width="24" height="20" rx="4" {...common} /><path {...common} d="m14 18 4 3.2-4 3.2M21 25h6" /></svg>
  }

  if (name === 'memory') {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="6" fill="currentColor" /><path {...common} d="M20 7v7M20 26v7M7 20h7M26 20h7M11.5 11.5l5 5M23.5 23.5l5 5M28.5 11.5l-5 5M16.5 23.5l-5 5" /></svg>
  }

  if (name === 'growth') {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><path {...common} d="M10 28h20M14 28V17M20 28V12M26 28V20M11 16l8-6 7 7 4-5" /></svg>
  }

  if (name === 'mcp') {
    return <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="15" fill="rgba(98,208,255,.16)" stroke="currentColor" strokeWidth="2" /><path {...common} d="M40 15v10M40 55v10M15 40h10M55 40h10M22 22l8 8M58 22l-8 8M58 58l-8-8M22 58l8-8" /><circle cx="40" cy="15" r="4" fill="currentColor" /><circle cx="40" cy="65" r="4" fill="currentColor" /><circle cx="15" cy="40" r="4" fill="currentColor" /><circle cx="65" cy="40" r="4" fill="currentColor" /></svg>
  }

  return <svg viewBox="0 0 40 40" aria-hidden="true"><path {...common} d="M9 15h13l9-6v22l-9-6H9zM13 25v6" /><path {...common} d="M27 16c2 2.2 2 5.8 0 8" /></svg>
}

function CapabilityInfographic() {
  return (
    <div className="site-capability-web" data-infographic-medium="dom-css-svg" data-infographic-source="prototype-html-css-vfix3" data-connector-scope="capability-infographic" aria-label="Hermes Agent 核心机制、实战优势与主流工具差异信息图">
      <div className="site-capability-stars" />
      <div className="site-capability-circuit site-capability-circuit-left" />
      <div className="site-capability-circuit site-capability-circuit-right" />
      <LazyCapabilityConnectorLayer deferUntilIdle />

      <div className="site-capability-inner">
        <header className="site-capability-title-block">
          <h2>Hermes Agent: 一个会自我进化的 AI 助手</h2>
          <p>核心机制：让 AI 自己给自己造“缰绳”</p>
        </header>

        <div className="site-capability-layout">
        <div className="site-capability-left" data-infographic-part="mechanisms">
          {mechanismCards.map((card, index) => {
            const connectorNode = index === 0 ? 'left-top' : index === 1 ? 'left-middle' : 'left-bottom'
            return (
              <article key={card.title} className="site-capability-panel site-capability-mechanism-panel" data-connector-node={connectorNode}>
                <div className="site-capability-panel-title">
                  <span className="site-capability-badge">{card.number}</span>
                  <div>
                    <h3>{card.title}</h3>
                    <p>({card.subtitle})</p>
                  </div>
                </div>
                <p className="site-capability-copy">{card.description}</p>
                <div className="site-capability-flow" aria-label={card.steps.join(' 到 ')}>
                  {card.steps.map((step, index) => (
                    <span key={step} className="site-capability-flow-step">
                      <span className="site-capability-flow-icon"><MiniIcon name={index === 0 ? card.icon : index === 1 ? 'megaphone' : 'growth'} /></span>
                      <small>{step}</small>
                      {index < card.steps.length - 1 ? <i aria-hidden="true">→</i> : null}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        <div className="site-capability-core" data-infographic-part="core-engine" aria-label="Hermes Agent 核心引擎">
          <div className="site-capability-core-orbit site-capability-core-orbit-outer" />
          <div className="site-capability-core-orbit site-capability-core-orbit-middle" />
          <div className="site-capability-core-orbit site-capability-core-orbit-inner" />
          <div className="site-capability-core-node" data-connector-node="core">
            <svg viewBox="0 0 96 96" aria-hidden="true">
              <path d="M48 14 70 28v40L48 82 26 68V28Z" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M48 14v28M26 28l22 14 22-14M48 42v40M26 68l22-26 22 26" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="48" cy="42" r="5" fill="currentColor" />
            </svg>
            <strong>Hermes Agent</strong>
            <span>核心引擎</span>
          </div>
        </div>

        <aside className="site-capability-right" data-infographic-part="advantages">
          <h3>实战优势：低成本、全连接、高自主</h3>
          <article className="site-capability-panel site-capability-advantage-panel" data-connector-node="right-top">
            <span className={`site-capability-round-icon site-capability-round-icon-${advantageCards[0].icon}`}><MiniIcon name={advantageCards[0].icon} /></span>
            <div>
              <h4>{advantageCards[0].title}</h4>
              <p>{advantageCards[0].description}</p>
            </div>
          </article>
          <div className="site-capability-right-middle-anchor" data-connector-node="right-middle">
            {advantageCards.slice(1).map((card) => (
              <article key={card.title} className="site-capability-panel site-capability-advantage-panel">
                <span className={`site-capability-round-icon site-capability-round-icon-${card.icon}`}><MiniIcon name={card.icon} /></span>
                <div>
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              </article>
            ))}
          </div>
          <article className="site-capability-panel site-capability-mcp-panel" data-infographic-part="mcp-network" data-connector-node="right-bottom">
            <div>
              <h4>MCP 协议连接万物</h4>
              <p>内置 40+ 工具，并通过 MCP 协议无缝接入 GitHub 等 6000+ 外部应用。</p>
            </div>
            <div className="site-capability-mcp-map">
              <MiniIcon name="mcp" />
              <span>GitHub</span>
              <span>Browser</span>
              <span>DB</span>
              <span>Files</span>
            </div>
            <div className="site-capability-mcp-tags" aria-label="MCP 工具与外部应用连接规模">
              <b><span>内置</span><strong>40+ 工具</strong></b>
              <b><span>无缝接入</span><strong>6000+</strong><span>外部应用</span></b>
            </div>
          </article>
        </aside>
      </div>

      <section className="site-capability-comparison" data-infographic-part="comparison">
        <h3 className="site-capability-compare-heading">直观对比 Hermes 与主流工具的设计差异</h3>
        <div className="site-capability-compare-grid">
          {comparisonCards.map((card) => (
            <article key={card.name} className={`site-capability-comparison-card site-capability-comparison-card-${card.tone}`}>
              <div className="site-capability-brand-icon" aria-hidden="true">{card.icon}</div>
              <div>
                <strong>{card.name}</strong>
                <span>{card.tag}</span>
                <ul>{card.points.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      </section>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <SiteJsonLd
        data={buildBreadcrumbJsonLd([
          { name: SITE_NAME, url: SITE_URL },
          { name: '首页', url: `${SITE_URL}/` },
        ])}
      />
      <Hero />

      <main className="flex flex-col">
        <section data-home-section="primary-paths" className="bg-slate-50 px-6 pb-24 pt-16 text-slate-950 md:pb-28 md:pt-20">
          <div className="mx-auto max-w-site-marketing">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">六大主线入口</p>
              <h2 className="mt-4 font-serif text-3xl font-black leading-tight md:text-[44px]">先判断你是哪类用户，再进入对应路径</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">首页承担路径分流：快速上手、场景方案、国内落地、参考手册、问题排查和迁移参考都能从这里进入。</p>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {primaryPaths.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                  data-analytics-event="home_primary_path_click"
                  data-analytics-label={item.title}
                  data-analytics-destination={item.href}
                  data-analytics-section="primary-paths"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">{item.eyebrow}</p>
                  <h3 className="mt-3 text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  <p className="mt-5 text-sm font-semibold text-blue-600">立即查看 →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section data-home-section="evolving-assistant" className="relative overflow-hidden bg-[#030812]">
          <CapabilityInfographic />
        </section>

        <section data-home-section="ready-made-solutions" className="relative bg-[#030812] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-site-marketing">
            <SectionCard
              eyebrow="现成方案"
              title="先拿可用场景开跑，再回到文档理解结构"
              description="方案区继续承担路径分流，不做纯展示。每张卡都指向已经整理好的正式文档入口。"
            >
              <div className="grid gap-4 md:grid-cols-3">
                {solutionCards.map((item) => (
                  <Link key={item.href} href={item.href} prefetch={false} className="site-section-card site-section-card-interactive p-5">
                    <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
                    <p className="mt-5 text-sm font-semibold text-brand-primary">进入方案 →</p>
                  </Link>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <section data-home-section="china-landing" className="bg-slate-50 px-6 py-16 text-slate-950 md:py-20">
          <div className="mx-auto max-w-site-marketing">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">国内落地</p>
              <h2 className="mt-4 font-serif text-3xl font-black leading-tight md:text-[44px]">把模型、部署和入口拆开决策</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">国内环境最容易卡在模型接口、服务器与消息平台入口。这里按真实决策顺序分三组入口，方便逐项确认。</p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {chinaCards.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                  data-analytics-event="home_china_landing_click"
                  data-analytics-label={item.title}
                  data-analytics-destination={item.href}
                  data-analytics-section="china-landing"
                >
                  <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  <p className="mt-5 text-sm font-semibold text-blue-600">继续查看 →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section data-home-section="support-and-trust" className="px-6 py-16 md:py-20">
          <div className="mx-auto grid max-w-site-marketing gap-6 lg:grid-cols-3">
            <SectionCard eyebrow="遇到问题" title="按症状排查，而不是重读全部文档" description="安装、Provider、CLI、Gateway、Tools、Docker、SSH 等问题集中回流到问题模块。" density="docs">
              <Link href="/docs/issues" prefetch={false} className="site-cta-secondary mt-2 px-4 py-2">查看问题入口</Link>
            </SectionCard>
            <SectionCard eyebrow="迁移参考" title="从 OpenClaw 过来的用户有独立路径" description="关系、共存、迁移与检查清单单独收口，避免混在新手路径里。" density="docs">
              <Link href="/docs/openclaw" prefetch={false} className="site-cta-secondary mt-2 px-4 py-2">查看迁移路径</Link>
            </SectionCard>
            <SectionCard eyebrow="内容特点" title="按真实使用路径组织内容" description="从快速跑通、场景方案、国内落地到参考手册，内容按用户决策顺序串起来，而不是堆成命令清单。" density="docs">
              <a
                href={githubHref}
                target="_blank"
                rel="noreferrer"
                className="site-cta-secondary mt-2 px-4 py-2"
                data-analytics-event="home_content_repo_click"
                data-analytics-label="查看中文站官方仓库"
                data-analytics-destination={githubHref}
                data-analytics-section="support-and-trust"
              >查看中文站官方仓库</a>
            </SectionCard>
          </div>
        </section>
      </main>
    </>
  )
}
