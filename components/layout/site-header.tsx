import Link from 'next/link'
import Image from 'next/image'
import { SearchDialog } from '@/components/ui/search-dialog'

const navItems = [
  { href: '/docs/start', label: '从这开始', analyticsEvent: 'nav_start_docs_click' },
  { href: '/docs/solutions', label: '现成方案', analyticsEvent: 'nav_solutions_click' },
  { href: '/docs/china', label: '国内落地', analyticsEvent: 'nav_china_click' },
  { href: '/docs/openclaw', label: '从 OpenClaw 过来', analyticsEvent: 'nav_openclaw_click' },
  { href: '/docs/reference', label: '参考手册', analyticsEvent: 'nav_reference_click' },
  { href: '/packs', label: 'Packs', analyticsEvent: 'nav_packs_click' },
]

const githubHref = 'https://github.com/zcweah1981/awesome-hermes-agent-zh'

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
      <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.4 0-.2-.01-.85-.01-1.54-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.89.31-1.63.82-2.2-.08-.21-.36-1.04.08-2.17 0 0 .67-.22 2.2.84A7.45 7.45 0 0 1 8 3.92c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.13.16 1.96.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.05.29.25.54.75.54 1.52 0 1.1-.01 1.98-.01 2.25 0 .22.15.48.55.4A8.13 8.13 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header className="site-frame sticky top-0 z-40">
      <div className="mx-auto flex max-w-site-docs flex-col gap-4 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-h-[var(--site-header-height)] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/hermes-logo.png"
              alt="Hermes Agent 中文站 Logo"
              width={44}
              height={44}
              priority
              className="h-11 w-11 object-contain"
            />
            <div>
              <p className="text-base font-semibold text-text-primary">Hermes Agent 中文站</p>
            </div>
          </Link>

          <div className="flex items-center lg:hidden">
            <SearchDialog />
            <a
              href={githubHref}
              target="_blank"
              rel="noreferrer"
              className="site-icon-link"
              aria-label="打开 GitHub 真相源"
              data-analytics-event="nav_github_click"
              data-analytics-label="GitHub"
              data-analytics-destination={githubHref}
              data-analytics-section="site-header-mobile"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="site-nav-link"
                data-analytics-event={item.analyticsEvent}
                data-analytics-label={item.label}
                data-analytics-destination={item.href}
                data-analytics-section="site-header"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <a
              href={githubHref}
              target="_blank"
              rel="noreferrer"
              className="site-icon-link"
              aria-label="打开 GitHub 真相源"
              data-analytics-event="nav_github_click"
              data-analytics-label="GitHub"
              data-analytics-destination={githubHref}
              data-analytics-section="site-header"
            >
              <GitHubIcon />
            </a>
            <Link
              href="/docs/start"
              className="site-cta-primary hidden px-4 xl:px-5 py-2.5 lg:inline-flex"
              data-analytics-event="nav_start_click"
              data-analytics-label="快速上手"
              data-analytics-destination="/docs/start"
              data-analytics-section="site-header"
            >
              快速上手
            </Link>
            <SearchDialog />
          </div>
        </div>
      </div>
    </header>
  )
}
