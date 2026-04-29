export function toDocPath(slug: string) {
  const normalized = slug.startsWith('/') ? slug : `/${slug}`
  return normalized.startsWith('/docs/') ? normalized : `/docs${normalized}`
}