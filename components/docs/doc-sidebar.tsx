'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'

import type { DocSidebarItem } from '@/lib/docs/docs-page-projections'
import { buildDocSidebarTree, getOrderedSidebarItems, type DocSidebarTreeNode } from '@/lib/docs/sidebar-tree'
import { toDocPath } from '@/lib/routing/docs-path'

type ExpandedByParent = Record<string, string>

function DocSidebarPageLink({
  page,
  currentSlug,
  activeRef,
  displayLabel,
}: {
  page: DocSidebarItem
  currentSlug: string
  activeRef: RefObject<HTMLAnchorElement | null>
  displayLabel?: string
}) {
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
          <div className="font-medium leading-6">{displayLabel ?? page.title}</div>
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

function findCurrentAncestorChain(nodes: DocSidebarTreeNode[], currentSlug: string): DocSidebarTreeNode[] {
  function visit(node: DocSidebarTreeNode, path: DocSidebarTreeNode[]): DocSidebarTreeNode[] | null {
    const nextPath = [...path, node]

    if (nodeContainsSlug(node, currentSlug)) {
      const childPath = node.children.map((child) => visit(child, nextPath)).find(Boolean)
      return childPath ?? nextPath
    }

    return null
  }

  const chain = nodes.map((node) => visit(node, [])).find(Boolean)

  if (chain) {
    return chain
  }

  const fallback = nodes.find((node) => node.label === '00-文档总览') ?? nodes[0]
  return fallback ? [fallback] : []
}

function findExpandedAncestorIds(nodes: DocSidebarTreeNode[], currentSlug: string): Set<string> {
  return new Set(findCurrentAncestorChain(nodes, currentSlug).map((node) => node.id))
}

function buildDefaultExpandedByParent(nodes: DocSidebarTreeNode[], currentSlug: string): ExpandedByParent {
  const chain = findCurrentAncestorChain(nodes, currentSlug)
  const expanded: ExpandedByParent = {}

  chain.forEach((node, index) => {
    const parentKey = index === 0 ? '__root__' : chain[index - 1].id
    expanded[parentKey] = node.id
  })

  return expanded
}

function collectDescendantIds(node: DocSidebarTreeNode): Set<string> {
  const ids = new Set<string>()

  function visit(current: DocSidebarTreeNode) {
    ids.add(current.id)
    current.children.forEach(visit)
  }

  node.children.forEach(visit)
  return ids
}

function safeGroupId(nodeId: string) {
  return `doc-sidebar-group-${nodeId.replace(/[^\w\u4e00-\u9fff-]+/g, '-')}`
}

function DocSidebarNode({
  node,
  parentId,
  currentSlug,
  activeRef,
  expandedByParent,
  onToggle,
}: {
  node: DocSidebarTreeNode
  parentId: string
  currentSlug: string
  activeRef: RefObject<HTMLAnchorElement | null>
  expandedByParent: ExpandedByParent
  onToggle: (node: DocSidebarTreeNode, parentId: string) => void
}) {
  const level = node.depth + 1
  const containsCurrent = nodeContainsSlug(node, currentSlug)
  const orderedItems = getOrderedSidebarItems(node)
  const canAccordion = orderedItems.length > 0
  const parentKey = parentId || '__root__'
  const expanded = expandedByParent[parentKey] === node.id
  const groupId = safeGroupId(node.id)
  const childIndent = Math.min(node.depth + 1, 3) * 0.65
  const content = orderedItems.length > 0 ? (
    <div className="mt-3 space-y-3 border-l border-white/10 pl-3" style={node.depth > 0 ? { paddingLeft: `${childIndent}rem` } : undefined}>
      {orderedItems.map((item) => (
        <div key={item.key} data-doc-sidebar-item-label={item.label} data-doc-sidebar-item-type={item.type} data-doc-sidebar-parent-label={node.label}>
          {item.type === 'page' ? (
            <DocSidebarPageLink page={item.page} currentSlug={currentSlug} activeRef={activeRef} displayLabel={item.label} />
          ) : (
            <DocSidebarNode
              node={item.node}
              parentId={node.id}
              currentSlug={currentSlug}
              activeRef={activeRef}
              expandedByParent={expandedByParent}
              onToggle={onToggle}
            />
          )}
        </div>
      ))}
    </div>
  ) : null

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
            data-doc-sidebar-parent-id={parentId || '__root__'}
            data-doc-sidebar-node-id={node.id}
            data-doc-sidebar-current-ancestor={containsCurrent ? 'true' : undefined}
            data-doc-sidebar-expanded={expanded ? 'true' : 'false'}
            onClick={() => onToggle(node, parentId || '__root__')}
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

      {canAccordion ? (expanded ? <div id={groupId}>{content}</div> : null) : content}
    </section>
  )
}

export function DocSidebar({ items, currentSlug, className = '' }: { items: DocSidebarItem[]; currentSlug: string; className?: string }) {
  const sidebarTree = useMemo(() => buildDocSidebarTree(items), [items])
  const currentRoot = useMemo(() => findRootNodeForSlug(sidebarTree, currentSlug), [sidebarTree, currentSlug])
  const defaultExpandedNodeIds = useMemo(() => findExpandedAncestorIds(sidebarTree, currentSlug), [sidebarTree, currentSlug])
  const defaultExpandedByParent = useMemo(() => buildDefaultExpandedByParent(sidebarTree, currentSlug), [sidebarTree, currentSlug])
  const [expandedByParent, setExpandedByParent] = useState<ExpandedByParent>(defaultExpandedByParent)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    setExpandedByParent(defaultExpandedByParent)
  }, [defaultExpandedByParent])

  useEffect(() => {
    const active = activeRef.current
    const scroll = scrollRef.current

    if (!active || !scroll) {
      return
    }

    const activeTop = active.offsetTop
    const targetTop = Math.max(activeTop - scroll.clientHeight * 0.36, 0)
    scroll.scrollTo({ top: targetTop, behavior: 'auto' })
  }, [currentSlug, expandedByParent, defaultExpandedNodeIds])

  function toggleExpandedNode(node: DocSidebarTreeNode, parentKey: string) {
    setExpandedByParent((previous) => {
      const next = { ...previous }
      const descendantIds = collectDescendantIds(node)

      for (const key of Object.keys(next)) {
        if (descendantIds.has(key)) {
          delete next[key]
        }
      }

      if (next[parentKey] === node.id) {
        delete next[parentKey]
      } else {
        next[parentKey] = node.id
      }

      return next
    })
  }

  return (
    <aside className={`site-panel-docs site-doc-sidebar-shell p-4 lg:p-5 ${className}`.trim()} style={{ minHeight: '520px' }}>
      <div className="site-doc-sidebar-heading border-b border-border pb-4">
        <p className="site-doc-rail-title">Docs navigation</p>
        <p className="mt-2 text-sm leading-6 text-text-tertiary">按章节浏览文档，当前路径会在目录中高亮。</p>
        <p className="sr-only">当前一级目录：{currentRoot?.label}</p>
      </div>

      <div ref={scrollRef} className="site-doc-sidebar-scroll mt-5 flex flex-col gap-4 pr-2" aria-label="文档目录滚动区域">
        {sidebarTree.map((node) => (
          <DocSidebarNode
            key={node.id}
            node={node}
            parentId=""
            currentSlug={currentSlug}
            activeRef={activeRef}
            expandedByParent={expandedByParent}
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
