import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,184,110,0.16),transparent_40%)]" />
      <div className="relative mx-auto max-w-6xl">
        <span className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          AI Agent · 中文场景优化
        </span>
        <h1 className="mt-8 max-w-4xl font-serif text-5xl font-black leading-tight text-white md:text-7xl">
          让 Hermes 成为你的中文 AI 工作助手
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          第一轮先落地可运行骨架：统一首页与文档页设计语言，接上 content ingestion 脚手架，并为后续 packs、SEO、同步和搜索预留接口。
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/start" className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            从这开始
          </Link>
          <Link href="/docs/start" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/5">
            查看文档骨架
          </Link>
        </div>
      </div>
    </section>
  )
}
