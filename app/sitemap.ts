import type { MetadataRoute } from 'next'

import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await loadPagesManifest()
  return pages.map((page) => ({
    url: buildCanonicalUrl(page.slug),
    lastModified: page.updated,
  }))
}
