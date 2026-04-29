import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import { loadContentPages, loadPackEntries } from '../../lib/content/sync/source-loader'

const contentRoot = '/opt/projects/awesome-hermes-agent-zh'

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

test('loadPackEntries reads real pack manifests from the content repo', async () => {
  const packs = await loadPackEntries(contentRoot)

  assert.equal(packs.length, 8)

  const webdev = packs.find((pack) => pack.id === 'webdev-lab')
  assert.ok(webdev)
  assert.equal(webdev?.title, '敏捷 Web 开发助手')
  assert.equal(webdev?.doc, 'docs/02-现成方案/03-应用开发与快速原型/03-敏捷 Web 开发助手.md')
  assert.deepEqual(webdev?.modes, ['solo', 'team'])
})
