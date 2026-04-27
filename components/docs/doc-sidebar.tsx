import Link from 'next/link'

import type { SitePage } from '@/lib/content/types'

export function DocSidebar({ pages, currentSlug }: { pages: SitePage[]; currentSlug: string }) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-surface p-6 lg:sticky lg:top-24 lg:h-fit">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">Docs navigation</p>
      <div className="mt-4 flex flex-col gap-2">
        {pages.map((page) => {
          const active = page.slug === currentSlug
          return (
            <Link
              key={page.slug}
              href={page.slug.startsWith('/docs/') ? page.slug : `/docs${page.slug}`}
              className={`rounded-2xl px-4 py-3 text-sm transition ${
                active ? 'bg-accent/15 text-white' : 'text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="font-medium">{page.title}</div>
              <div className="mt-1 text-xs opacity-80">{page.navGroup}</div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
