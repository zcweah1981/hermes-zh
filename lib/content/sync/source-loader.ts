import { promises as fs } from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'
import matter from 'gray-matter'

import { parseHeadings } from '@/lib/content/parsers/headings'
import { sortPages } from '@/lib/content/manifests/sort-pages'
import type { RouteMapItem, SitePack, SitePage } from '@/lib/content/types'

const DEFAULT_CONTENT_REPO = process.env.CONTENT_REPO_PATH ?? '/opt/projects/awesome-hermes-agent-zh'

function githubUrlFromPath(relativePath: string) {
  const branch = process.env.CONTENT_REPO_BRANCH ?? 'site-content-anchor'
  return `https://github.com/zcweah1981/awesome-hermes-agent-zh/blob/${branch}/${relativePath}`
}

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return false
}

function parseNumber(value: unknown, fallback = 999) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeModes(value: unknown): Array<'solo' | 'team'> {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is 'solo' | 'team' => item === 'solo' || item === 'team')
}

async function loadRouteMap(contentRoot: string): Promise<RouteMapItem[]> {
  const routeMapPath = path.join(contentRoot, 'governance', 'site-route-map.yaml')
  const raw = await fs.readFile(routeMapPath, 'utf8')
  const routes: RouteMapItem[] = []
  let current: Partial<RouteMapItem> | null = null

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()

    if (trimmed.startsWith('- source:')) {
      if (current?.sourcePath && current.slug && current.pageType && current.module) {
        routes.push(current as RouteMapItem)
      }
      current = { sourcePath: trimmed.split(':', 2)[1].trim() }
      continue
    }

    if (!current || !trimmed.includes(':')) {
      continue
    }

    const [key, ...rest] = trimmed.split(':')
    const value = rest.join(':').trim()

    if (key === 'slug') current.slug = value
    if (key === 'module') current.module = value
    if (key === 'page_type') current.pageType = value
  }

  if (current?.sourcePath && current.slug && current.pageType && current.module) {
    routes.push(current as RouteMapItem)
  }

  return routes
}

function buildPrevNextPages(pages: SitePage[]) {
  return pages.map((page, index) => {
    const previousPages = pages.slice(0, index).reverse()
    const nextPages = pages.slice(index + 1)

    const prev =
      previousPages.find((item) => item.navGroup === page.navGroup)?.slug ??
      previousPages.find((item) => item.module === page.module)?.slug ??
      pages[index - 1]?.slug

    const next =
      nextPages.find((item) => item.navGroup === page.navGroup)?.slug ??
      nextPages.find((item) => item.module === page.module)?.slug ??
      pages[index + 1]?.slug

    return {
      ...page,
      prev,
      next,
    }
  })
}

export async function loadContentPages(contentRoot = DEFAULT_CONTENT_REPO): Promise<SitePage[]> {
  const [matches, routeMap] = await Promise.all([
    fg('docs/**/*.md', { cwd: contentRoot, absolute: false }),
    loadRouteMap(contentRoot),
  ])
  const routeIndex = new Map(routeMap.map((item, index) => [item.sourcePath, { item, index }]))
  const pages: SitePage[] = []

  for (const file of matches) {
    const raw = await fs.readFile(path.join(contentRoot, file), 'utf8')
    const parsed = matter(raw)
    const data = parsed.data as Record<string, unknown>
    const routeInfo = routeIndex.get(file)

    if (typeof data.slug !== 'string' || typeof data.title !== 'string') {
      continue
    }

    pages.push({
      sourcePath: file,
      slug: data.slug,
      title: data.title,
      module: String(data.module ?? routeInfo?.item.module ?? 'reference'),
      section: String(data.section ?? 'general'),
      description: String(data.description ?? ''),
      order: parseNumber(data.order, routeInfo ? routeInfo.index + 1 : 999),
      status: (data.status as SitePage['status']) ?? 'draft',
      updated: String(data.updated ?? ''),
      sourceType: (data.source_type as SitePage['sourceType']) ?? 'generated',
      navGroup: String(data.nav_group ?? path.basename(path.dirname(file)) ?? '未分组'),
      pageType: ((data.page_type as SitePage['pageType']) ?? routeInfo?.item.pageType ?? 'doc-page') as SitePage['pageType'],
      headings: parseHeadings(parsed.content),
      body: parsed.content,
      githubUrl: githubUrlFromPath(file),
    })
  }

  const sorted = sortPages(pages).sort((a, b) => {
    const routeA = routeIndex.get(a.sourcePath)?.index ?? Number.MAX_SAFE_INTEGER
    const routeB = routeIndex.get(b.sourcePath)?.index ?? Number.MAX_SAFE_INTEGER
    return routeA - routeB || a.order - b.order || a.slug.localeCompare(b.slug, 'zh-CN')
  })

  return buildPrevNextPages(sorted)
}

export async function loadPackEntries(contentRoot = DEFAULT_CONTENT_REPO): Promise<SitePack[]> {
  const manifests = await fg('packs/**/manifest.yaml', { cwd: contentRoot, absolute: false })
  const packs: SitePack[] = []

  for (const manifestPath of manifests) {
    const raw = await fs.readFile(path.join(contentRoot, manifestPath), 'utf8')
    const parsed = matter(`---\n${raw}\n---`)
    const data = parsed.data as Record<string, unknown>

    if (typeof data.id !== 'string' || typeof data.title !== 'string') {
      continue
    }

    packs.push({
      id: data.id,
      title: data.title,
      category: String(data.category ?? '未分类'),
      summary: typeof data.summary === 'string' ? data.summary : '',
      modes: normalizeModes(data.modes),
      doc: String(data.doc ?? ''),
      install: String(data.install ?? ''),
      download: typeof data.download === 'string' ? data.download : undefined,
      status: (data.status as SitePack['status']) ?? 'draft',
      featured: parseBoolean(data.featured),
      order: parseNumber(data.order, 999),
      tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
    })
  }

  return packs.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id, 'zh-CN'))
}
