import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { loadPacksManifest } from '@/lib/content/loaders/packs'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

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

  return {
    title: `${pack.title} Pack`,
    description: pack.summary ?? '',
    alternates: {
      canonical: buildCanonicalUrl(`/packs/${pack.id}`),
    },
  }
}

export default async function PackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pack = await getPack(id)

  if (!pack) {
    notFound()
  }

  const pages = await loadPagesManifest()
  const relatedDoc = pages.find((page) => page.sourcePath === pack.doc && page.status === 'published')

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="site-panel-docs overflow-hidden p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">{pack.category}</p>
        <h1 className="mt-4 text-3xl font-black text-white">{pack.title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted">{pack.summary}</p>

        <dl className="mt-8 grid gap-4 text-sm text-stone-300 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <dt className="text-muted">适用方式</dt>
            <dd className="mt-2">{pack.modes.map((mode) => (mode === 'solo' ? '单人' : '协作')).join(' / ')}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <dt className="text-muted">状态</dt>
            <dd className="mt-2">已发布</dd>
          </div>
        </dl>

        {pack.tags?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {pack.tags.map((tag) => (
              <span key={tag} className="site-meta-pill">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/packs" className="site-cta-primary px-4 py-2">
            返回 Packs
          </Link>
          {relatedDoc ? (
            <Link href={toDocPath(relatedDoc.slug)} className="site-cta-secondary px-4 py-2">
              阅读关联文档
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
