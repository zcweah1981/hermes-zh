import type { Metadata } from 'next'
import Link from 'next/link'

import { loadSearchIndex } from '@/lib/content/loaders/search'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

type SearchPageProps = {
  searchParams?: Promise<{ q?: string }>
}

function normalizeTerm(value: string) {
  return value.trim().toLowerCase()
}

function scoreEntry(term: string, entry: Awaited<ReturnType<typeof loadSearchIndex>>[number]) {
  const haystack = [entry.title, entry.description, entry.module, ...entry.headings].join(' ').toLowerCase()

  if (!term) {
    return 0
  }

  if (entry.title.toLowerCase().includes(term)) {
    return 4
  }

  if (entry.description.toLowerCase().includes(term)) {
    return 3
  }

  if (entry.headings.some((heading) => heading.toLowerCase().includes(term))) {
    return 2
  }

  if (haystack.includes(term)) {
    return 1
  }

  return -1
}

function buildEntryHref(entry: Awaited<ReturnType<typeof loadSearchIndex>>[number]) {
  return entry.type === 'page' ? toDocPath(entry.slug) : entry.slug
}

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索 Hermes 中文站文档与 Packs 索引。',
  alternates: {
    canonical: buildCanonicalUrl('/search'),
  },
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = (await searchParams) ?? {}
  const query = typeof resolved.q === 'string' ? resolved.q : ''
  const term = normalizeTerm(query)
  const index = await loadSearchIndex()
  const results = (term
    ? index
        .map((entry) => ({ entry, score: scoreEntry(term, entry) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'zh-CN'))
        .map((item) => item.entry)
    : index.slice(0, 12)
  )

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="site-doc-header">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">Search</p>
        <h1 className="mt-4 text-3xl font-black text-white lg:text-4xl">搜索文档与 Packs</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-text-secondary">基于内容仓生成的 search-index.json，支持按标题、描述、模块和正文标题快速定位入口。</p>

        <form action="/search" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="例如：安装、Gateway、Packs、Memory"
            className="w-full rounded-md border border-border bg-black/20 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary"
          />
          <button type="submit" className="site-cta-primary px-5 py-3">
            搜索
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 text-sm text-text-tertiary">
        <p>{term ? `共找到 ${results.length} 条结果` : '先给你常用入口；输入关键词后会按相关度过滤。'}</p>
        <Link href="/docs/docs-overview" className="site-cta-secondary px-4 py-2">
          浏览文档总览
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {results.length ? (
          results.map((entry) => (
            <Link key={`${entry.type}:${entry.slug}`} href={buildEntryHref(entry)} className="site-section-card site-section-card-interactive p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                <span className="site-meta-pill">{entry.type === 'page' ? '文档' : 'Pack'}</span>
                <span className="site-meta-pill">模块：{entry.module}</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{entry.title}</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{entry.description || '该条目当前未提供额外描述。'}</p>
              {entry.headings.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.headings.slice(0, 4).map((heading) => (
                    <span key={heading} className="site-meta-pill">
                      {heading}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="site-section-card p-6 text-sm leading-7 text-text-secondary">
            没找到匹配项。建议换一个更短的关键词，或先从“文档总览 / 从这开始 / Reference / Packs”这些主入口继续浏览。
          </div>
        )}
      </div>
    </div>
  )
}