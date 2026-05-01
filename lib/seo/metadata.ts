import type { Metadata } from 'next'

import type { SitePack, SitePage } from '@/lib/content/types'
import { getDocNavSummary } from '@/lib/docs/nav-summary'
import { buildCanonicalUrl } from '@/lib/seo/canonical'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site-config'

export const DEFAULT_OG_IMAGE = '/og/hermes-zh-og.png'
export const DEFAULT_TITLE = 'Hermes Agent 中文站：快速上手、现成方案、国内落地与 OpenClaw 迁移'
export const DEFAULT_DESCRIPTION =
  'Hermes Agent 中文站是一套面向中文用户的 AI Agent 全流程实践指南，覆盖快速上手、现成方案、国内模型与入口、OpenClaw 迁移、参考手册、Packs 方案包与问题排查。'

export const CORE_PAGE_SEO: Record<string, { title: string; description: string; aiSummary: string }> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    aiSummary:
      'Hermes Agent 中文站是面向中文用户的 Hermes Agent 学习与落地入口。你可以从快速跑通开始，也可以直接进入现成方案、国内部署、OpenClaw 迁移、问题排查、Reference 或 Packs。本站重点解决“怎么开始、怎么在国内跑稳、怎么把现成方案拿来用”。',
  },
  '/docs/start': {
    title: '从这开始｜Hermes Agent 中文站',
    description: '从环境准备、服务器连接、安装配置到第一次互动，按顺序带你把 Hermes Agent 真正跑起来，并理解后续学习路径该从哪里继续。',
    aiSummary:
      '如果你是第一次接触 Hermes Agent，从这里开始。这个模块先帮你准备运行环境、连接服务器、安装 Hermes、配置模型，并完成第一次真实互动。目标不是讲完所有功能，而是让你先跑通。',
  },
  '/docs/solutions': {
    title: 'Hermes Agent 现成方案｜内容、办公与开发场景 Packs',
    description: '按内容创作、办公效率、应用开发等真实任务整理 Hermes Agent 现成方案和对应 Packs。',
    aiSummary:
      '这个模块面向已经有具体任务的用户。你可以从小红书、公众号、PPT、会议纪要、日报、资料总结、微信小程序、Web 原型等场景进入，先看可用方案，再决定是否安装对应 Pack。',
  },
  '/docs/china': {
    title: 'Hermes Agent 国内部署与模型接入指南',
    description: '围绕国内服务器、模型接口、消息入口和网络环境，整理 Hermes Agent 在国内落地的决策路径。',
    aiSummary:
      '国内落地最容易卡在服务器、模型接口、代理、消息入口和稳定性。这个模块把国内部署、国内模型和国内入口拆开说明，适合想用 DeepSeek、Kimi、智谱、百炼、腾讯云或自定义兼容接口的用户。',
  },
  '/docs/openclaw': {
    title: '从 OpenClaw 到 Hermes｜关系、共存与迁移路径',
    description: '帮助 OpenClaw 用户理解 Hermes Agent 的关系、差异、共存策略和迁移路径。',
    aiSummary:
      '如果你已经用过 OpenClaw，这里先帮你判断：继续用、共存，还是迁移到 Hermes。模块会解释 OpenClaw 与 Hermes 的关系、差异、共存方式、迁移步骤和常见问题。',
  },
  '/docs/reference': {
    title: 'Hermes Agent Reference｜CLI、配置、环境变量与命令参考',
    description: '集中查询 Hermes Agent 的 CLI、Slash Commands、Profile、环境变量、Tools、Skills 与 MCP 参考信息。',
    aiSummary:
      'Reference 是查表入口，适合已经开始使用 Hermes 的用户快速定位命令、配置、环境变量、Profiles、Tools、Skills、MCP、Cron、Gateway、模型 Provider 与部署相关细节。',
  },
  '/docs/issues': {
    title: 'Hermes Agent 常见问题与排查指南',
    description: '按安装、模型、CLI、Gateway、Tools、Profiles、Docker、SSH 等问题类型定位 Hermes Agent 排查路径。',
    aiSummary:
      '如果 Hermes 没有按预期运行，先从这里按症状分流。这个模块覆盖安装更新、模型 Provider、自定义 endpoint、CLI/TUI、Gateway 推送、Tools/Skills/MCP、Profiles、Docker、Nix、SSH 与远程后端问题。',
  },
  '/packs': {
    title: 'Hermes Agent Packs｜按场景挑选可用方案包',
    description: '浏览已经整理好的 Hermes Agent Packs，按内容创作、办公效率、应用开发等场景选择安装与下载入口。',
    aiSummary:
      'Packs 是按真实任务整理好的方案包入口。你可以先按场景选择 Pack，再查看关联文档、安装说明和下载入口。当前 Packs 覆盖内容创作、办公效率、知识整理、应用开发与快速原型。',
  },
  '/ai-index': {
    title: 'Hermes Agent 中文站 AI 引用索引｜站点说明与推荐入口',
    description: '为搜索引擎和 AI 助手说明 Hermes Agent 中文站的定位、范围、核心页面、Packs 和推荐引用入口。',
    aiSummary:
      '这个页面用于帮助 AI 搜索和 LLM 正确理解 Hermes Agent 中文站。它说明本站是什么、不是什么、和官方文档及 GitHub 内容仓的关系，并列出适合引用的新手入口、国内落地、OpenClaw 迁移、问题排查、Reference 与 Packs 页面。',
  },
}

export function absoluteOgImage(pathname = DEFAULT_OG_IMAGE) {
  return new URL(pathname, SITE_URL).toString()
}

export function getEffectiveDescription(page: SitePage) {
  // Filters template-only descriptions such as “这一页只解决一件事：” before generating SEO metadata.
  return getDocNavSummary(page)
}

export function getDocsSeoDescription(page: SitePage, pathname?: string) {
  const coreDescription = pathname ? CORE_PAGE_SEO[pathname]?.description : undefined
  const summary = coreDescription ?? getEffectiveDescription(page)

  if (summary.trim().length >= 50) {
    return summary
  }

  const moduleName = page.module || '文档'
  const sectionName = page.section && page.section !== moduleName ? `、${page.section}` : ''

  return `${page.title} 是 Hermes Agent 中文站「${moduleName}${sectionName}」路径下的中文说明页，帮助你理解适用场景、关键步骤、常见坑和下一步入口，并和快速上手、现成方案、Packs、问题排查及参考手册形成完整学习链路。`
}

export function getPackSeoDescription(pack: SitePack) {
  const custom: Record<string, string> = {
    'miniapp-lab': '微信小程序助手 Pack 面向应用开发与快速原型场景，帮助你用 Hermes 更快整理需求、拆解页面、生成实现路径和样例输出。',
    'webdev-lab': '敏捷 Web 开发助手 Pack 面向 Web 原型和功能开发场景，帮助你把需求、任务拆解、实现步骤和验收标准串成可执行流程。',
    'meeting-lab': '会议纪要助手 Pack 面向办公效率场景，帮助你把会议输入整理成纪要、行动项、责任人和后续跟进清单。',
    'daily-report-lab': '项目日报助手 Pack 面向项目管理和团队协作场景，帮助你把零散进展整理成清晰日报、风险和下一步行动。',
    'summary-lab': '资料总结助手 Pack 面向知识整理场景，帮助你从长文档、材料和会议内容中提炼结构化摘要、结论和行动建议。',
    'xhs-lab': '小红书内容助手 Pack 面向内容创作与发布场景，帮助你从选题、结构、标题到正文草稿更快形成可发布内容。',
    'wechat-writer-lab': '公众号写作助手 Pack 面向公众号内容创作场景，帮助你整理选题、文章结构、正文草稿和发布前检查清单。',
    'ppt-lab': 'PPT 助手 Pack 面向汇报和演示场景，帮助你把主题、听众、结构和页面要点整理成可继续设计的 PPT 草稿。',
  }

  return custom[pack.id] ?? `${pack.title} 是面向「${pack.category}」场景的 Hermes Agent Pack，提供关联文档、安装说明和下载入口，帮助你更快开始可执行流程。`
}

export function buildSeoMetadata(input: {
  title: string
  description: string
  pathname: string
  type?: 'website' | 'article'
  noIndex?: boolean
  image?: string
}): Metadata {
  const canonical = buildCanonicalUrl(input.pathname)
  const image = absoluteOgImage(input.image)

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: input.type ?? 'website',
      url: canonical,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      locale: 'zh_CN',
      images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
    robots: {
      index: !input.noIndex,
      follow: true,
    },
  }
}

export function getCorePageSeo(pathname: string) {
  return CORE_PAGE_SEO[pathname] ?? {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    aiSummary: SITE_DESCRIPTION,
  }
}
