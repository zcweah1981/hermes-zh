import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import robots from '../../app/robots'
import { GET as getLlmsText } from '../../app/llms.txt/route'
import type { SitePage } from '../../lib/content/types'
import { buildAnswerBlockJsonLd, buildFAQPageJsonLd } from '../../lib/seo/json-ld'

const repoRoot = process.cwd()
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8')
const readJson = <T>(path: string): T => JSON.parse(read(path)) as T

type PageEntry = {
  slug: string
  title: string
  status: string
  body: string
}

const basePage: SitePage = {
  sourcePath: 'docs/03-国内落地/03-国内入口/06-企业微信（AI Bot）.md',
  slug: '/china/entry/wecom-ai-bot',
  title: '06-企业微信（AI Bot）',
  module: '国内落地',
  section: '国内入口',
  description: '企业微信 AI Bot 接入指南。',
  order: 6,
  status: 'published',
  updated: '2026-06-06',
  sourceType: 'original',
  navGroup: 'china',
  pageType: 'doc-page',
  githubUrl: 'https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/main/docs/03.md',
  headings: [],
  body: '',
}

describe('SEO/GEO R2 recovery contracts', () => {
  it('keeps practical overview discoverable from generated surfaces', async () => {
    const pages = readJson<PageEntry[]>('content-cache/generated/pages-manifest.json')
    const practicalOverview = pages.find((page) => page.slug === '/start/practical' && page.status === 'published')
    assert.ok(practicalOverview, 'content-cache must include /docs/start/practical overview from upstream content')

    const llmsText = await (await getLlmsText()).text()
    assert.match(llmsText, /https:\/\/hermes-zh\.com\/docs\/start\/practical(?:[（\s]|$)/, 'llms.txt must include practical overview')
    assert.doesNotMatch(llmsText, /实战应用：https:\/\/hermes-zh\.com\/docs\/start\/practical\/home-assistant/, 'llms.txt must not point practical overview to home-assistant')

    const aiIndexPage = read('app/ai-index/page.tsx')
    assert.match(aiIndexPage, /'\/docs\/start\/practical'/, 'ai-index curated entries must include practical overview')
    assert.doesNotMatch(aiIndexPage, /approvedPracticalLinks|primaryLinks/, 'ai-index must not use old hand-maintained partial fallback arrays')
  })

  it('allows GEO crawlers to public docs and solution paths while protecting non-public paths', () => {
    const config = robots()
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    const aiRule = rules.find((rule) => Array.isArray(rule.userAgent) && rule.userAgent.includes('GPTBot'))

    assert.ok(aiRule, 'robots must have an explicit AI crawler policy')
    assert.ok(Array.isArray(aiRule.userAgent) && aiRule.userAgent.includes('ClaudeBot') && aiRule.userAgent.includes('PerplexityBot'))
    assert.deepEqual(aiRule.allow, ['/docs/', '/docs/solutions/', '/docs/start/practical/', '/ai-index', '/llms.txt', '/sitemap.xml'])
    assert.ok(Array.isArray(aiRule.disallow), 'AI crawler disallow list must be scoped, not a blanket string')
    assert.ok(aiRule.disallow.includes('/api/'))
    assert.ok(aiRule.disallow.includes('/search'))
    assert.ok(aiRule.disallow.includes('/_next/'))
    assert.ok(!aiRule.disallow.includes('/'), 'AI crawlers must not be blanket-disallowed from all public content')
  })

  it('extracts visible speed-answer and FAQ content into machine-readable schema without inventing answers', () => {
    const page = {
      ...basePage,
      body: `# 06-企业微信（AI Bot）

> 💡 **速答**：Hermes Agent 接入企业微信走官方推荐的 AI Bot 长连接模式——在企业微信里创建智能机器人 → 选 API 模式 + 长连接 → 拿到 Bot ID / Secret → 填入 Hermes 的 \`WECOM_BOT_ID\` 和 \`WECOM_SECRET\` → 启动 Gateway。不需要公网回调地址。

## ❓FAQ

### 1. 企业微信是不是 Hermes 的第一主入口？

不是。它只是国内团队协作入口之一，适合已经把企业微信作为主沟通工具的团队。

### 2. 是否必须准备公网回调地址？

不需要。AI Bot 长连接模式不依赖公网回调地址。`,
    }

    const answerBlock = buildAnswerBlockJsonLd(page)
    assert.ok(answerBlock, 'speed-answer block must emit CreativeWork schema')
    assert.equal(answerBlock['@type'], 'CreativeWork')
    assert.match(String(answerBlock.abstract), /企业微信走官方推荐的 AI Bot 长连接模式/)
    assert.match(String(answerBlock.abstract), /WECOM_BOT_ID|WECOM_SECRET/)
    assert.doesNotMatch(String(answerBlock.abstract), /```|<script/i)

    const faq = buildFAQPageJsonLd(page)
    assert.ok(faq, 'visible FAQ headings and answers must emit FAQPage schema')
    assert.equal(faq['@type'], 'FAQPage')
    assert.deepEqual(
      (faq.mainEntity as Array<Record<string, unknown>>).map((item) => item.name),
      ['企业微信是不是 Hermes 的第一主入口？', '是否必须准备公网回调地址？'],
    )
    assert.match(String((faq.mainEntity as Array<any>)[1].acceptedAnswer.text), /不需要|长连接|公网回调地址/)
  })

  it('accepts R3 speed-answer marker variants from synced content without exposing markdown/script payloads', () => {
    const markerVariants = [
      '💡 速答：BotFather 默认开启隐私模式，Bot 在群里只能收到 @ 它的消息。',
      '**速答**：Hermes 本地数据全部存在 `~/.hermes/` 目录下，零遥测，不上报任何使用数据到官方。',
      '> 💡 **速答**：Hermes Agent 接入 Ollama 只需两步——装 Ollama 并拉模型 → 在 Hermes 用 `hermes model` 选 Ollama provider。',
    ]

    for (const body of markerVariants) {
      const answerBlock = buildAnswerBlockJsonLd({ ...basePage, body })
      assert.ok(answerBlock, `speed-answer variant must emit schema: ${body}`)
      assert.equal(answerBlock['@type'], 'CreativeWork')
      assert.doesNotMatch(String(answerBlock.abstract), /```|<script|\*\*速答\*\*|^速答/i)
    }
  })
})
