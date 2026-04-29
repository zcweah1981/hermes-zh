import Link from 'next/link'

import type { SitePage } from '@/lib/content/types'
import { toDocPath } from '@/lib/routing/docs-path'

function groupPages(pages: SitePage[]) {
  return pages.reduce<Record<string, SitePage[]>>((acc, page) => {
    const key = page.navGroup || page.module || '未分组'
    acc[key] ??= []
    acc[key].push(page)
    return acc
  }, {})
}

export function DocSidebar({ pages, currentSlug }: { pages: SitePage[]; currentSlug: string }) {
  const groupedPages = groupPages(pages)

  return (
    <aside className="site-panel-docs p-5 lg:sticky lg:top-24 lg:h-fit">
      <div className="border-b border-border pb-4">
        <p className="site-doc-rail-title">Docs navigation</p>
        <p className="mt-2 text-sm leading-6 text-text-tertiary">共享首页品牌语气，但保持文档导航的三级信息密度。</p>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {Object.entries(groupedPages).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">{group}</p>
            <div className="space-y-1.5">
              {items.map((page) => {
                const active = page.slug === currentSlug

                return (
                  <Link
                    key={page.slug}
                    href={toDocPath(page.slug)}
                    className={`site-doc-sidebar-link ${active ? 'site-doc-sidebar-link-active' : 'site-doc-sidebar-link-idle'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-2 h-2 w-2 rounded-full ${active ? 'bg-brand-primary' : 'bg-accentual-info/70'}`} />
                      <div>
                        <div className="font-medium leading-6">{page.title}</div>
                        <div className="mt-1 text-xs text-text-tertiary">{page.module}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
