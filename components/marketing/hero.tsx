import Link from 'next/link'

const githubHref = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'

export function Hero() {
  return (
    <section data-home-section="hero" className="site-hero-fullscreen relative overflow-hidden px-5 text-center sm:px-6">
      <div className="site-hero-stars" />
      <div className="site-grid-overlay absolute inset-0 opacity-25" />
      <div className="site-hero-circuit site-hero-circuit-left" />
      <div className="site-hero-circuit site-hero-circuit-right" />
      <div className="site-hero-orbit-line site-hero-orbit-line-a" />
      <div className="site-hero-orbit-line site-hero-orbit-line-b" />
      <div className="site-hero-planet site-hero-planet-small" />
      <div className="site-hero-planet site-hero-planet-ring" />
      <div className="site-hero-horizon" />

      <div className="site-hero-content relative z-10 mx-auto flex min-h-[calc(100svh-var(--site-header-height))] w-full max-w-4xl flex-col items-center justify-center py-16 text-center sm:min-h-[calc(100vh-var(--site-header-height))] sm:py-20 md:py-24">
        <h1 className="site-hero-title max-w-4xl bg-gradient-to-b from-white via-sky-100 to-brand-primary bg-clip-text pb-5 font-sans text-5xl font-black leading-[1.28] text-transparent drop-shadow-[0_0_24px_rgba(91,167,255,0.22)] md:text-[82px] md:tracking-[-0.055em]">
          Hermes Agent 中文站
          <span className="sr-only" data-lcp-marker="hero-title">LCP</span>
        </h1>

        <div className="mt-7 max-w-3xl space-y-3 text-base leading-8 text-sky-100/92 md:text-[19px] md:leading-8">
          <p>一套面向中文用户的 AI Agent 全流程实践指南。</p>
          <p>从先跑通，到会定制，再到能集成与自动化。</p>
        </div>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
          <Link
            href="/docs/start"
            prefetch={false}
            className="site-hero-cta-primary"
            data-analytics-event="hero_start_click"
            data-analytics-label="快速上手"
            data-analytics-destination="/docs/start"
            data-analytics-section="hero"
          >
            <span aria-hidden="true">🚀</span>
            快速上手
          </Link>
          <Link
            href="/docs/docs-overview"
            prefetch={false}
            className="site-hero-cta-secondary"
            data-analytics-event="hero_docs_overview_click"
            data-analytics-label="浏览文档"
            data-analytics-destination="/docs/docs-overview"
            data-analytics-section="hero"
          >
            浏览文档
          </Link>
          <a
            href={githubHref}
            target="_blank"
            rel="noreferrer"
            className="site-hero-cta-secondary"
            data-analytics-event="hero_github_click"
            data-analytics-label="GitHub"
            data-analytics-destination={githubHref}
            data-analytics-section="hero"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
