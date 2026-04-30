import assert from 'node:assert/strict'
import test from 'node:test'

import type { SitePage } from '../../lib/content/types'
import { extractSummaryFromBody, getDocNavSummary, isInvalidNavSummary } from '../../lib/docs/nav-summary'

function page(overrides: Partial<SitePage>): SitePage {
  return {
    sourcePath: 'docs/fixture.md',
    slug: '/fixture',
    title: 'Fixture Page',
    module: 'fixture',
    section: 'fixture',
    description: 'A useful metadata summary for this page.',
    order: 1,
    status: 'published',
    updated: '2026-04-30',
    sourceType: 'original',
    navGroup: 'fixture',
    pageType: 'doc-page',
    headings: [],
    body: '# Fixture Page\n\nA useful body summary for this page.',
    githubUrl: 'https://example.test/docs/fixture.md',
    ...overrides,
  }
}

test('isInvalidNavSummary rejects template-only navigation descriptions', () => {
  assert.equal(isInvalidNavSummary('这一页只解决一件事：'), true)
  assert.equal(isInvalidNavSummary('这一页只解决一件事'), true)
  assert.equal(isInvalidNavSummary('本页主要介绍：'), true)
  assert.equal(isInvalidNavSummary('把 Hermes 接到更适合自己的模型路由上。'), false)
})

test('getDocNavSummary uses valid metadata before body fallback', () => {
  assert.equal(
    getDocNavSummary(page({ description: '了解如何用上下文文件把项目规则、背景资料和长期约定交给 Hermes。' })),
    '了解如何用上下文文件把项目规则、背景资料和长期约定交给 Hermes。',
  )
})

test('getDocNavSummary extracts concrete text after a template prefix on the next line', () => {
  const summary = getDocNavSummary(page({
    title: '02-让 Hermes 更像你',
    description: '这一页只解决一件事：',
    body: '# 02-让 Hermes 更像你\n\n这一页只解决一件事：\n把 Hermes 的长期默认风格放到对的位置，让它不用你每次重复提醒，也能更像你希望长期合作的那个助手。',
  }))

  assert.equal(summary, '把 Hermes 的长期默认风格放到对的位置，让它不用你每次重复提醒，也能更像你希望长期合作的那个助手。')
  assert.doesNotMatch(summary, /这一页只解决一件事/)
})

test('extractSummaryFromBody skips headings images separators links and route-like fragments', () => {
  const summary = extractSummaryFromBody(`---\ntitle: bad\n---\n# Page\n\n这一页只解决一件事：\n![示意图](../../assets/demo.png)\n\n如果你想先回到上一阶段入口重新确认位置：\n\n把 Hermes 接到更适合自己的模型路由上，让成本、速度和稳定性贴近真实使用场景。 [查看配置](../../reference/config.md)`)

  assert.equal(summary, '把 Hermes 接到更适合自己的模型路由上，让成本、速度和稳定性贴近真实使用场景。 查看配置')
})

test('getDocNavSummary falls back to title only after metadata and body are unusable', () => {
  assert.equal(
    getDocNavSummary(page({ title: '04-自定义 AI 大模型', description: '这一页只解决一件事：', body: '# 04-自定义 AI 大模型\n\n---\n\n![图](../../assets/model.png)' })),
    '阅读「04-自定义 AI 大模型」，继续完成当前学习路径。',
  )
})
