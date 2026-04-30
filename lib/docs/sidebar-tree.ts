import type { SitePage } from '@/lib/content/types'

export interface DocSidebarTreeNode {
  id: string
  label: string
  depth: number
  pages: SitePage[]
  children: DocSidebarTreeNode[]
  pageCount: number
}

export type DocSidebarOrderedItem =
  | { type: 'page'; key: string; label: string; orderKey: string; page: SitePage; isOverview: boolean }
  | { type: 'node'; key: string; label: string; orderKey: string; node: DocSidebarTreeNode; isOverview: false }

function normalizeSourcePath(sourcePath: string) {
  return sourcePath.replace(/^\.?\/?/, '').replace(/^docs\//, '')
}

function stripMarkdownExtension(segment: string) {
  return segment.replace(/\.md$/i, '')
}

function getFileName(sourcePath: string) {
  const segments = normalizeSourcePath(sourcePath).split('/').filter(Boolean)
  return segments[segments.length - 1] ?? ''
}

function isOverviewFileName(fileName: string) {
  return /^(?:00-文档总览|(?:01-)?总览)\.md$/i.test(fileName)
}

function isOverviewPage(page: SitePage) {
  return isOverviewFileName(getFileName(page.sourcePath))
}

function getPageOrderKey(page: SitePage) {
  return stripMarkdownExtension(getFileName(page.sourcePath))
}

function compareByOrderThenPath(a: SitePage, b: SitePage) {
  const overviewDelta = Number(isOverviewPage(b)) - Number(isOverviewPage(a))
  return overviewDelta || a.order - b.order || a.sourcePath.localeCompare(b.sourcePath, 'zh-Hans-CN', { numeric: true })
}

function compareNodes(a: DocSidebarTreeNode, b: DocSidebarTreeNode) {
  return a.label.localeCompare(b.label, 'zh-Hans-CN', { numeric: true })
}

function createNode(label: string, depth: number, parentId: string): DocSidebarTreeNode {
  const id = parentId ? `${parentId}/${label}` : label

  return {
    id,
    label,
    depth,
    pages: [],
    children: [],
    pageCount: 0,
  }
}

function getOrCreateChild(parent: DocSidebarTreeNode, label: string) {
  const existing = parent.children.find((node) => node.label === label)

  if (existing) {
    return existing
  }

  const child = createNode(label, parent.depth + 1, parent.id)
  parent.children.push(child)
  return child
}

function sortTree(nodes: DocSidebarTreeNode[]) {
  nodes.sort(compareNodes)

  for (const node of nodes) {
    node.pages.sort(compareByOrderThenPath)
    sortTree(node.children)
  }

  return nodes
}

function updatePageCounts(nodes: DocSidebarTreeNode[]) {
  for (const node of nodes) {
    updatePageCounts(node.children)
    node.pageCount = node.pages.length + node.children.reduce((total, child) => total + child.pageCount, 0)
  }

  return nodes
}

function compareOrderedItems(a: DocSidebarOrderedItem, b: DocSidebarOrderedItem) {
  const overviewDelta = Number(b.isOverview) - Number(a.isOverview)

  if (overviewDelta) {
    return overviewDelta
  }

  const orderDelta = a.orderKey.localeCompare(b.orderKey, 'zh-Hans-CN', { numeric: true })

  if (orderDelta) {
    return orderDelta
  }

  const aPath = a.type === 'page' ? a.page.sourcePath : a.node.id
  const bPath = b.type === 'page' ? b.page.sourcePath : b.node.id
  return aPath.localeCompare(bPath, 'zh-Hans-CN', { numeric: true })
}

export function getOrderedSidebarItems(node: DocSidebarTreeNode): DocSidebarOrderedItem[] {
  const pageItems: DocSidebarOrderedItem[] = node.pages.map((page) => ({
    type: 'page',
    key: page.slug,
    label: getPageOrderKey(page),
    orderKey: getPageOrderKey(page),
    page,
    isOverview: isOverviewPage(page),
  }))

  const childItems: DocSidebarOrderedItem[] = node.children.map((child) => ({
    type: 'node',
    key: child.id,
    label: child.label,
    orderKey: child.label,
    node: child,
    isOverview: false,
  }))

  return [...pageItems, ...childItems].sort(compareOrderedItems)
}

export function buildDocSidebarTree(pages: SitePage[]): DocSidebarTreeNode[] {
  const roots: DocSidebarTreeNode[] = []

  for (const page of [...pages].sort(compareByOrderThenPath)) {
    const normalizedPath = normalizeSourcePath(page.sourcePath)
    const segments = normalizedPath.split('/').filter(Boolean)

    if (segments.length === 0) {
      continue
    }

    const fileName = segments[segments.length - 1] ?? ''
    const directorySegments = segments.slice(0, -1)
    const rootLabel = directorySegments[0] ?? stripMarkdownExtension(fileName)
    let current = roots.find((node) => node.label === rootLabel)

    if (!current) {
      current = createNode(rootLabel, 0, '')
      roots.push(current)
    }

    for (const segment of directorySegments.slice(1)) {
      current = getOrCreateChild(current, segment)
    }

    current.pages.push(page)
  }

  return updatePageCounts(sortTree(roots))
}
