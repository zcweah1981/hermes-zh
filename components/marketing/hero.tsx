import Link from 'next/link'

const heroSignals = ['深蓝科技感首页', '六条主线分流', 'GitHub 真相源可追溯']
const quickEntries = [
  { href: '/docs/start', label: '快速上手', detail: '第一次跑起来' },
  { href: '/docs/solutions', label: '现成方案', detail: '直接看场景' },
  { href: '/packs', label: 'Packs', detail: '拿到交付物' },
  { href: '/docs/china', label: '国内落地', detail: '模型与部署' },
]

const githubHref = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'

export function Hero() {
  return (
    <section data-home-section="hero" className="relative overflow-hidden px-6 pb-16 pt-10 md:pb-24 md:pt-14">
      <div className="absolute inset-0 bg-hero-glow opacity-95" />
      <div className="site-grid-overlay absolute inset-0 opacity-35" />
      <div className="pointer-events-none absolute left-1/2 top-28 h-[720px] w-[720px] -translate-x-1/2 rounded-full border border-sky-200/10" />
      <div className="pointer-events-none absolute left-1/2 top-40 h-[560px] w-[560px] -translate-x-1/2 rounded-full border border-brand-primary/15" />
      <div className="pointer-events-none absolute left-1/2 top-52 h-[380px] w-[380px] -translate-x-1/2 rounded-full border border-accentual-info/20" />
      <div className="pointer-events-none absolute left-[8%] top-48 hidden h-px w-56 rotate-6 bg-gradient-to-r from-transparent via-brand-primary/70 to-transparent lg:block" />
      <div className="pointer-events-none absolute right-[9%] top-64 hidden h-px w-64 -rotate-6 bg-gradient-to-r from-transparent via-accentual-info/70 to-transparent lg:block" />
      <div className="pointer-events-none absolute left-1/2 top-[330px] h-36 w-[760px] -translate-x-1/2 rounded-[50%] border-t border-sky-200/20" />

      <div className="relative mx-auto max-w-site-marketing">
        <div className="site-panel-elevated relative overflow-hidden px-6 py-12 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-primary/14 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-[70%] -translate-x-1/2 rounded-[50%] bg-accentual-info/10 blur-3xl" />

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="site-eyebrow">Hermes Agent · 中文站正式入口</span>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {heroSignals.map((item) => (
                <span key={item} className="site-meta-pill py-1.5">
                  {item}
                </span>
              ))}
            </div>

            <h1 className="mt-8 max-w-4xl font-serif text-5xl font-black leading-[1.04] text-text-primary md:text-[78px] md:tracking-[-0.055em]">
              让 Hermes 成为你的
              <br />
              中文 AI 工作助手
            </h1>

            <div className="mt-6 max-w-3xl space-y-3 text-base leading-8 text-text-secondary md:text-[18px] md:leading-[31px]">
              <p>首页先帮你判断该从哪条路径进入，再把你带到文档、Packs 与 GitHub 真相源。</p>
              <p>快速上手、浏览文档、查看 GitHub 三类动作在首屏直接完成，不让用户掉进占位页。</p>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/docs/start" className="site-cta-primary">
                从这开始
              </Link>
              <Link href="/docs/docs-overview" className="site-cta-secondary">
                浏览文档
              </Link>
              <a href={githubHref} target="_blank" rel="noreferrer" className="site-cta-secondary">
                查看 GitHub
              </a>
            </div>

            <div className="mt-12 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickEntries.map((entry) => (
                <Link key={entry.href} href={entry.href} className="site-compact-card site-section-card-interactive px-4 py-4 text-left">
                  <p className="text-sm font-semibold text-text-primary">{entry.label}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{entry.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
