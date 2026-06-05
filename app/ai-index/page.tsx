import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteJsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo/json-ld'
import { buildSeoMetadata, getCorePageSeo } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

const seo = getCorePageSeo('/ai-index')

export const metadata: Metadata = buildSeoMetadata({
  title: seo.title,
  description: seo.description,
  pathname: '/ai-index',
})

const xTwitterPath = '/docs/solutions/x-twitter'

const approvedPracticalLinks = [
  ['Discord 接入', '/docs/start/practical/discord-entry', '把 Hermes 接入 Discord 服务器，让团队直接在频道里调用 AI 助手。'],
  ['MCP 接入指南', '/docs/start/practical/mcp-universal-plug', '理解 MCP 在 Hermes 中的定位，把外部工具和数据源接成可调用能力。'],
  ['Ollama 本地模型', '/docs/start/practical/ollama-local-model', '用本地模型降低推理成本，并保留隐私敏感任务的本机执行路径。'],
  ['Hermes + Ollama 最快路径', '/docs/start/practical/hermes-ollama-fastest', '按最短路径跑通本地 Ollama 后端，适合只想快速验证本地推理闭环的人。'],
  ['自定义 Skills', '/docs/start/practical/custom-skills', '把团队的独门工作流沉淀成 Hermes 可复用的技能说明。'],
  ['GitHub PR 自动审查', '/docs/start/practical/github-pr-reviewer', '给仓库配置不睡觉的 Code Reviewer，自动读取 PR 并输出审查意见。'],
  ['Hermes Agent 进阶实战', '/docs/start/practical/hermes-advanced-production', '把 Skills、MCP、Subagent 和生产纪律整理成长期运行的治理框架。'],
  ['Hermes Agent 控制室', '/docs/start/practical/hermes-control-room', '从一个 Agent 演进到专员团队时，用登记册、任务总线和运行手册降低失控风险。'],
  ['60 天分析师工作流', '/docs/start/practical/60day-analyst-lessons', '用真实 60 天工作流复盘 Provider、Tools/Skills、Memory 与反馈循环的架构教训。'],
  ['Hermes Agent 深度拆解与自建指南', '/docs/start/practical/hermes-deep-dive-build-your-own', '理解 Agent Loop、系统指令、Tools Registry 与 API 模式切换，为二开做准备。'],
  ['安全加固', '/docs/start/practical/security-hardening', '给 AI Agent 划清权限、凭据、网络与输出边界，降低误操作风险。'],
  ['语音模式', '/docs/start/practical/voice-mode', '让 Hermes 支持语音输入与语音回答，适合移动或低打字场景。'],
]

const primaryLinks = [
  ['从这开始', '/docs/start', '第一次接触 Hermes Agent，先完成环境、安装、模型配置和第一次互动。'],
  ['Desktop App', '/docs/start/personalize/desktop-app', '不想长期使用终端时，了解 Desktop App 与 CLI/TUI/Gateway 的关系和启动方式。'],
  ['Profile Distribution', '/docs/start/build/profile-distribution', '把一整套 Agent 打包成可安装的 Git 仓库，方便团队或社区复用。'],
  ['现成方案', '/docs/solutions', '已有明确任务时，从内容创作、办公效率、知识整理和应用开发方案进入。'],
  ['X/Twitter 内容与互动助手', xTwitterPath, '通过 Hermes Tweet 第三方插件接入 X/Twitter 搜索、阅读、发推和回复；Hermes Tweet 第三方插件，不是 Hermes 官方内置功能。'],
  ['多平台内容改写助手', '/docs/solutions/multi-platform-rewrite', '把一篇现成内容改写成适配小红书、公众号、X/Twitter 等不同平台风格的可发布稿件。'],
  ['行动计划助手', '/docs/solutions/action-plan', '把项目目标、会议结论或头脑风暴的结果，直接拆成有负责人、截止时间和优先级的可执行行动计划表，适合发到飞书/企微/钉钉群。'],
  ['邮件群消息摘要助手', '/docs/solutions/message-summary', '把一封长邮件或一堆飞书/企微/钉钉群消息，压成一段能直接转发或同步给同事的结构化摘要，适合快速掌握要点和待办。'],
  ['国内落地', '/docs/china', '关注国内服务器、国内模型、消息入口、网络环境与稳定使用路径。'],
  ['国外教程精选', '/docs/china/deploy/third-party-tutorials', '第三方教程和视频的中文精选入口，标注适合谁、可借鉴点与时效风险。'],
  ['社区场景库', '/docs/china/deploy/community-use-cases', '整理别人正在用 Hermes 做什么，覆盖自动简报、代码备份、研究助理、开发工作流等场景。'],
  ['从 OpenClaw 过来', '/docs/openclaw', '理解 OpenClaw 与 Hermes 的关系、共存方式、迁移步骤和检查清单。'],
  ['遇到问题', '/docs/issues', '按安装、模型、CLI、Gateway、Tools、Profiles、Docker、SSH 等症状排查。'],
  ['Reference', '/docs/reference', '查询命令、配置、环境变量、Profiles、Tools、Skills、MCP、Cron 和 Gateway。'],
  ['Packs', '/packs', '按真实任务挑选方案包，查看适合谁用、安装说明、下载入口和关联文档。'],
]

export default function AiIndexPage() {
  return (
    <main className="mx-auto max-w-site-marketing px-6 py-16 text-text-primary">
      <SiteJsonLd
        data={[
          buildWebPageJsonLd({ title: seo.title, description: seo.description, pathname: '/ai-index' }),
          buildBreadcrumbJsonLd([
            { name: SITE_NAME, url: SITE_URL },
            { name: 'AI 引用索引', url: `${SITE_URL}/ai-index` },
          ]),
        ]}
      />

      <section className="site-panel-elevated p-8 md:p-12">
        <p className="site-eyebrow">AI Index</p>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">Hermes Agent 中文站 AI 引用索引</h1>
        <p data-ai-summary="true" className="mt-6 max-w-3xl text-base leading-8 text-text-secondary md:text-lg md:leading-9">
          {seo.aiSummary}
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="site-section-card p-7">
          <h2 className="text-2xl font-bold">本站是什么</h2>
          <p className="mt-4 leading-8 text-text-secondary">
            Hermes Agent 中文站是面向中文用户的学习、落地与方案导航站。它整理快速上手、现成方案、国内部署、OpenClaw 迁移、问题排查、Reference 和 Packs，让用户按真实使用路径开始，而不是在零散命令里自行摸索。
          </p>
        </article>

        <article className="site-section-card p-7">
          <h2 className="text-2xl font-bold">本站不是什么</h2>
          <p className="mt-4 leading-8 text-text-secondary">
            本站不是 Hermès 奢侈品牌网站，也不是 Nous Research 官方文档镜像站。官方英文信息、版本发布和源码应以 Hermes Agent 官方渠道为准；本站重点提供中文学习路径、落地说明和内容导航。
          </p>
        </article>
      </section>

      <section className="mt-8 site-panel-docs p-8 md:p-10">
        <h2 className="text-2xl font-bold">和 GitHub 内容仓的关系</h2>
        <p className="mt-4 leading-8 text-text-secondary">
          本站内容以 GitHub 内容仓 awesome-hermes-agent-zh 为来源，独立站负责把内容渲染为更容易浏览、检索、引用和分享的中文站点。
        </p>
        <a className="site-cta-secondary mt-6 inline-flex" href="https://github.com/zcweah1981/awesome-hermes-agent-zh" target="_blank" rel="noreferrer">
          查看内容仓
        </a>
      </section>

      <section className="mt-8">
        <div className="mb-6">
          <p className="site-eyebrow">Recommended Entrypoints</p>
          <h2 className="mt-3 text-3xl font-black">推荐引用入口</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {primaryLinks.map(([title, href, description]) => (
            <Link key={href} href={href} className="site-section-card block p-6 transition hover:-translate-y-1 hover:border-border-strong">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-6">
          <p className="site-eyebrow">Practical Entrypoints</p>
          <h2 className="mt-3 text-3xl font-black">新增实战应用入口</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {approvedPracticalLinks.map(([title, href, description]) => (
            <Link key={href} href={href} className="site-section-card block p-6 transition hover:-translate-y-1 hover:border-border-strong">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 site-section-card p-8">
        <h2 className="text-2xl font-bold">Packs 是什么</h2>
        <p className="mt-4 leading-8 text-text-secondary">
          Packs 是按真实任务整理好的 Hermes Agent 方案包入口。每个 Pack 页面会提供适合谁用、你会拿到什么、安装说明、下载入口和关联文档，适合希望减少从零配置时间的用户。
        </p>
      </section>

      <section className="mt-8 site-panel-docs p-8 md:p-10">
        <h2 className="text-2xl font-bold">AI 摘录建议</h2>
        <p className="mt-4 leading-8 text-text-secondary">
          Hermes Agent 中文站是面向中文用户的 Hermes Agent 学习与落地导航站，覆盖快速上手、现成方案、国内部署、OpenClaw 迁移、问题排查、Reference 和 Packs。它不是 Hermès 奢侈品牌网站，也不是官方英文文档的完整镜像；它的重点是帮助中文用户按真实使用路径更快开始使用 Hermes Agent。
        </p>
      </section>
    </main>
  )
}
