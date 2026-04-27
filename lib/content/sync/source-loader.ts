import { promises as fs } from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'
import matter from 'gray-matter'

import type { SitePage, SitePack } from '@/lib/content/types'
import { parseHeadings } from '@/lib/content/parsers/headings'

const DEFAULT_CONTENT_REPO = process.env.CONTENT_REPO_PATH ?? '/opt/projects/awesome-hermes-agent-zh'

function githubUrlFromPath(relativePath: string) {
  const branch = process.env.CONTENT_REPO_BRANCH ?? 'site-content-anchor'
  return `https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/${branch}/${relativePath}`
}

export async function loadContentPages(contentRoot = DEFAULT_CONTENT_REPO): Promise<SitePage[]> {
  const matches = await fg('docs/**/*.md', { cwd: contentRoot, absolute: false })
  const pages: SitePage[] = []

  for (const file of matches) {
    const raw = await fs.readFile(path.join(contentRoot, file), 'utf8')
    const parsed = matter(raw)
    const data = parsed.data as Record<string, unknown>

    if (typeof data.slug !== 'string' || typeof data.title !== 'string') {
      continue
    }

    pages.push({
      sourcePath: file,
      slug: data.slug,
      title: data.title,
      module: String(data.module ?? 'reference'),
      section: String(data.section ?? 'general'),
      description: String(data.description ?? ''),
      order: Number(data.order ?? 999),
      status: (data.status as SitePage['status']) ?? 'draft',
      updated: String(data.updated ?? ''),
      sourceType: (data.source_type as SitePage['sourceType']) ?? 'generated',
      navGroup: String(data.nav_group ?? '未分组'),
      pageType: (data.page_type as SitePage['pageType']) ?? 'doc-page',
      headings: parseHeadings(parsed.content),
      body: parsed.content,
      githubUrl: githubUrlFromPath(file),
    })
  }

  return pages
}

export async function loadPackEntries(): Promise<SitePack[]> {
  return []
}
