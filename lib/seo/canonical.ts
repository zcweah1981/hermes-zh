import { joinSiteUrl } from '@/lib/site-config'

export function buildCanonicalUrl(slug: string) {
  const normalized = slug === '/' ? '/' : slug.replace(/\/$/, '')
  const url = joinSiteUrl(normalized)
  // Match sitemap.ts behavior: trailing slash for homepage
  if (normalized === '/') {
    return url.endsWith('/') ? url : `${url}/`
  }
  return url
}

// Compile-time guard for high-value recovered URL canonical target.
void buildCanonicalUrl('/docs/china/models')
