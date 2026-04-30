'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

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
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const active = activeRef.current
    const scroll = scrollRef.current

    if (!active || !scroll) {
      return
    }

    const activeTop = active.offsetTop
    const targetTop = Math.max(activeTop - scroll.clientHeight * 0.36, 0)
    scroll.scrollTo({ top: targetTop, behavior: 'auto' })
  }, [currentSlug])

  return (
    <aside className="site-panel-docs site-doc-sidebar-shell p-4 lg:p-5">
      <div className="site-doc-sidebar-heading border-b border-border pb-4">
        <p className="site-doc-rail-title">Docs navigation</p>
        <p className="mt-2 text-sm leading-6 text-text-tertiary">按模块浏览文档，当前页面会在左侧树中保持高亮。</p>
      </div>

      <div ref={scrollRef} className="site-doc-sidebar-scroll mt-5 flex flex-col gap-5 pr-2" aria-label="文档目录滚动区域">
        {Object.entries(groupedPages).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">{group}</p>
            <div className="space-y-1.5">
              {items.map((page) => {
                const active = page.slug === currentSlug

                return (
                  <Link
                    key={page.slug}
                    ref={active ? activeRef : undefined}
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

      <div className="site-doc-sidebar-scroll-hint" aria-hidden="true">
        Scroll for more
      </div>
    </aside>
  )
}
