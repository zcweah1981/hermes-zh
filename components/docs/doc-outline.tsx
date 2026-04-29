import Link from 'next/link'

import type { SitePage } from '@/lib/content/types'
import { toDocPath } from '@/lib/routing/docs-path'

export function DocOutline({ page }: { page: SitePage }) {
  const headings = page.headings.filter((heading) => heading.depth >= 2 && heading.depth <= 3)

  return (
    <aside className="site-panel-docs p-5 xl:sticky xl:top-24 xl:h-fit">
      <div className="border-b border-border pb-4">
        <p className="site-doc-rail-title">On this page</p>
        <p className="mt-2 text-sm leading-6 text-text-tertiary">正文目录、原文入口与相邻页面都在这里。</p>
      </div>

      <div className="mt-5 space-y-2">
        {headings.length ? (
          headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block rounded-md px-3 py-2 text-sm transition hover:bg-white/[0.03] hover:text-text-primary ${
                heading.depth === 3 ? 'ml-4 text-text-tertiary' : 'text-text-secondary'
              }`}
            >
              {heading.text}
            </a>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-sm leading-6 text-text-tertiary">这页还没有可用的小节目录，先直接阅读正文。</p>
        )}
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
        <a href={page.githubUrl} target="_blank" rel="noreferrer" className="site-doc-sidebar-link site-doc-sidebar-link-idle">
          查看 GitHub 原文
        </a>
        <Link
          href="/packs"
          className="site-doc-sidebar-link site-doc-sidebar-link-idle"
        >
          查看 Packs
        </Link>
      </div>
    </aside>
  )
}

export function DocPrevNext({ page, pages }: { page: SitePage; pages: SitePage[] }) {
  const prevPage = page.prev ? pages.find((item) => item.slug === page.prev) : undefined
  const nextPage = page.next ? pages.find((item) => item.slug === page.next) : undefined

  if (!prevPage && !nextPage) {
    return null
  }

  return (
    <div className="mt-14 grid gap-4 md:grid-cols-2">
      {prevPage ? (
        <Link href={toDocPath(prevPage.slug)} className="site-section-card site-section-card-interactive flex min-h-32 flex-col justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">上一篇</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{prevPage.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-tertiary">{prevPage.description}</p>
          </div>
        </Link>
      ) : (
        <div className="hidden md:block" />
      )}

      {nextPage ? (
        <Link href={toDocPath(nextPage.slug)} className="site-section-card site-section-card-selected flex min-h-32 flex-col justify-between p-5 md:text-right">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">下一篇</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{nextPage.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-tertiary">{nextPage.description}</p>
          </div>
        </Link>
      ) : null}
    </div>
  )
}
