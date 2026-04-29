'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/docs/docs-overview', label: '文档' },
  { href: '/docs/start', label: '从这开始' },
  { href: '/docs/solutions', label: '现成方案' },
  { href: '/docs/china', label: '国内落地' },
  { href: '/docs/reference', label: '参考手册' },
  { href: '/packs', label: 'Packs' },
  { href: '/search', label: '搜索' },
]

const githubHref = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="site-frame sticky top-0 z-40">
      <div className="mx-auto flex max-w-site-docs flex-col gap-4 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-h-[var(--site-header-height)] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-accent bg-brand-primary/12 text-base font-bold text-brand-primary shadow-glow">
              H
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Hermes Agent 中文站</p>
              <p className="text-xs text-text-tertiary">安装、方案、国内落地、参考手册与 GitHub 真相源入口</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 lg:hidden">
            <a href={githubHref} target="_blank" rel="noreferrer" className="site-cta-secondary px-4 py-2">
              GitHub
            </a>
            <Link href="/search" className="site-cta-secondary px-4 py-2">
              搜索
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname?.startsWith(`${item.href}/`) ||
                (item.href === '/docs/docs-overview' && pathname?.startsWith('/docs/'))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`site-nav-link ${active ? 'site-nav-link-active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}

            <a href={githubHref} target="_blank" rel="noreferrer" className="site-nav-link">
              GitHub
            </a>
          </nav>

          <Link href="/docs/start" className="site-cta-primary hidden px-5 py-2.5 lg:inline-flex">
            快速上手
          </Link>

          <form action="/search" className="hidden lg:block">
            <input
              type="search"
              name="q"
              placeholder="搜索文档 / Packs"
              className="w-52 rounded-full border border-border bg-white/[0.03] px-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary"
            />
          </form>
        </div>
      </div>
    </header>
  )
}
