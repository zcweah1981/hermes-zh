export const SITE_URL = 'https://hermes-zh.com'
export const SITE_NAME = 'Hermes Agent 中文站'
export const SITE_DESCRIPTION = '基于真实内容仓构建的 Hermes Agent 中文文档、Packs 与落地导航站。'

export function joinSiteUrl(pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return new URL(normalized, SITE_URL).toString()
}