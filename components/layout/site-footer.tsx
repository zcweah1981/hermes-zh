import Link from 'next/link'

const footerLinks = [
  { href: '/start', label: '从这开始' },
  { href: '/docs/start', label: '文档入口' },
  { href: '/packs', label: 'Packs' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-canvas/92">
      <div className="mx-auto max-w-site-marketing px-6 py-8">
        <div className="site-panel rounded-xl px-6 py-6 shadow-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">Content source</p>
              <p className="mt-3 text-lg font-semibold text-text-primary">Hermes Agent 中文站保持首页与文档页同一套壳层语言。</p>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                内容真源仍然来自 awesome-hermes-agent-zh@site-content-anchor；站点只收敛表现层、导航与执行入口。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-nav-link px-4 py-2">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
