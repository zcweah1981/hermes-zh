import path from 'node:path'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { loadPacksManifest } from '@/lib/content/loaders/packs'
import type { SitePack, SitePage } from '@/lib/content/types'
import { toDocPath } from '@/lib/routing/docs-path'
import { SiteJsonLd, buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd, buildSoftwareSourceCodeJsonLd } from '@/lib/seo/json-ld'
import { buildSeoMetadata, getPackSeoDescription } from '@/lib/seo/metadata'

import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb'

const CONTENT_REPO_BRANCH = process.env.CONTENT_REPO_BRANCH ?? 'main'
const CONTENT_REPO_OWNER = 'zcweah1981/awesome-hermes-agent-zh'

function toBlobUrl(relativePath: string) {
  return `https://github.com/${CONTENT_REPO_OWNER}/blob/${CONTENT_REPO_BRANCH}/${relativePath}`
}

function toRawUrl(relativePath: string) {
  return `https://raw.githubusercontent.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_BRANCH}/${relativePath}`
}

function getModeLabel(modes: SitePack['modes']) {
  if (modes.length === 0) {
    return '单人 / 协作'
  }

  return modes.map((mode) => (mode === 'solo' ? '单人' : '协作')).join(' / ')
}

function buildHeroDescription(pack: SitePack) {
  const summary = pack.summary?.trim()

  if (!summary) {
    return `这是一个面向「${pack.category}」场景的 Hermes Pack，帮助你更快进入可执行流程。`
  }

  return `${summary} 这个 Pack 会把「${pack.category}」里最常见的起步动作收拢成一条更短的上手入口。`
}

function buildSuitableFor(pack: SitePack, relatedDoc?: SitePage) {
  const items = [
    `你已经明确要处理「${pack.category}」场景，希望减少从零整理流程的时间。`,
    `你会以 ${getModeLabel(pack.modes)} 的方式使用这个 Pack。`,
  ]

  if (pack.tags?.length) {
    items.push(`你的任务和 ${pack.tags.join(' / ')} 等关键词高度相关。`)
  }

  if (relatedDoc) {
    items.push(`你希望先看落地文档，再决定如何安装或下载这个 Pack。`)
  }

  return items
}

function buildWhatYouGet(pack: SitePack, relatedDoc?: SitePage) {
  const items = [`一个围绕「${pack.title}」场景整理好的 Pack 入口页。`, '一条直接查看安装说明的主路径。']

  if (pack.download) {
    items.push('一个可直接下载的最小可用文件包入口。')
  }

  if (relatedDoc) {
    items.push(`一篇关联文档《${relatedDoc.title}》，方便继续阅读完整用法。`)
  }

  if (pack.tags?.length) {
    items.push(`一组已整理的场景标签：${pack.tags.join('、')}。`)
  }

  return items
}

export const dynamicParams = false

export async function generateStaticParams() {
  const packs = await loadPacksManifest()

  return packs
    .filter((pack) => pack.status === 'published')
    .map((pack) => ({ id: pack.id }))
}

async function getPack(id: string) {
  const packs = await loadPacksManifest()
  return packs.find((item) => item.id === id && item.status === 'published')
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const pack = await getPack(id)

  if (!pack) {
    return {}
  }

  const description = getPackSeoDescription(pack)

  return buildSeoMetadata({
    title: `${pack.title} Pack`,
    description,
    pathname: `/packs/${pack.id}`,
    type: 'article',
  })
}

export default async function PackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pack = await getPack(id)

  if (!pack) {
    notFound()
  }

  const pages = await loadPagesManifest()
  const relatedDoc = pages.find((page) => page.sourcePath === pack.doc && page.status === 'published')
  const installHref = toBlobUrl(pack.install)
  const downloadHref = pack.download ? toRawUrl(pack.download) : null
  const suitableFor = buildSuitableFor(pack, relatedDoc)
  const whatYouGet = buildWhatYouGet(pack, relatedDoc)
  const installFileName = path.posix.basename(pack.install)
  const downloadFileName = pack.download ? path.posix.basename(pack.download) : null

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '首页', url: '/' },
    { name: '现成方案', url: '/packs' },
    { name: pack.title }
  ]

  return (
    <div className="mx-auto flex max-w-site-marketing flex-col gap-8 px-6 py-16">
      <SiteJsonLd
        data={[
          buildSoftwareApplicationJsonLd(pack),
          buildSoftwareSourceCodeJsonLd(pack),
          buildBreadcrumbJsonLd([
            { name: '首页', url: 'https://hermes-zh.com' },
            { name: '现成方案', url: 'https://hermes-zh.com/packs' },
            { name: pack.title, url: `https://hermes-zh.com/packs/${pack.id}` },
          ]),
        ]}
      />
      <Breadcrumb items={breadcrumbItems} />
      <section className="site-panel-elevated relative overflow-hidden px-8 py-10 md:px-12 md:py-14">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(45,184,110,0.14),transparent_68%)] lg:block" />

        <div className="relative max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="site-eyebrow">Pack 详情</span>
            {pack.featured ? <span className="site-meta-pill">精选 Pack</span> : null}
            <span className="site-meta-pill">{pack.category}</span>
          </div>

          <h1 className="mt-8 max-w-4xl font-serif text-4xl font-black leading-tight text-text-primary md:text-6xl md:tracking-[-0.04em]">
            {pack.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary md:text-lg">
            {buildHeroDescription(pack)}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-tertiary">
            <span className="site-meta-pill">适用方式：{getModeLabel(pack.modes)}</span>
            <span className="site-meta-pill">状态：已发布</span>
            <span className="site-meta-pill">安装说明：{installFileName}</span>
            {downloadFileName ? <span className="site-meta-pill">下载包：{downloadFileName}</span> : null}
          </div>

          {pack.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {pack.tags.map((tag) => (
                <span key={tag} className="site-meta-pill">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="site-panel-docs p-8 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">立即开始</p>
            <h2 className="mt-4 text-2xl font-bold text-text-primary md:text-3xl">先拿到安装入口，再决定是否继续深入文档</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base md:leading-8">
              当前 Pack 详情页只使用 manifest 与已发布文档数据。安装说明和下载文件会跳转到内容仓中的对应资源。
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href={installHref}
              target="_blank"
              rel="noreferrer"
              className="site-cta-primary"
              data-analytics-event="pack_install_click"
              data-analytics-label={`${pack.title} 安装说明`}
              data-analytics-destination={installHref}
              data-analytics-section="pack-detail"
            >
              查看安装说明
            </a>
            {relatedDoc ? (
              <Link href={toDocPath(relatedDoc.slug)} className="site-cta-secondary">
                阅读关联文档
              </Link>
            ) : null}
            <Link href="/packs" className="site-cta-secondary">
              返回 Packs
            </Link>
            {downloadHref ? (
              <a
                href={downloadHref}
                target="_blank"
                rel="noreferrer"
                className="site-cta-secondary"
                data-analytics-event="pack_download_click"
                data-analytics-label={`${pack.title} 下载`}
                data-analytics-destination={downloadHref}
                data-analytics-section="pack-detail"
              >
                下载 Pack 文件
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="site-section-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">适合谁用</p>
          <h2 className="mt-4 text-2xl font-bold text-text-primary">如果你符合这些条件，这个 Pack 会更顺手</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-text-secondary md:text-base md:leading-8">
            {suitableFor.map((item) => (
              <li key={item} className="rounded-2xl border border-border bg-white/[0.02] px-4 py-4">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="site-section-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">你会拿到什么</p>
          <h2 className="mt-4 text-2xl font-bold text-text-primary">最小可发布版本先把关键入口补齐</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-text-secondary md:text-base md:leading-8">
            {whatYouGet.map((item) => (
              <li key={item} className="rounded-2xl border border-border bg-white/[0.02] px-4 py-4">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {relatedDoc ? (
        <section className="site-panel-docs p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">关联文档</p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-text-primary">继续阅读《{relatedDoc.title}》</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base md:leading-8">
                {relatedDoc.description || '如果你需要完整上下文、适用边界或更细的落地说明，可以继续进入对应文档页阅读。'}
              </p>
            </div>

            <Link href={toDocPath(relatedDoc.slug)} className="site-cta-secondary">
              打开关联文档
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  )
}
