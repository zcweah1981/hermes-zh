export const SITE_URL = 'https://hermes-zh.com'
export const SITE_NAME = 'Hermes Agent 中文站'
export const SITE_DESCRIPTION = 'Hermes Agent 中文站是一套面向中文用户的 AI Agent 全流程实践指南，覆盖快速上手、现成方案、国内模型与入口、OpenClaw 迁移、参考手册、Packs 方案包与问题排查。'

export function joinSiteUrl(pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return new URL(normalized, SITE_URL).toString()
}