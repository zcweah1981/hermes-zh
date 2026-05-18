import * as assertModule from 'assert'
const assert: any = (assertModule as any).default || assertModule
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as testModule from 'node:test'
const test: any = (testModule as any).default || testModule

import { buildDocSidebarTree, getOrderedSidebarItems } from '../../lib/docs/sidebar-tree'
import type { SitePage } from '../../lib/content/types'

const repoRoot = process.cwd()
const globalsSource = readFileSync(join(repoRoot, 'app/globals.css'), 'utf8')
const sidebarSource = readFileSync(join(repoRoot, 'components/docs/doc-sidebar.tsx'), 'utf8')
const pagesManifest = JSON.parse(readFileSync(join(repoRoot, 'content-cache/generated/pages-manifest.json'), 'utf8')) as SitePage[]

function page(sourcePath: string, slug: string, title: string, order: number): SitePage {
  return {
    sourcePath,
    slug,
    title,
    module: 'fixture',
    section: 'fixture',
    description: title,
    order,
    status: 'published',
    updated: '2026-04-30',
    sourceType: 'original',
    navGroup: 'fixture',
    pageType: 'doc-page',
    headings: [],
    body: `# ${title}`,
    githubUrl: `https://example.test/${sourcePath}`,
  }
}

test('buildDocSidebarTree preserves the content repository folder hierarchy instead of flattening by navGroup', () => {
  const tree = buildDocSidebarTree([
    page('docs/02-现成方案/01-内容创作与发布/02-小红书内容助手.md', '/solutions/content/xhs', '小红书内容助手', 22),
    page('docs/01-从这开始/总览.md', '/start', '从这开始', 1),
    page('docs/00-文档总览.md', '/docs-overview', '文档总览', 0),
    page('docs/01-从这开始/01-先跑起来/01-总览.md', '/start/quickstart/overview', '先跑起来总览', 10),
    page('docs/01-从这开始/01-先跑起来/02-先准备运行环境.md', '/start/quickstart/runtime', '先准备运行环境', 11),
    page('docs/06-reference/03-Slash Commands 参考.md', '/reference/slash-commands', 'Slash Commands 参考', 63),
  ])

  assert.deepEqual(
    tree.map((node) => node.label),
    ['00-文档总览', '01-从这开始', '02-现成方案', '06-reference'],
  )

  const start = tree.find((node) => node.label === '01-从这开始')
  assert.ok(start)
  assert.equal(start?.pages[0]?.title, '从这开始')
  assert.deepEqual(start?.children.map((node) => node.label), ['01-先跑起来'])
  assert.deepEqual(
    start?.children[0]?.pages.map((item) => item.title),
    ['先跑起来总览', '先准备运行环境'],
  )

  const solutions = tree.find((node) => node.label === '02-现成方案')
  assert.deepEqual(solutions?.children.map((node) => node.label), ['01-内容创作与发布'])
  assert.equal(solutions?.children[0]?.pages[0]?.title, '小红书内容助手')
})

test('generated docs sidebar root groups match the real content repository top-level docs folders', () => {
  const tree = buildDocSidebarTree(pagesManifest)

  assert.deepEqual(
    tree.map((node) => node.label),
    ['00-文档总览', '01-从这开始', '02-现成方案', '03-国内落地', '04-从OpenClaw过来', '05-遇到问题', '06-reference'],
  )

  const start = tree.find((node) => node.label === '01-从这开始')
  assert.ok(start)
  assert.ok(start.children.some((node) => node.label === '01-先跑起来'))
  assert.ok(start.children.some((node) => node.label === '02-开始上手'))
  assert.ok(start.children.some((node) => node.label === '03-玩出花样'))
  assert.ok(start.children.some((node) => node.label === '04-自己造东西'))

  const build = start.children.find((node) => node.label === '04-自己造东西')
  assert.ok(build?.children.some((node) => node.label === '03-接入外部记忆系统'))
  assert.ok(build?.children.some((node) => node.label === '04-上下文系统'))
})

test('DocSidebar renders a recursive tree with active markers and an independently scrollable rail', () => {
  assert.match(sidebarSource, /buildDocSidebarTree/)
  assert.match(sidebarSource, /function DocSidebarNode/)
  assert.match(sidebarSource, /data-doc-sidebar-level=/)
  assert.match(sidebarSource, /aria-current=\{active \? 'page' : undefined\}/)
  assert.doesNotMatch(sidebarSource, /Object\.entries\(groupedPages\)/)

  assert.match(globalsSource, /\.site-doc-sidebar-shell\s*\{[^}]*height:\s*fit-content/)
  assert.match(globalsSource, /\.site-doc-sidebar\s*\{[^}]*position:\s*sticky[^}]*height:\s*calc\(100vh - var\(--site-header-height\) - 4rem\)[^}]*content-visibility:\s*auto/)
})

test('DocSidebar supports collapsible top-level groups with current root expanded by default', () => {
  assert.match(sidebarSource, /useMemo/)
  assert.match(sidebarSource, /useState/)
  assert.match(sidebarSource, /findRootNodeForSlug/)
  assert.match(sidebarSource, /findExpandedAncestorIds/)
  assert.match(sidebarSource, /site-doc-sidebar-group-trigger/)
  assert.match(sidebarSource, /aria-expanded=\{expanded\}/)
  assert.match(sidebarSource, /aria-controls=\{groupId\}/)
  assert.match(sidebarSource, /data-doc-sidebar-current-ancestor=\{containsCurrent \? 'true' : undefined\}/)
  assert.match(sidebarSource, /data-doc-sidebar-expanded=\{expanded \? 'true' : 'false'\}/)
  assert.match(sidebarSource, /setExpandedByParent/)

  assert.match(globalsSource, /\.site-doc-sidebar-group-trigger\s*{/)
  assert.match(globalsSource, /\.site-doc-sidebar-chevron\s*{/)
  assert.match(globalsSource, /\[data-doc-sidebar-expanded="true"\]\s+\.site-doc-sidebar-chevron/)
})

test('DocSidebar supports VFIX7 first and second level accordions with current ancestor chain expanded', () => {
  assert.match(sidebarSource, /findExpandedAncestorIds/)
  assert.match(sidebarSource, /toggleExpandedNode/)
  assert.match(sidebarSource, /<div data-doc-sidebar-level=\{level\}>/)
  assert.match(sidebarSource, /data-doc-sidebar-accordion=\{level === 1 \? 'root' : 'section'\}/)
  assert.match(sidebarSource, /data-doc-sidebar-current-ancestor=\{containsCurrent \? 'true' : undefined\}/)
  assert.match(sidebarSource, /aria-expanded=\{expanded\}/)
  assert.match(sidebarSource, /aria-controls=\{groupId\}/)
  assert.match(sidebarSource, /setExpandedByParent/)

  assert.match(globalsSource, /\.site-doc-sidebar-group-trigger-depth-2\s*{/)
  assert.match(globalsSource, /\.site-doc-sidebar-group-trigger\[data-doc-sidebar-current-ancestor="true"\]/)
  assert.match(globalsSource, /\[data-doc-sidebar-expanded="true"\]\s+\.site-doc-sidebar-chevron/)
})

test('buildDocSidebarTree orders nested build docs by real content path prefixes', () => {
  const tree = buildDocSidebarTree(pagesManifest)
  const start = tree.find((node) => node.label === '01-从这开始')
  const build = start?.children.find((node) => node.label === '04-自己造东西')
  assert.ok(build)

  assert.deepEqual(
    build.children.map((node) => node.label),
    ['03-接入外部记忆系统', '04-上下文系统'],
  )

  assert.deepEqual(
    build.pages.map((item) => item.sourcePath.split('/').at(-1)),
    [
      '01-总览.md',
      '02-多个助手一起工作.md',
      '05-把 Hermes 接进外部系统.md',
      '06-把 Hermes 暴露成后端服务.md',
      '07-让 Hermes 自己自动跑.md',
      '08-放进编辑器里用.md',
    ],
  )
})

test('getOrderedSidebarItems mixes pages and child folders by source path with overview first', () => {
  const tree = buildDocSidebarTree(pagesManifest)
  const start = tree.find((node) => node.label === '01-从这开始')
  const build = start?.children.find((node) => node.label === '04-自己造东西')
  assert.ok(build)

  assert.deepEqual(
    getOrderedSidebarItems(build).map((item) => item.label),
    [
      '01-总览',
      '02-多个助手一起工作',
      '03-接入外部记忆系统',
      '04-上下文系统',
      '05-把 Hermes 接进外部系统',
      '06-把 Hermes 暴露成后端服务',
      '07-让 Hermes 自己自动跑',
      '08-放进编辑器里用',
    ],
  )

  const externalMemory = build.children.find((node) => node.label === '03-接入外部记忆系统')
  const contextSystem = build.children.find((node) => node.label === '04-上下文系统')
  assert.ok(externalMemory)
  assert.ok(contextSystem)
  assert.equal(getOrderedSidebarItems(externalMemory)[0]?.label, '01-总览')
  assert.equal(getOrderedSidebarItems(contextSystem)[0]?.label, '01-总览')
})

test('DocSidebar VFIX8 uses same-parent single-open accordion state and ordered mixed rendering', () => {
  assert.match(sidebarSource, /type ExpandedByParent\s*=\s*Record<string, string>/)
  assert.match(sidebarSource, /data-doc-sidebar-parent-id=\{parentId \|\| '__root__'\}/)
  assert.match(sidebarSource, /data-doc-sidebar-node-id=\{node\.id\}/)
  assert.match(sidebarSource, /buildDefaultExpandedByParent/)
  assert.match(sidebarSource, /findCurrentAncestorChain/)
  assert.match(sidebarSource, /toggleExpandedNode/)
  assert.match(sidebarSource, /next\[parentKey\] = node\.id/)
  assert.doesNotMatch(sidebarSource, /node\.pages\.map[\s\S]*node\.children\.map/)
  assert.match(sidebarSource, /getOrderedSidebarItems\(node\)/)
  assert.match(sidebarSource, /data-doc-sidebar-item-label=\{item\.label\}/)
})
