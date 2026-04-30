import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import { buildDocSidebarTree } from '../../lib/docs/sidebar-tree'
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

  assert.match(globalsSource, /\.site-doc-sidebar-shell\s*{[^}]*height:\s*fit-content/s)
  assert.match(globalsSource, /@screen xl\s*{[^}]*\.site-doc-sidebar-shell\s*{[^}]*position:\s*sticky[^}]*max-height:\s*calc\(100vh - var\(--site-header-height\) - 2rem\)[^}]*overflow:\s*hidden/s)
  assert.match(globalsSource, /@screen xl\s*{[^}]*\.site-doc-sidebar-scroll\s*{[^}]*flex:\s*1 1 auto[^}]*overflow-y:\s*auto[^}]*overscroll-behavior:\s*contain/s)
})
