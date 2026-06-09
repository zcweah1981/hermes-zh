import type { SitePage } from '@/lib/content/types'

export type DocSidebarItem = Pick<SitePage, 'sourcePath' | 'slug' | 'title' | 'module' | 'order'>
export type DocLinkTarget = Pick<SitePage, 'sourcePath' | 'slug'>

export function toDocSidebarItems(pages: SitePage[]): DocSidebarItem[] {
  return pages.map(({ sourcePath, slug, title, module, order }) => ({
    sourcePath,
    slug,
    title,
    module,
    order,
  }))
}

export function toDocLinkTargets(pages: SitePage[]): DocLinkTarget[] {
  return pages.map(({ sourcePath, slug }) => ({ sourcePath, slug }))
}
