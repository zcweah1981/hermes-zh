import Link from 'next/link'

const pathHighlights = ['上手路径', '现成方案', '排障参考']

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
              先用首页判断自己该从哪一条路径进入，再去文档页继续完成安装、选型、方案落地和问题排查。
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/docs/start" className="site-cta-primary">
                从这开始
              </Link>
              <Link href="/docs/docs-overview" className="site-cta-secondary">
                浏览全部文档
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-tertiary">
              <span className="site-meta-pill">安装到进阶主线</span>
              <span className="site-meta-pill">国内环境入口</span>
              <span className="site-meta-pill">Packs 与文档互通</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
