import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DocOutline, DocPrevNext } from '@/components/docs/doc-outline'
import { DocSidebar } from '@/components/docs/doc-sidebar'
import { MarkdownBody } from '@/components/docs/markdown-body'
import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

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

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: buildCanonicalUrl(toDocPath(page.slug)),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: buildCanonicalUrl(toDocPath(page.slug)),
      type: 'article',
    },
  }
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolved = await params
  const { pages, page } = await getCurrentPage(resolved.slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="site-doc-page-grid mx-auto grid max-w-site-docs gap-6 px-6 py-8 xl:grid-cols-[280px_minmax(0,1fr)_250px]">
      <DocSidebar pages={pages} currentSlug={page.slug} />

      <article className="site-panel-docs site-doc-article overflow-hidden p-6 lg:p-8">
        <div className="site-doc-header border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">{page.module}</p>
          <h1 className="mt-4 text-3xl font-black text-white lg:text-4xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-text-secondary">{page.description}</p>

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

        <DocPrevNext page={page} pages={pages} />
      </article>

      <DocOutline page={page} />
    </div>
  )
}
