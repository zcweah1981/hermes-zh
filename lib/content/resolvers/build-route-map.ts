import type { RouteMapItem, SitePage } from '@/lib/content/types'

export function buildRouteMap(pages: SitePage[]): RouteMapItem[] {
  return pages.map((page) => ({
    sourcePath: page.sourcePath,
    slug: page.slug,
    pageType: page.pageType,
    module: page.module,
  }))
}
