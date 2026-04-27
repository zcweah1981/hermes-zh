export function buildCanonicalUrl(slug: string) {
  const normalized = slug.startsWith('/') ? slug : `/${slug}`
  return `https://hermes-zh.local${normalized}`
}
