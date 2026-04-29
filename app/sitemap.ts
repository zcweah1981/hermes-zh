import type { MetadataRoute } from 'next'

import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { loadPacksManifest } from '@/lib/content/loaders/packs'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, packs] = await Promise.all([loadPagesManifest(), loadPacksManifest()])
  const staticRoutes = ['/', '/docs/docs-overview', '/packs']

  const entries = [
    ...staticRoutes.map((route) => ({
      url: buildCanonicalUrl(route),
      lastModified: undefined,
    })),
    ...pages.filter((page) => page.status === 'published').map((page) => ({
      url: buildCanonicalUrl(toDocPath(page.slug)),
      lastModified: page.updated || undefined,
    })),
    ...packs.filter((pack) => pack.status === 'published').map((pack) => ({
      url: buildCanonicalUrl(`/packs/${pack.id}`),
      lastModified: undefined,
    })),
  ]

  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values())
}
