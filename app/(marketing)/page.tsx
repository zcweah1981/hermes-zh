import Link from 'next/link'
import Image from 'next/image'

import { Hero } from '@/components/marketing/hero'
import { SectionCard } from '@/components/ui/section-card'

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

export default function HomePage() {
  return (
    <>
      <Hero />

      <main className="flex flex-col">
        <section data-home-section="primary-paths" className="bg-slate-50 px-6 py-16 text-slate-950 md:py-20">
          <div className="mx-auto max-w-site-marketing">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">六大主线入口</p>
              <h2 className="mt-4 font-serif text-3xl font-black leading-tight md:text-[44px]">先判断你是哪类用户，再进入对应路径</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">首页承担路径分流：快速上手、场景方案、国内落地、参考手册、问题排查和迁移参考都能从这里进入。</p>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {primaryPaths.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">{item.eyebrow}</p>
                  <h3 className="mt-3 text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  <p className="mt-5 text-sm font-semibold text-blue-600">立即查看 →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section data-home-section="evolving-assistant" className="relative overflow-hidden px-6 py-16 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(91,167,255,0.18),transparent_34%),radial-gradient(circle_at_70%_36%,rgba(130,80,255,0.13),transparent_30%)]" />
          <div className="relative mx-auto max-w-site-marketing">
            <div className="site-infographic-shell">
              <Image
                src="/assets/hermes-capability-map-cropped.jpg"
                alt="Hermes Agent 核心机制、实战优势与主流工具差异信息图"
                width={1280}
                height={600}
                sizes="(min-width: 1280px) 1180px, calc(100vw - 48px)"
                className="site-infographic-image"
                priority={false}
              />
            </div>
          </div>
        </section>

        <section data-home-section="ready-made-solutions" className="px-6 py-16 md:py-20">
          <div className="mx-auto max-w-site-marketing">
            <SectionCard
              eyebrow="现成方案"
              title="先拿可用场景开跑，再回到文档理解结构"
              description="方案区继续承担路径分流，不做纯展示。每张卡都指向已经整理好的正式文档入口。"
            >
              <div className="grid gap-4 md:grid-cols-3">
                {solutionCards.map((item) => (
                  <Link key={item.href} href={item.href} className="site-section-card site-section-card-interactive p-5">
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
                <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
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
              <Link href="/docs/issues" className="site-cta-secondary mt-2 px-4 py-2">查看问题入口</Link>
            </SectionCard>
            <SectionCard eyebrow="迁移参考" title="从 OpenClaw 过来的用户有独立路径" description="关系、共存、迁移与检查清单单独收口，避免混在新手路径里。" density="docs">
              <Link href="/docs/openclaw" className="site-cta-secondary mt-2 px-4 py-2">查看迁移路径</Link>
            </SectionCard>
            <SectionCard eyebrow="同步口径" title="当前是构建驱动的半自动同步" description="内容仓是唯一来源；当站点重新构建/部署时，会读取锚点分支并生成页面、导航、搜索与 Packs。" density="docs">
              <a href={githubHref} target="_blank" rel="noreferrer" className="site-cta-secondary mt-2 px-4 py-2">查看中文站官方仓库</a>
            </SectionCard>
          </div>
        </section>
      </main>
    </>
  )
}
