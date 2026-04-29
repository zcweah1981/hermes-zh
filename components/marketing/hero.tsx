import Link from 'next/link'

const pathHighlights = ['品牌入口', '模块分流', 'Docs 执行链']

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 md:pb-24 md:pt-20">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="site-grid-overlay absolute inset-x-0 top-0 h-full opacity-20" />

      <div className="relative mx-auto max-w-site-marketing">
        <div className="site-panel-elevated relative overflow-hidden px-8 py-12 md:px-12 md:py-16">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(45,184,110,0.14),transparent_68%)] lg:block" />

          <div className="relative max-w-4xl">
            <span className="site-eyebrow">Hermes Agent · 中文实战入口</span>

            <div className="mt-7 flex flex-wrap gap-2">
              {pathHighlights.map((item) => (
                <span
                  key={item}
                  className="site-meta-pill py-1"
                >
                  {item}
                </span>
              ))}
            </div>

            <h1 className="mt-8 max-w-4xl font-serif text-5xl font-black leading-[1.08] text-text-primary md:text-[72px] md:tracking-[-0.04em]">
              让 Hermes 成为你的中文 AI 工作助手
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary md:text-[18px] md:leading-[30px]">
              首页负责品牌入口与路径分流，文档页负责把动作继续执行。现在先统一品牌绿主色、结构化卡片、顶栏与导航语法，让 landing 和 docs 明显属于同一套系统。
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/start" className="site-cta-primary">
                从这开始
              </Link>
              <Link href="/docs/start" className="site-cta-secondary">
                查看文档骨架
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-tertiary">
              <span className="site-meta-pill">统一 token</span>
              <span className="site-meta-pill">共享顶栏</span>
              <span className="site-meta-pill">同源卡片与侧栏</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
