import Link from 'next/link'

const footerLinks = [
  { href: '/docs/start', label: '从这开始' },
  { href: '/docs/docs-overview', label: '文档总览' },
  { href: '/packs', label: 'Packs' },
]

const githubHref = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-canvas/92">
      <div className="mx-auto max-w-site-marketing px-6 py-8">
        <div className="site-panel rounded-xl px-6 py-6 shadow-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">继续浏览</p>
              <p className="mt-3 text-lg font-semibold text-text-primary">Hermes Agent 中文站把首页分流、文档阅读、Packs 与 GitHub 真相源入口放在同一条路径里。</p>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                你可以先从学习主线进入，也可以按现成方案、国内环境、参考手册或 GitHub 仓库继续追溯正式来源。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-nav-link px-4 py-2">
                  {link.label}
                </Link>
              ))}
              <a href={githubHref} target="_blank" rel="noreferrer" className="site-nav-link px-4 py-2">
                GitHub 真相源
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
