import Link from 'next/link'

const officialLinks = [
  { href: 'https://github.com/NousResearch/hermes-agent', label: 'Hermes Agent 官方仓库' },
  { href: 'https://hermes-agent.nousresearch.com/docs', label: 'Hermes Agent 官方文档' },
  { href: 'https://nousresearch.com', label: 'Nous Research' },
]

const localLinks = [
  { href: '/docs/start', label: '从这开始' },
  { href: '/docs/solutions', label: '现成方案' },
  { href: '/docs/china', label: '国内落地' },
  { href: '/packs', label: 'Packs' },
]

const sourceLinks = [
  { href: 'https://github.com/zcweah1981/awesome-hermes-agent-zh', label: '中文内容仓' },
  { href: 'https://github.com/zcweah1981/hermes-zh', label: '独立站代码仓' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#07101d]">
      <div className="mx-auto grid max-w-site-marketing gap-8 px-6 py-10 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-accent bg-brand-primary/12 text-sm font-bold text-brand-primary shadow-glow">
              H
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Hermes Agent 中文站</p>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">面向中文用户的 AI Agent 实践入口。</p>
            </div>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-text-secondary">
            内容以 GitHub 中文内容仓为真相源，独立站负责更适合阅读、搜索和路径分流的网页体验。
          </p>
        </div>

        <FooterColumn title="官方资源" links={officialLinks} external />
        <FooterColumn title="本站入口" links={localLinks} />
        <FooterColumn title="项目链接" links={sourceLinks} external />
      </div>
      <div className="border-t border-border/70 px-6 py-4 text-center text-xs text-text-tertiary">
        Hermes Agent 中文站不是官方站点；官方信息以 Nous Research / Hermes Agent 官方文档为准。
      </div>
    </footer>
  )
}

function FooterColumn({ title, links, external = false }: { title: string; links: { href: string; label: string }[]; external?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">{title}</p>
      <div className="mt-4 flex flex-col gap-3 text-sm text-text-secondary">
        {links.map((link) =>
          external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="transition hover:text-text-primary">
              {link.label}
            </a>
          ) : (
            <Link key={link.href} href={link.href} className="transition hover:text-text-primary">
              {link.label}
            </Link>
          ),
        )}
      </div>
    </div>
  )
}
