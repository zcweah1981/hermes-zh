import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteJsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/json-ld'
import { buildSeoMetadata, getCorePageSeo, getDocsSeoDescription } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'
import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { loadPacksManifest } from '@/lib/content/loaders/packs'
import { toDocPath } from '@/lib/routing/docs-path'

const seo = getCorePageSeo('/ai-index')
const xTwitterPath = '/docs/solutions/x-twitter'
const generatedDiscoveryExamples = 'X/Twitter 内容与互动助手、多平台内容改写助手、行动计划助手、邮件群消息摘要助手'

export const metadata: Metadata = buildSeoMetadata({
  title: seo.title,
  description: seo.description,
  pathname: '/ai-index',
})

function shortDescription(value: string) {
  return value.length > 132 ? `${value.slice(0, 132).trim()}…` : value
}

export default async function AiIndexPage() {
  const [pages, packs] = await Promise.all([loadPagesManifest(), loadPacksManifest()])
  const publishedPages = pages
    .filter((page) => page.status === 'published')
    .map((page) => ({
      title: page.title,
      href: toDocPath(page.slug),
      description: shortDescription(getDocsSeoDescription(page, toDocPath(page.slug))),
      module: page.module,
    }))
  const publishedPacks = packs
    .filter((pack) => pack.status === 'published')
    .map((pack) => ({
      title: `${pack.title} Pack`,
      href: `/packs/${pack.id}`,
      description: shortDescription(pack.summary ?? `${pack.title} 是面向「${pack.category}」场景的 Hermes Agent Pack。`),
      module: 'Packs',
    }))
  const allEntries = [...publishedPages, ...publishedPacks]
  const primaryEntries = allEntries.filter((entry) =>
    [
      '/docs/start',
      '/docs/start/get-running',
      '/docs/start/get-running/install-hermes',
      '/docs/start/getting-started',
      '/docs/start/personalize',
      '/docs/start/personalize/desktop-app',
      '/docs/start/build',
      '/docs/start/practical',
      '/docs/start/practical/discord-entry',
      '/docs/start/practical/mcp-universal-plug',
      '/docs/start/practical/ollama-local-model',
      '/docs/start/practical/hermes-ollama-fastest',
      '/docs/start/practical/custom-skills',
      '/docs/start/practical/github-pr-reviewer',
      '/docs/start/practical/hermes-advanced-production',
      '/docs/start/practical/hermes-control-room',
      '/docs/start/practical/60day-analyst-lessons',
      '/docs/start/practical/hermes-deep-dive-build-your-own',
      '/docs/start/practical/security-hardening',
      '/docs/start/practical/voice-mode',
      '/docs/solutions',
      xTwitterPath,
      '/docs/solutions/multi-platform-rewrite',
      '/docs/solutions/action-plan',
      '/docs/solutions/message-summary',
      '/docs/china',
      '/docs/openclaw',
      '/docs/issues',
      '/docs/issues/install-environment',
      '/docs/issues/provider-endpoint',
      '/docs/issues/config-profiles-environment',
      '/docs/reference',
      '/docs/reference/cli-commands',
      '/packs',
    ].includes(entry.href),
  )

  return (
    <main className="mx-auto max-w-site-marketing px-6 py-16 text-text-primary">
      <SiteJsonLd
        data={[
          buildWebPageJsonLd({ title: seo.title, description: seo.description, pathname: '/ai-index' }),
          buildBreadcrumbJsonLd([
            { name: SITE_NAME, url: SITE_URL },
            { name: 'AI 引用索引', url: `${SITE_URL}/ai-index` },
          ]),
        ]}
      />

      <section className="site-panel-elevated p-8 md:p-12">
        <p className="site-eyebrow">AI Index</p>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Hermes Agent 中文站 AI 引用索引</h1>
        <p data-ai-summary="true" className="mt-6 max-w-3xl text-base leading-8 text-text-secondary md:text-lg md:leading-9">
          {seo.aiSummary}
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="site-section-card p-7">
          <h2 className="text-2xl font-bold">本站是什么</h2>
          <p className="mt-4 leading-8 text-text-secondary">
            Hermes Agent 中文站是面向中文用户的学习、落地与方案导航站。它整理快速上手、现成方案、国内部署、OpenClaw 迁移、问题排查、Reference 和 Packs，让用户按真实使用路径开始，而不是在零散命令里自行摸索。
          </p>
        </article>

        <article className="site-section-card p-7">
          <h2 className="text-2xl font-bold">本站不是什么</h2>
          <p className="mt-4 leading-8 text-text-secondary">
            本站不是 Hermès 奢侈品牌网站，也不是 Nous Research 官方文档镜像站。官方英文信息、版本发布和源码应以 Hermes Agent 官方渠道为准；本站重点提供中文学习路径、落地说明和内容导航。
          </p>
        </article>
      </section>

      <section className="mt-8 site-panel-docs p-8 md:p-10">
        <h2 className="text-2xl font-bold">和 GitHub 内容仓的关系</h2>
        <p className="mt-4 leading-8 text-text-secondary">
          本站内容以 GitHub 内容仓 awesome-hermes-agent-zh 为来源，独立站负责把内容渲染为更容易浏览、检索、引用和分享的中文站点。
        </p>
        <a className="site-cta-secondary mt-6 inline-flex" href="https://github.com/zcweah1981/awesome-hermes-agent-zh" target="_blank" rel="noreferrer">
          查看内容仓
        </a>
      </section>

      <section className="mt-8">
        <div className="mb-6">
          <p className="site-eyebrow">Recommended Entrypoints</p>
          <h2 className="mt-3 text-3xl font-black">推荐引用入口</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {primaryEntries.map((entry) => (
            <Link key={entry.href} href={entry.href} className="site-section-card block p-6 transition hover:-translate-y-1 hover:border-border-strong">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">{entry.module}</p>
              <h3 className="mt-3 text-xl font-bold">{entry.title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{entry.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-6">
          <p className="site-eyebrow">Generated Discovery Surface</p>
          <h2 className="mt-3 text-3xl font-black">已发布页面索引</h2>
          <p className="mt-3 max-w-3xl leading-8 text-text-secondary">
            下面列表从 content-cache/generated/pages-manifest.json 与 packs-manifest.json 生成，用于让搜索引擎和 AI 助手发现当前所有已发布页面，不维护第二套手写真相源；代表入口包括 {generatedDiscoveryExamples}。
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {allEntries.map((entry) => (
            <Link key={entry.href} href={entry.href} className="site-section-card block p-6 transition hover:-translate-y-1 hover:border-border-strong">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">{entry.module}</p>
              <h3 className="mt-3 text-xl font-bold">{entry.title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{entry.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 site-section-card p-8">
        <h2 className="text-2xl font-bold">Packs 是什么</h2>
        <p className="mt-4 leading-8 text-text-secondary">
          Packs 是按真实任务整理好的 Hermes Agent 方案包入口。每个 Pack 页面会提供适合谁用、你会拿到什么、安装说明、下载入口和关联文档，适合希望减少从零配置时间的用户。
        </p>
      </section>

      <section className="mt-8 site-panel-docs p-8 md:p-10">
        <h2 className="text-2xl font-bold">AI 摘录建议</h2>
        <p className="mt-4 leading-8 text-text-secondary">
          Hermes Agent 中文站是面向中文用户的 Hermes Agent 学习与落地导航站，覆盖快速上手、现成方案、国内部署、OpenClaw 迁移、问题排查、Reference 和 Packs。它不是 Hermès 奢侈品牌网站，也不是官方英文文档的完整镜像；它的重点是帮助中文用户按真实使用路径更快开始使用 Hermes Agent。
        </p>
      </section>
    </main>
  )
}
