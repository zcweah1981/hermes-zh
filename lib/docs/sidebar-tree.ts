import type { SitePage } from '@/lib/content/types'

export interface DocSidebarTreeNode {
  id: string
  label: string
  depth: number
  pages: SitePage[]
  children: DocSidebarTreeNode[]
}

function normalizeSourcePath(sourcePath: string) {
  return sourcePath.replace(/^\.?\/?/, '').replace(/^docs\//, '')
}

function stripMarkdownExtension(segment: string) {
  return segment.replace(/\.md$/i, '')
}

function compareByOrderThenPath(a: SitePage, b: SitePage) {
  return a.order - b.order || a.sourcePath.localeCompare(b.sourcePath, 'zh-Hans-CN', { numeric: true })
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

export function buildDocSidebarTree(pages: SitePage[]): DocSidebarTreeNode[] {
  const roots: DocSidebarTreeNode[] = []

  for (const page of [...pages].sort(compareByOrderThenPath)) {
    const normalizedPath = normalizeSourcePath(page.sourcePath)
    const segments = normalizedPath.split('/').filter(Boolean)

    if (segments.length === 0) {
      continue
    }

    const fileName = segments.at(-1) ?? ''
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

  return sortTree(roots)
}
