import { promises as fs } from 'node:fs'
import path from 'node:path'

import { loadContentPages } from '../lib/content/sync/source-loader'
import type { SitePage } from '../lib/content/types'

const repoPath = process.env.CONTENT_REPO_PATH ?? '/opt/projects/awesome-hermes-agent-zh'
const outputPath = path.join(process.cwd(), 'content-cache', 'generated', 'pages-manifest.json')

const fallbackPages: SitePage[] = [
  {
    sourcePath: 'docs/01-start/overview.md',
    slug: '/start',
    title: '从这开始',
    module: 'start',
    section: 'overview',
    description: 'Hermes 中文站学习主线入口。',
    order: 1,
    status: 'published',
    updated: '2026-04-27',
    sourceType: 'generated',
    navGroup: '01-从这开始',
    pageType: 'module-overview',
    headings: [{ depth: 2, text: '当前骨架说明', id: '当前骨架说明' }],
    body: '## 当前骨架说明\n\n这里是首页与文档页统一设计系统的最小占位内容。',
    githubUrl: 'https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/site-content-anchor/README.md',
    next: '/start/basic-usage',
  },
  {
    sourcePath: 'docs/01-start/basic-usage.md',
    slug: '/start/basic-usage',
    title: '认识基本使用方式',
    module: 'start',
    section: 'get-running',
    description: '文档详情页最小样板，用于验证 docs 路由与 sidebar。',
    order: 2,
    status: 'published',
    updated: '2026-04-27',
    sourceType: 'generated',
    navGroup: '01-从这开始',
    pageType: 'doc-page',
    headings: [{ depth: 2, text: '下一步', id: '下一步' }],
    body: '## 下一步\n\n后续由 Markdown loader 替换该样板正文。',
    githubUrl: 'https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/site-content-anchor/README.md',
    prev: '/start',
  },
]

async function main() {
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  let pages = await loadContentPages(repoPath)
  pages = pages.filter((page) => page.status === 'published')

  if (pages.length === 0) {
    pages = fallbackPages
  }

  await fs.writeFile(outputPath, JSON.stringify(pages, null, 2) + '\n', 'utf8')
  console.log(`synced ${pages.length} pages -> ${path.relative(process.cwd(), outputPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
