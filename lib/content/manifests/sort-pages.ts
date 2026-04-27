import type { SitePage } from '@/lib/content/types'

export function sortPages(pages: SitePage[]) {
  return [...pages].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug, 'zh-CN'))
}
