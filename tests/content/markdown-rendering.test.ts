import test from 'node:test'
import assert from 'node:assert/strict'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { MarkdownBody } from '../../components/docs/markdown-body'
import { parseHeadings } from '../../lib/content/parsers/headings'
import { resolveMarkdownHref, resolveMarkdownImage } from '../../lib/content/markdown/link-resolver'
import type { SitePage } from '../../lib/content/types'

const page: SitePage = {
  sourcePath: 'docs/05-遇到问题/02-安装更新与环境问题.md',
  slug: '/issues/install-environment',
  title: '02-安装 / 更新 / 环境问题',
  module: 'issues',
  section: 'install-environment',
  description: '',
  order: 73,
  status: 'published',
  updated: '2026-04-28',
  sourceType: 'original',
  navGroup: '05-遇到问题',
  pageType: 'doc-page',
  headings: [],
  body: '',
  githubUrl: 'https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/main/docs/05-遇到问题/02-安装更新与环境问题.md',
}

const linkedPage: SitePage = {
  ...page,
  sourcePath: 'docs/05-遇到问题/03-模型 Provider 与自定义 endpoint 问题.md',
  slug: '/issues/model-provider-endpoint',
  title: '03-模型 Provider 与自定义 endpoint 问题',
}

test('parseHeadings keeps Chinese heading ids aligned with markdown renderer', () => {
  const headings = parseHeadings('# 标题\n\n## ⚡ 先按症状选路\n\n### 01｜执行就报 `hermes: command not found`')

  assert.deepEqual(headings, [
    { depth: 1, text: '标题', id: '标题' },
    { depth: 2, text: '⚡ 先按症状选路', id: '先按症状选路' },
    { depth: 3, text: '01｜执行就报 `hermes: command not found`', id: '01执行就报-hermes-command-not-found' },
  ])
})

test('resolveMarkdownHref maps relative markdown links to docs routes', () => {
  const href = resolveMarkdownHref('<./03-模型%20Provider%20与自定义%20endpoint%20问题.md>', page, [page, linkedPage])
  assert.equal(href, '/docs/issues/model-provider-endpoint')
})

test('resolveMarkdownHref preserves local anchors on internal doc links', () => {
  const href = resolveMarkdownHref('./03-模型 Provider 与自定义 endpoint 问题.md#faq-base-url', page, [page, linkedPage])
  assert.equal(href, '/docs/issues/model-provider-endpoint#faq-base-url')
})

test('resolveMarkdownImage maps relative assets to local proxy urls', () => {
  const src = resolveMarkdownImage('../../assets/solution-miniapp-3-layer-map-v7.webp', {
    ...page,
    sourcePath: 'docs/02-现成方案/03-应用开发与快速原型/02-微信小程序助手.md',
  })

  assert.equal(
    src,
    '/content-assets/solution-miniapp-3-layer-map-v7.webp',
  )
})

test('MarkdownBody renders standalone image figures outside paragraph tags', () => {
  const html = renderToStaticMarkup(
    React.createElement(MarkdownBody, {
      page: {
        ...page,
        body: '正文前。\n\n![钉钉接入主线图](./assets/dingtalk-entry-structure-v3.webp)\n\n正文后。',
        sourcePath: 'docs/03-消息入口/07-钉钉.md',
      },
      linkTargets: [page],
    }),
  )

  assert.match(html, /<figure[^>]*>/)
  assert.match(html, /<figcaption[^>]*>钉钉接入主线图<\/figcaption>/)
  assert.doesNotMatch(html, /<p[^>]*>\s*<figure/)
})

test('MarkdownBody removes the leading duplicate title and never emits body h1 tags', () => {
  const html = renderToStaticMarkup(
    React.createElement(MarkdownBody, {
      page: {
        ...page,
        title: '从这开始',
        body: '# 从这开始\n\n## 先跑起来\n\n正文内容。',
      },
      linkTargets: [page],
    }),
  )

  assert.doesNotMatch(html, /<h1\b/)
  assert.doesNotMatch(html, /<h2[^>]*id="从这开始"[^>]*>从这开始<\/h2>/)
  assert.match(html, /<h2[^>]*id="先跑起来"[^>]*>先跑起来<\/h2>/)
})
