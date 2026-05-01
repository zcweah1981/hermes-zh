import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { buildRouteMap } from '../../lib/content/resolvers/build-route-map'
import { loadContentPages, loadPackEntries } from '../../lib/content/sync/source-loader'
import type { SitePage } from '../../lib/content/types'

const contentRoot =
  process.env.CONTENT_REPO_PATH ??
  (existsSync(path.join(process.cwd(), '_content_repo'))
    ? path.join(process.cwd(), '_content_repo')
    : '/opt/projects/awesome-hermes-agent-zh')

test('loadContentPages reads published pages from the real content repo with prev/next links', async () => {
  const pages = await loadContentPages(contentRoot)

  assert.ok(pages.length >= 80)

  const start = pages.find((page) => page.slug === '/start')
  assert.ok(start)
  assert.equal(start?.title, '从这开始')
  assert.equal(start?.module, 'start')
  assert.ok(start?.next)

  const docsOverview = pages.find((page) => page.slug === '/docs-overview')
  assert.ok(docsOverview)
  assert.equal(docsOverview?.sourcePath, 'docs/00-文档总览.md')
})

test('loadContentPages can use route map metadata when a doc has no frontmatter', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-route-map-metadata-'))
  await fs.mkdir(path.join(root, 'docs'), { recursive: true })
  await fs.mkdir(path.join(root, 'governance'), { recursive: true })

  await fs.writeFile(
    path.join(root, 'docs', 'readable.md'),
    '# GitHub 直接可读标题\n\n> 这一页没有 YAML frontmatter，GitHub 首屏应直接看到正文。\n\n## 正文小节\n\n正文内容。\n',
  )
  await fs.writeFile(
    path.join(root, 'governance', 'site-route-map.yaml'),
    `routes:\n  - source: docs/readable.md\n    slug: /readable\n    title: 路由表标题\n    module: start\n    section: github-readability\n    description: 来自 route map 的描述\n    order: 7\n    status: published\n    updated: 2026-04-29\n    source_type: original\n    nav_group: 可读性修复\n    page_type: doc-page\n`,
  )

  const pages = await loadContentPages(root)

  assert.equal(pages.length, 1)
  assert.equal(pages[0].slug, '/readable')
  assert.equal(pages[0].title, '路由表标题')
  assert.equal(pages[0].module, 'start')
  assert.equal(pages[0].section, 'github-readability')
  assert.equal(pages[0].description, '来自 route map 的描述')
  assert.equal(pages[0].order, 7)
  assert.equal(pages[0].status, 'published')
  assert.equal(pages[0].updated, '2026-04-29')
  assert.equal(pages[0].sourceType, 'original')
  assert.equal(pages[0].navGroup, '可读性修复')
  assert.equal(pages[0].pageType, 'doc-page')
  assert.ok(pages[0].body.startsWith('# GitHub 直接可读标题'))
  assert.deepEqual(
    pages[0].headings.map((heading) => heading.text),
    ['GitHub 直接可读标题', '正文小节'],
  )
})

test('loadContentPages falls back to markdown body when route map metadata is minimal', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-body-fallback-'))
  await fs.mkdir(path.join(root, 'docs'), { recursive: true })
  await fs.mkdir(path.join(root, 'governance'), { recursive: true })

  await fs.writeFile(
    path.join(root, 'docs', 'minimal.md'),
    '# 正文标题兜底\n\n第一段正文会成为描述兜底。\n',
  )
  await fs.writeFile(
    path.join(root, 'governance', 'site-route-map.yaml'),
    `routes:\n  - source: docs/minimal.md\n    slug: /minimal\n    module: reference\n    page_type: reference-page\n`,
  )

  const pages = await loadContentPages(root)

  assert.equal(pages.length, 1)
  assert.equal(pages[0].slug, '/minimal')
  assert.equal(pages[0].title, '正文标题兜底')
  assert.equal(pages[0].description, '第一段正文会成为描述兜底。')
  assert.ok(pages[0].body.startsWith('# 正文标题兜底\n\n第一段正文会成为描述兜底。'))
})

test('loadContentPages creates a minimal body when a mapped doc has metadata but no markdown body', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-empty-body-fallback-'))
  await fs.mkdir(path.join(root, 'docs'), { recursive: true })
  await fs.mkdir(path.join(root, 'governance'), { recursive: true })

  await fs.writeFile(path.join(root, 'docs', 'empty.md'), '')
  await fs.writeFile(
    path.join(root, 'governance', 'site-route-map.yaml'),
    `routes:\n  - source: docs/empty.md\n    slug: /empty\n    title: 空正文页面\n    module: reference\n    page_type: doc-page\n    description: 这个页面暂时没有正文，但不应生成空白页。\n`,
  )

  const pages = await loadContentPages(root)

  assert.equal(pages.length, 1)
  assert.equal(pages[0].body, '# 空正文页面\n\n这个页面暂时没有正文，但不应生成空白页。')
})

test('buildRouteMap preserves page metadata for generated routes manifest', () => {
  const page: SitePage = {
    sourcePath: 'docs/readable.md',
    slug: '/readable',
    title: 'GitHub 可读页面',
    module: 'start',
    section: 'github-readability',
    description: '页面机器元数据应集中进入 route map / routes manifest。',
    order: 12,
    status: 'published',
    updated: '2026-04-29',
    sourceType: 'original',
    navGroup: '可读性修复',
    pageType: 'doc-page',
    headings: [],
    body: '# GitHub 可读页面',
    githubUrl: 'https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/main/docs/readable.md',
  }

  assert.deepEqual(buildRouteMap([page]), [
    {
      sourcePath: 'docs/readable.md',
      slug: '/readable',
      pageType: 'doc-page',
      module: 'start',
      title: 'GitHub 可读页面',
      section: 'github-readability',
      description: '页面机器元数据应集中进入 route map / routes manifest。',
      order: 12,
      status: 'published',
      updated: '2026-04-29',
      sourceType: 'original',
      navGroup: '可读性修复',
    },
  ])
})

test('loadPackEntries reads real pack manifests from the content repo', async () => {
  const packs = await loadPackEntries(contentRoot)

  assert.equal(packs.length, 8)

  const webdev = packs.find((pack) => pack.id === 'webdev-lab')
  assert.ok(webdev)
  assert.equal(webdev?.title, '敏捷 Web 开发助手')
  assert.equal(webdev?.doc, 'docs/02-现成方案/03-应用开发与快速原型/03-敏捷 Web 开发助手.md')
  assert.deepEqual(webdev?.modes, ['solo', 'team'])
})
