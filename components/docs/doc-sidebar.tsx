'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'

import { buildDocSidebarTree, type DocSidebarTreeNode } from '@/lib/docs/sidebar-tree'
import type { SitePage } from '@/lib/content/types'
import { toDocPath } from '@/lib/routing/docs-path'

function DocSidebarPageLink({ page, currentSlug, activeRef }: { page: SitePage; currentSlug: string; activeRef: RefObject<HTMLAnchorElement | null> }) {
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

function nodeContainsSlug(node: DocSidebarTreeNode, currentSlug: string): boolean {
  return node.pages.some((page) => page.slug === currentSlug) || node.children.some((child) => nodeContainsSlug(child, currentSlug))
}

function findRootNodeForSlug(nodes: DocSidebarTreeNode[], currentSlug: string) {
  return nodes.find((node) => nodeContainsSlug(node, currentSlug)) ?? nodes.find((node) => node.label === '00-文档总览') ?? nodes[0]
}

function findExpandedAncestorIds(nodes: DocSidebarTreeNode[], currentSlug: string): Set<string> {
  const expanded = new Set<string>()

  function visit(node: DocSidebarTreeNode): boolean {
    const containsCurrent = nodeContainsSlug(node, currentSlug)

    if (containsCurrent) {
      expanded.add(node.id)
    }

    for (const child of node.children) {
      if (visit(child)) {
        expanded.add(node.id)
      }
    }

    return containsCurrent
  }

  for (const node of nodes) {
    visit(node)
  }

  if (expanded.size === 0) {
    const fallback = nodes.find((node) => node.label === '00-文档总览') ?? nodes[0]
    if (fallback) {
      expanded.add(fallback.id)
    }
  }

  return expanded
}

function safeGroupId(nodeId: string) {
  return `doc-sidebar-group-${nodeId.replace(/[^\w\u4e00-\u9fff-]+/g, '-')}`
}

function DocSidebarNode({
  node,
  currentSlug,
  activeRef,
  expandedNodeIds,
  onToggle,
}: {
  node: DocSidebarTreeNode
  currentSlug: string
  activeRef: RefObject<HTMLAnchorElement | null>
  expandedNodeIds: Set<string>
  onToggle: (nodeId: string) => void
}) {
  const level = node.depth + 1
  const containsCurrent = nodeContainsSlug(node, currentSlug)
  const canAccordion = level <= 2 && (node.pages.length > 0 || node.children.length > 0)
  const expanded = expandedNodeIds.has(node.id)
  const groupId = safeGroupId(node.id)
  const childIndent = Math.min(node.depth + 1, 3) * 0.65
  const content = (
    <>
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
            <DocSidebarNode
              key={child.id}
              node={child}
              currentSlug={currentSlug}
              activeRef={activeRef}
              expandedNodeIds={expandedNodeIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </>
  )

  return (
    <section className="site-doc-sidebar-node" aria-label={node.label}>
      {canAccordion ? (
        <div data-doc-sidebar-level={level}>
          <button
            type="button"
            className={`site-doc-sidebar-group-trigger site-doc-sidebar-group-trigger-depth-${Math.min(level, 3)}`}
            aria-expanded={expanded}
            aria-controls={groupId}
            data-doc-sidebar-accordion={level === 1 ? 'root' : 'section'}
            data-doc-sidebar-current-ancestor={containsCurrent ? 'true' : undefined}
            data-doc-sidebar-expanded={expanded ? 'true' : 'false'}
            onClick={() => onToggle(node.id)}
          >
            <span className="site-doc-sidebar-chevron" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-left">{node.label}</span>
            <span className="site-doc-sidebar-count">{node.pageCount}</span>
          </button>
        </div>
      ) : (
        <div
          className={`site-doc-sidebar-group-label site-doc-sidebar-group-label-depth-${Math.min(level, 3)}`}
          style={node.depth > 0 ? { paddingLeft: `${childIndent}rem` } : undefined}
        >
          {node.label}
        </div>
      )}

      {canAccordion ? (expanded ? <div id={groupId} className="mt-3 space-y-3">{content}</div> : null) : content}
    </section>
  )
}

export function DocSidebar({ pages, currentSlug }: { pages: SitePage[]; currentSlug: string }) {
  const sidebarTree = useMemo(() => buildDocSidebarTree(pages), [pages])
  const currentRoot = useMemo(() => findRootNodeForSlug(sidebarTree, currentSlug), [sidebarTree, currentSlug])
  const defaultExpandedNodeIds = useMemo(() => findExpandedAncestorIds(sidebarTree, currentSlug), [sidebarTree, currentSlug])
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(defaultExpandedNodeIds)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    setExpandedNodeIds((previous) => {
      const next = new Set(previous)
      for (const nodeId of defaultExpandedNodeIds) {
        next.add(nodeId)
      }
      return next
    })
  }, [defaultExpandedNodeIds])

  useEffect(() => {
    const active = activeRef.current
    const scroll = scrollRef.current

    if (!active || !scroll) {
      return
    }

    const activeTop = active.offsetTop
    const targetTop = Math.max(activeTop - scroll.clientHeight * 0.36, 0)
    scroll.scrollTo({ top: targetTop, behavior: 'auto' })
  }, [currentSlug, expandedNodeIds])

  function toggleExpandedNode(nodeId: string) {
    setExpandedNodeIds((previous) => {
      const next = new Set(previous)

      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }

      return next
    })
  }

  return (
    <aside className="site-panel-docs site-doc-sidebar-shell p-4 lg:p-5">
      <div className="site-doc-sidebar-heading border-b border-border pb-4">
        <p className="site-doc-rail-title">Docs navigation</p>
        <p className="mt-2 text-sm leading-6 text-text-tertiary">按内容仓真实目录层级浏览文档，当前页面所属一级与二级目录默认展开。</p>
      </div>

      <div ref={scrollRef} className="site-doc-sidebar-scroll mt-5 flex flex-col gap-4 pr-2" aria-label="文档目录滚动区域">
        {sidebarTree.map((node) => (
          <DocSidebarNode
            key={node.id}
            node={node}
            currentSlug={currentSlug}
            activeRef={activeRef}
            expandedNodeIds={expandedNodeIds}
            onToggle={toggleExpandedNode}
          />
        ))}
      </div>

      <div className="site-doc-sidebar-scroll-hint" aria-hidden="true">
        Scroll for more
      </div>
    </aside>
  )
}
