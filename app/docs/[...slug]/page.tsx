import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DocOutline, DocPrevNext } from '@/components/docs/doc-outline'
import { DocSidebar } from '@/components/docs/doc-sidebar'
import { MarkdownBody } from '@/components/docs/markdown-body'
import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'
import { SiteJsonLd, buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildTechArticleJsonLd, buildCreativeWorkJsonLd } from '@/lib/seo/json-ld'
import { buildSeoMetadata, CORE_PAGE_SEO, getCorePageSeo, getDocsSeoDescription } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb'

async function getCurrentPage(slugParts?: string[]) {
  const slug = `/${(slugParts ?? []).join('/')}`.replace(/\/$/, '') || '/'
  const pages = await loadPagesManifest()
  const page = pages.find((item) => toDocPath(item.slug) === `/docs${slug}` || toDocPath(item.slug) === slug)

  return { pages, page }
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const resolved = await params
  const { page } = await getCurrentPage(resolved.slug)

  if (!page) {
    return {}
  }

  const docPath = toDocPath(page.slug)
  const description = getDocsSeoDescription(page, docPath)

  return buildSeoMetadata({
    title: page.title,
    description,
    pathname: docPath,
    type: 'article',
    noIndex: page.status !== 'published',
  })
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolved = await params
  const { pages, page } = await getCurrentPage(resolved.slug)

  if (!page) {
    notFound()
  }

  const docPath = toDocPath(page.slug)
  const corePageSeo = CORE_PAGE_SEO[docPath] ? getCorePageSeo(docPath) : null
  const effectiveDescription = corePageSeo?.aiSummary ?? getDocsSeoDescription(page, docPath)
  const faqJsonLd = buildFAQPageJsonLd(page)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: '首页', url: SITE_URL },
    { name: page.module || '文档', url: buildCanonicalUrl(toDocPath(page.slug).split('/').slice(0, 3).join('/') || '/docs') },
    { name: page.title, url: buildCanonicalUrl(toDocPath(page.slug)) },
  ])
  const creativeWorkJsonLd = buildCreativeWorkJsonLd(page)

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '首页', url: '/' },
    { name: page.module, url: `/docs#${page.module}` },
    { name: page.title }
  ]

  return (
    <div className="site-doc-page-grid mx-auto grid max-w-site-docs gap-6 px-6 py-8 xl:grid-cols-[280px_minmax(0,1fr)_250px]">
      <SiteJsonLd data={faqJsonLd ? [buildTechArticleJsonLd(page), breadcrumbJsonLd, creativeWorkJsonLd, faqJsonLd] : [buildTechArticleJsonLd(page), breadcrumbJsonLd, creativeWorkJsonLd]} />
      <DocSidebar pages={pages} currentSlug={page.slug} />

      <article className="site-panel-docs site-doc-article overflow-hidden p-6 lg:p-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="site-doc-header border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">{page.module}</p>
          <h1 className="mt-4 text-3xl font-black text-white lg:text-4xl">{page.title}</h1>
          <p data-ai-summary="true" className="mt-4 max-w-3xl text-base leading-8 text-text-secondary">{effectiveDescription}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-text-tertiary">
            <span className="site-meta-pill">最后更新：{page.updated || '未标注'}</span>
            <a href={page.githubUrl} target="_blank" rel="noreferrer" className="site-meta-pill hover:border-border-strong hover:text-text-primary">
              查看 GitHub 原文
            </a>
          </div>
        </div>

        <div className="mt-10">
          <MarkdownBody page={page} pages={pages} />
        </div>

        <nav data-seo-internal-links="index-recovery" aria-label="索引恢复推荐入口" className="mt-10 rounded-2xl border border-border bg-surface-muted/70 p-5">
          <p className="text-sm font-semibold text-text-primary">继续定位 Hermes Agent 路线</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/docs/start" className="site-cta-secondary px-4 py-2">快速上手</Link>
            <Link href="/docs/solutions" className="site-cta-secondary px-4 py-2">现成方案</Link>
            <Link href="/docs/china/models" className="site-cta-secondary px-4 py-2">国内模型</Link>
            <Link href="/packs" className="site-cta-secondary px-4 py-2">Packs</Link>
          </div>
        </nav>

        <DocPrevNext page={page} pages={pages} />
      </article>

      <DocOutline page={page} />
    </div>
  )
}
