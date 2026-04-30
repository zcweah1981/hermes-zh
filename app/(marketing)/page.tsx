import Link from 'next/link'

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

const evolvingPoints = [
  {
    title: '会记住，而不只是会回复',
    description: '它会保留真正有用的上下文、偏好和项目事实，下次不用从零解释。',
  },
  {
    title: '会连接，而不只是单点对话',
    description: '模型、工具和常用工作流可以逐步接进来，让助手从回答问题走向完成任务。',
  },
  {
    title: '会沉淀，而不只是生成一次',
    description: '重复出现的经验可以变成可复用方法，团队和个人都能少走回头路。',
  },
  {
    title: '能落地，而不只是演示效果',
    description: '先低成本跑起来，再按你的使用场景扩展，不需要一开始就重投入。',
  },
]

const evolutionFlow = ['输入任务', '执行与反馈', '记住关键事实', '下次更顺手']

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
              <p className="mt-4 text-base leading-8 text-slate-600">首页仍然首先是一张入口页。这里把快速上手、场景方案、国内落地、参考手册、问题排查和迁移参考一次性摆清楚。</p>
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

        <section data-home-section="evolving-assistant" className="bg-[#eef6ff] px-6 py-16 text-slate-950 md:py-20">
          <div className="mx-auto grid max-w-site-marketing gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">品牌解释</p>
              <h2 className="mt-4 font-serif text-3xl font-black leading-tight md:text-[44px]">一个会自我进化的 AI 助手</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">Hermes 的强项不只是“能聊”。它会记住关键上下文，连接你常用的工具，把反复验证过的方法沉淀下来，让下一次协作更省力。</p>
              <p className="mt-4 text-sm leading-7 text-slate-500">这一段只帮你快速理解 Hermes 的差异：先知道它为什么值得继续看，再进入后面的现成方案和落地路径。</p>
              <Link href="/docs/start/personalize/soul" className="mt-7 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500">
                了解如何让 Hermes 更像你
              </Link>
            </div>

            <div className="rounded-[28px] border border-blue-200 bg-white/80 p-5 shadow-xl shadow-blue-900/10">
              <div className="rounded-[22px] border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  {evolutionFlow.map((item, index) => (
                    <div key={item} className="relative rounded-2xl border border-blue-100 bg-white px-3 py-3 text-center text-xs font-semibold text-blue-700">
                      <span>{item}</span>
                      {index < evolutionFlow.length - 1 ? <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-blue-300 sm:block">→</span> : null}
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {evolvingPoints.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-blue-100 bg-white p-4">
                      <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
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
            <SectionCard eyebrow="同步口径" title="当前是构建驱动的半自动同步" description="本站消费内容仓生成页面、导航、搜索与 Packs；webhook 级自动同步下一轮单独评估。" density="docs">
              <a href={githubHref} target="_blank" rel="noreferrer" className="site-cta-secondary mt-2 px-4 py-2">追溯 GitHub 真相源</a>
            </SectionCard>
          </div>
        </section>

      </main>
    </>
  )
}
