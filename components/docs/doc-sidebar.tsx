'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { buildDocSidebarTree, type DocSidebarTreeNode } from '@/lib/docs/sidebar-tree'
import type { SitePage } from '@/lib/content/types'
import { toDocPath } from '@/lib/routing/docs-path'

function DocSidebarPageLink({ page, currentSlug, activeRef }: { page: SitePage; currentSlug: string; activeRef: React.RefObject<HTMLAnchorElement | null> }) {
  const active = page.slug === currentSlug

  return (
    <Link
      ref={active ? activeRef : undefined}
      href={toDocPath(page.slug)}
      aria-current={active ? 'page' : undefined}
      className={`site-doc-sidebar-link ${active ? 'site-doc-sidebar-link-active' : 'site-doc-sidebar-link-idle'}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${active ? 'bg-brand-primary' : 'bg-accentual-info/70'}`} />
        <div className="min-w-0">
          <div className="font-medium leading-6">{page.title}</div>
          <div className="mt-1 text-xs text-text-tertiary">{page.module}</div>
        </div>
      </div>
    </Link>
  )
}

function DocSidebarNode({ node, currentSlug, activeRef }: { node: DocSidebarTreeNode; currentSlug: string; activeRef: React.RefObject<HTMLAnchorElement | null> }) {
  const level = node.depth + 1
  const childIndent = Math.min(node.depth + 1, 3) * 0.65

  return (
    <section data-doc-sidebar-level={level} className="site-doc-sidebar-node" aria-label={node.label}>
      <div
        className={`site-doc-sidebar-group-label site-doc-sidebar-group-label-depth-${Math.min(level, 3)}`}
        style={node.depth > 0 ? { paddingLeft: `${childIndent}rem` } : undefined}
      >
        {node.label}
      </div>

      {node.pages.length > 0 ? (
        <div className="mt-2 space-y-1.5" style={node.depth > 0 ? { paddingLeft: `${childIndent}rem` } : undefined}>
          {node.pages.map((page) => (
            <DocSidebarPageLink key={page.slug} page={page} currentSlug={currentSlug} activeRef={activeRef} />
          ))}
        </div>
      ) : null}

      {node.children.length > 0 ? (
        <div className="mt-3 space-y-3 border-l border-white/10 pl-3">
          {node.children.map((child) => (
            <DocSidebarNode key={child.id} node={child} currentSlug={currentSlug} activeRef={activeRef} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function DocSidebar({ pages, currentSlug }: { pages: SitePage[]; currentSlug: string }) {
  const sidebarTree = buildDocSidebarTree(pages)
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
        <p className="mt-2 text-sm leading-6 text-text-tertiary">按内容仓真实目录层级浏览文档，当前页面会在左侧树中保持高亮。</p>
      </div>

      <div ref={scrollRef} className="site-doc-sidebar-scroll mt-5 flex flex-col gap-5 pr-2" aria-label="文档目录滚动区域">
        {sidebarTree.map((node) => (
          <DocSidebarNode key={node.id} node={node} currentSlug={currentSlug} activeRef={activeRef} />
        ))}
      </div>

      <div className="site-doc-sidebar-scroll-hint" aria-hidden="true">
        Scroll for more
      </div>
    </aside>
  )
}
