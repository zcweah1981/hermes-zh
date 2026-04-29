import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { loadPacksManifest } from '@/lib/content/loaders/packs'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

async function getPack(id: string) {
  const packs = await loadPacksManifest()
  return packs.find((item) => item.id === id)
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-surface p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">{pack.category}</p>
        <h1 className="mt-4 text-3xl font-black text-white">{pack.title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted">{pack.summary}</p>

        <dl className="mt-8 grid gap-4 text-sm text-stone-300 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <dt className="text-muted">Doc</dt>
            <dd className="mt-2">{pack.doc}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <dt className="text-muted">Install</dt>
            <dd className="mt-2">{pack.install}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/packs" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
            返回 Packs
          </Link>
          <Link href="/docs/start" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-muted">
            查看关联文档骨架
          </Link>
        </div>
      </div>
    </div>
  )
}
