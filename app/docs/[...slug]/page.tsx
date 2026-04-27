import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DocSidebar } from '@/components/docs/doc-sidebar'
import { loadPagesManifest } from '@/lib/content/loaders/pages'

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolved = await params
  const slug = `/${(resolved.slug ?? []).join('/')}`.replace(/\/$/, '') || '/'
  const pages = await loadPagesManifest()
  const page = pages.find((item) => item.slug === slug || item.slug === `/docs${slug}`)

  if (!page) {
    notFound()
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[260px_minmax(0,1fr)]">
      <DocSidebar pages={pages} currentSlug={page.slug} />
      <article className="rounded-3xl border border-white/10 bg-surface p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">{page.module}</p>
        <h1 className="mt-4 text-3xl font-black text-white">{page.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{page.description}</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-stone-300">
          <p>这是文档详情页占位。</p>
          <p>当前正文先来自 generated pages-manifest 样板，后续替换为 Markdown + frontmatter + headings 渲染。</p>
          <p className="mt-3 text-muted">Source: {page.sourcePath}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/packs" className="rounded-xl border border-white/10 px-4 py-2 text-muted transition hover:bg-white/5 hover:text-white">
            查看 Packs
          </Link>
          <a
            href={page.githubUrl}
            className="rounded-xl border border-white/10 px-4 py-2 text-muted transition hover:bg-white/5 hover:text-white"
          >
            查看 GitHub 原文
          </a>
        </div>
      </article>
    </div>
  )
}
