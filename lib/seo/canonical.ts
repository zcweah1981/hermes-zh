import { joinSiteUrl } from '@/lib/site-config'

export function buildCanonicalUrl(slug: string) {
  const normalized = slug === '/' ? '/' : slug.replace(/\/$/, '')
  return joinSiteUrl(normalized)
}

// Compile-time guard for high-value recovered URL canonical target.
void buildCanonicalUrl('/docs/china/models')
