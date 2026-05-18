import type { MetadataRoute } from 'next'

import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { loadPacksManifest } from '@/lib/content/loaders/packs'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, packs] = await Promise.all([loadPagesManifest(), loadPacksManifest()])
  const staticRoutes = ['/', '/docs/docs-overview', '/packs', '/llms.txt', '/ai-index']

  const entries = [
    ...staticRoutes.map((route) => ({
      url: buildCanonicalUrl(route),
      lastModified: undefined,
      changeFrequency: 'daily' as const,
      priority: route === '/' ? 1 : 0.8,
    })),
    ...pages.filter((page) => page.status === 'published').map((page) => ({
      url: buildCanonicalUrl(toDocPath(page.slug)),
      lastModified: page.updated || undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...packs.filter((pack) => pack.status === 'published').map((pack) => ({
      url: buildCanonicalUrl(`/packs/${pack.id}`),
      lastModified: undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]

  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values())
}
