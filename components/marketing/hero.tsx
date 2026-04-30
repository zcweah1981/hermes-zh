import Link from 'next/link'

const githubHref = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'

export function Hero() {
  return (
    <section data-home-section="hero" className="relative overflow-hidden px-6 pb-16 pt-10 md:pb-24 md:pt-14">
      <div className="absolute inset-0 bg-hero-glow opacity-95" />
      <div className="site-grid-overlay absolute inset-0 opacity-25" />

      <div className="relative mx-auto max-w-site-marketing">
        <div className="site-hero-space-panel relative overflow-hidden px-6 py-14 text-center md:px-12 md:py-20">
          <div className="site-hero-stars" />
          <div className="site-hero-circuit site-hero-circuit-left" />
          <div className="site-hero-circuit site-hero-circuit-right" />
          <div className="site-hero-orbit-line site-hero-orbit-line-a" />
          <div className="site-hero-orbit-line site-hero-orbit-line-b" />
          <div className="site-hero-planet site-hero-planet-small" />
          <div className="site-hero-planet site-hero-planet-ring" />
          <div className="site-hero-horizon" />

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <h1 className="max-w-4xl bg-gradient-to-b from-white via-sky-100 to-brand-primary bg-clip-text font-serif text-5xl font-black leading-[1.05] text-transparent drop-shadow-[0_0_24px_rgba(91,167,255,0.22)] md:text-[82px] md:tracking-[-0.055em]">
              Hermes Agent 中文站
            </h1>

            <div className="mt-7 max-w-3xl space-y-3 text-base leading-8 text-sky-100/92 md:text-[19px] md:leading-8">
              <p>一套面向中文用户的 AI Agent 全流程实践指南。</p>
              <p>从先跑通，到会定制，再到能集成与自动化。</p>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/docs/start" className="site-hero-cta-primary">
                <span aria-hidden="true">🚀</span>
                快速上手
              </Link>
              <Link href="/docs/docs-overview" className="site-hero-cta-secondary">
                浏览文档
              </Link>
              <a href={githubHref} target="_blank" rel="noreferrer" className="site-hero-cta-secondary">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
