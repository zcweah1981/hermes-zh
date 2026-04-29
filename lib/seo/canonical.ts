import { joinSiteUrl } from '@/lib/site-config'

export function buildCanonicalUrl(slug: string) {
  return joinSiteUrl(slug)
}
