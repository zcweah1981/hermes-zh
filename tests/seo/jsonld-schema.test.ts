import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { SitePage } from '../../lib/content/types'
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildTechArticleJsonLd,
  buildWebSiteJsonLd,
} from '../../lib/seo/json-ld'

const basePage: SitePage = {
  sourcePath: 'docs/05-遇到问题/03-模型 Provider 与自定义 endpoint 问题.md',
  slug: '/issues/provider-endpoint',
  title: '03-模型 / Provider / 自定义 endpoint 问题',
  module: '遇到问题',
  section: '模型 Provider 与自定义 endpoint 问题',
  description: '这一页只解决一件事：',
  order: 3,
  status: 'published',
  updated: '2026-05-01',
  sourceType: 'original',
  navGroup: 'issues',
  pageType: 'doc-page',
  githubUrl: 'https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/main/docs/issues.md',
  headings: [],
  body: '',
}

describe('Schema.org JSON-LD builders', () => {
  it('builds homepage graph types required by Bing beyond OpenGraph', () => {
    const graph = [
      buildWebSiteJsonLd(),
      buildOrganizationJsonLd(),
      buildSoftwareApplicationJsonLd(),
      buildBreadcrumbJsonLd([
        { name: 'Hermes Agent 中文站', url: 'https://hermes-zh.com' },
        { name: '首页', url: 'https://hermes-zh.com/' },
      ]),
    ]

    assert.deepEqual(
      graph.map((item) => item['@type']),
      ['WebSite', 'Organization', 'SoftwareApplication', 'BreadcrumbList'],
    )

    const app = graph[2]
    assert.equal(app.applicationCategory, 'DeveloperApplication')
    assert.equal(app.operatingSystem, 'Linux, macOS, Windows, Web')
    assert.match(String(app.description), /AI Agent|中文/)
  })

  it('builds docs TechArticle with fallback description and breadcrumb separately', () => {
    const page = {
      ...basePage,
      body: '# 03-模型 / Provider / 自定义 endpoint 问题\n\n> 一句话结论：先分清你卡的是 Key / 权限、model 名、endpoint 路径，还是兼容能力边界。',
    }

    const article = buildTechArticleJsonLd(page)
    const breadcrumb = buildBreadcrumbJsonLd([
      { name: 'Hermes Agent 中文站', url: 'https://hermes-zh.com' },
      { name: page.module, url: 'https://hermes-zh.com/docs/issues' },
      { name: page.title, url: 'https://hermes-zh.com/docs/issues/provider-endpoint' },
    ])

    assert.equal(article['@type'], 'TechArticle')
    assert.equal(breadcrumb['@type'], 'BreadcrumbList')
    assert.notEqual(article.description, '这一页只解决一件事：')
    assert.match(String(article.description), /Key|权限|endpoint|兼容能力边界/)
  })

  it('only emits FAQPage when real FAQ headings can be extracted from issue content', () => {
    const nonFaqIssuePage = {
      ...basePage,
      body: '# 问题总览\n\n这是一页问题分类导航，没有可抽取的具体 FAQ 问答。',
    }

    assert.equal(buildFAQPageJsonLd(nonFaqIssuePage), null)

    const faqPage = {
      ...basePage,
      body: `# 03-模型 / Provider / 自定义 endpoint 问题

### 01｜API Key 明明填了还是不通过 {#faq-api-key-invalid}

先确认当前 Profile 读取的是哪个 provider，再检查 API Key 是否写在正确的运行环境里。

### 02｜为什么一直报 401 / 403 {#faq-401-403}

401 通常优先查鉴权，403 通常优先查权限、额度、区域限制或供应商侧策略。`,
    }

    const faq = buildFAQPageJsonLd(faqPage)

    assert.ok(faq)
    assert.equal(faq['@type'], 'FAQPage')
    assert.ok(Array.isArray(faq.mainEntity))
    assert.equal(faq.mainEntity.length, 2)
    assert.deepEqual(
      faq.mainEntity.map((item: Record<string, unknown>) => item.name),
      ['API Key 明明填了还是不通过', '为什么一直报 401 / 403'],
    )
    assert.match(String(faq.mainEntity[0].acceptedAnswer.text), /Profile|provider|API Key/)
  })
})
