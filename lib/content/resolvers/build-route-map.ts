import type { RouteMapItem, SitePage } from '@/lib/content/types'

export function buildRouteMap(pages: SitePage[]): RouteMapItem[] {
  return pages.map((page) => ({
    sourcePath: page.sourcePath,
    slug: page.slug,
    pageType: page.pageType,
    module: page.module,
    title: page.title,
    section: page.section,
    description: page.description,
    order: page.order,
    status: page.status,
    updated: page.updated,
    sourceType: page.sourceType,
    navGroup: page.navGroup,
  }))
}
