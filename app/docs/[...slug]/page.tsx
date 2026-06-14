import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DocOutline, DocPrevNext } from '@/components/docs/doc-outline'
import { DocSidebar } from '@/components/docs/doc-sidebar'
import { MarkdownBody } from '@/components/docs/markdown-body'
import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { toDocLinkTargets, toDocSidebarItems } from '@/lib/docs/docs-page-projections'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'
import { SiteJsonLd, buildAnswerBlockJsonLd, buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildTechArticleJsonLd, buildCreativeWorkJsonLd } from '@/lib/seo/json-ld'
import { buildSeoMetadata, CORE_PAGE_SEO, getCorePageSeo, getDocsSeoDescription } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb'

export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false
export const fetchCache = 'force-cache'

export async function generateStaticParams() {
  const pages = await loadPagesManifest()

  return pages
    .filter((page) => page.status === 'published')
    .map((page) => ({
      slug: toDocPath(page.slug).replace(/^\/docs\/?/, '').split('/').filter(Boolean),
    }))
}

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
  const parentDocPath = toDocPath(page.slug).split('/').slice(0, 3).join('/') || '/docs'
  const parentName = page.module || '文档'
  const faqJsonLd = buildFAQPageJsonLd(page)
  const answerBlockJsonLd = buildAnswerBlockJsonLd(page)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: '首页', url: SITE_URL },
    { name: parentName, url: buildCanonicalUrl(parentDocPath) },
    { name: page.title, url: buildCanonicalUrl(docPath) },
  ])
  const creativeWorkJsonLd = buildCreativeWorkJsonLd(page)

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '首页', url: '/' },
    { name: parentName, url: parentDocPath },
    { name: page.title },
  ]

  const jsonLdData = [
    buildTechArticleJsonLd(page),
    breadcrumbJsonLd,
    creativeWorkJsonLd,
    faqJsonLd,
    answerBlockJsonLd,
  ].filter(Boolean) as Record<string, unknown>[]
  const sidebarItems = toDocSidebarItems(pages)
  const linkTargets = toDocLinkTargets(pages)

  const genericDocsDesktopClsStabilizerSlugs = new Set(['/docs-overview', '/solutions', '/solutions/xiaohongshu', '/china/entry/feishu'])
  const docDesktopClsStabilizer = page.slug === '/start' ? 'start' : genericDocsDesktopClsStabilizerSlugs.has(page.slug) ? 'generic-field' : undefined
  const docsStartMarkdownShellStyle =
    page.slug === '/start'
      ? { marginTop: '0', minHeight: '5434px', contain: 'layout paint' as const }
      : { minHeight: '600px', contain: 'layout' as const }

  const fieldImagePreloads = [
    { slug: '/start/practical/home-assistant', href: '/content-assets/solution-practical-10-home-assistant-control-loop-v1.webp' },
    { slug: '/start/build/memory-providers/holographic', href: '/content-assets/rm2-5-memory-providers-02-holographic-first-route.webp' },
    { slug: '/china/deploy/tencent-lite-server', href: '/content-assets/tencent-buy-hermes-agent.webp' },
  ].filter((image) => image.slug === page.slug)

  return (
    <div
      className="site-doc-page-grid mx-auto grid max-w-site-docs gap-6 px-6 py-8 xl:grid-cols-[280px_minmax(0,1fr)_250px]"
      data-doc-desktop-cls-stabilizer={docDesktopClsStabilizer}
      suppressHydrationWarning
    >
      <SiteJsonLd data={jsonLdData} />

      <article className="site-panel-docs site-doc-article order-1 overflow-hidden p-6 xl:order-2 lg:p-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="site-doc-header border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">{page.module}</p>
          <h1 className="mt-4 text-3xl font-black text-white lg:text-4xl">
            {page.title}
            <span className="sr-only" data-lcp-marker="doc-title">LCP</span>
          </h1>
          <p data-ai-summary="true" className="mt-4 max-w-3xl text-base leading-8 text-text-secondary">{effectiveDescription}</p>
          {page.slug === '/start' ? (
            <link rel="preload" as="image" href="/content-assets/rm2-learning-path-gemini-final-v2-lcp.webp" fetchPriority="high" />
          ) : null}
          {fieldImagePreloads.map((image) => (
            <link key={image.href} rel="preload" as="image" href={image.href} fetchPriority="high" />
          ))}

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-text-tertiary">
            <span className="site-meta-pill">最后更新：{page.updated || '未标注'}</span>
            <a href={page.githubUrl} target="_blank" rel="noreferrer" className="site-meta-pill hover:border-border-strong hover:text-text-primary">
              查看 GitHub 原文
            </a>
          </div>
        </div>

        <div className={page.slug === '/start' ? 'docs-start-markdown-shell' : 'mt-10'} style={docsStartMarkdownShellStyle}>
          <MarkdownBody page={page} linkTargets={linkTargets} />
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

      <DocSidebar items={sidebarItems} currentSlug={page.slug} className="order-2 xl:order-1" />

      <DocOutline page={page} className="order-3" />
    </div>
  )
}
