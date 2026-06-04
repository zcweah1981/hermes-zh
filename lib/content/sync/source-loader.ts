import { promises as fs } from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'
import matter from 'gray-matter'

import { parseHeadings } from '@/lib/content/parsers/headings'
import { sortPages } from '@/lib/content/manifests/sort-pages'
import type { RouteMapItem, SitePack, SitePage } from '@/lib/content/types'

const DEFAULT_CONTENT_REPO = process.env.CONTENT_REPO_PATH ?? '/opt/projects/awesome-hermes-agent-zh'

function githubUrlFromPath(relativePath: string) {
  const branch = process.env.CONTENT_REPO_BRANCH ?? 'main'
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

function readString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function readDateString(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10)
  }

  return readString(value)
}

function isPageStatus(value: unknown): value is SitePage['status'] {
  return value === 'draft' || value === 'published' || value === 'archived'
}

function isSourceType(value: unknown): value is SitePage['sourceType'] {
  return value === 'original' || value === 'imported' || value === 'adapted' || value === 'generated'
}

function firstMarkdownHeading(markdown: string) {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match?.[1]?.replace(/\s+#+\s*$/, '').trim()
}

function stripMarkdown(value: string) {
  return value
    .replace(/^>\s*/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstMarkdownSummary(markdown: string) {
  const lines = markdown.split('\n').map((line) => line.trim())
  const candidate = lines.find((line) => {
    if (!line) return false
    if (line.startsWith('#')) return false
    if (line === '---') return false
    if (line.startsWith('|')) return false
    return true
  })

  return candidate ? stripMarkdown(candidate) : undefined
}

function titleFromPath(relativePath: string) {
  return path
    .basename(relativePath, path.extname(relativePath))
    .replace(/^\d+[-_、\s]*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildBodyFallback(title: string, description?: string) {
  return [`# ${title}`, description].filter(Boolean).join('\n\n')
}

/** Strip leading numeric prefix like "05-", "06—" from titles extracted from markdown headings or route-map */
function stripTitlePrefix(title: string) {
  return title.replace(/^\d+[-_\s、—]+/, '').trim()
}

function routeMapItemFromRecord(record: Record<string, unknown>): RouteMapItem | undefined {
  const sourcePath = readString(record.source)
  const slug = readString(record.slug)
  const routeModule = readString(record.module)
  const pageType = readString(record.page_type)

  if (!sourcePath || !slug || !routeModule || !pageType) {
    return undefined
  }

  const status = isPageStatus(record.status) ? record.status : undefined
  const sourceType = isSourceType(record.source_type) ? record.source_type : undefined

  return {
    sourcePath,
    slug,
    module: routeModule,
    pageType,
    title: readString(record.title),
    section: readString(record.section),
    description: readString(record.description),
    order: record.order === undefined ? undefined : parseNumber(record.order),
    status,
    updated: readDateString(record.updated),
    sourceType,
    navGroup: readString(record.nav_group),
  }
}

function parseRouteMapWithYaml(raw: string): RouteMapItem[] {
  const parsed = matter(`---\n${raw}\n---`)
  const data = parsed.data as { routes?: unknown }

  if (!Array.isArray(data.routes)) {
    return []
  }

  return data.routes
    .map((item) => (item && typeof item === 'object' ? routeMapItemFromRecord(item as Record<string, unknown>) : undefined))
    .filter((item): item is RouteMapItem => Boolean(item))
}

function parseRouteMapLineByLine(raw: string): RouteMapItem[] {
  const routes: RouteMapItem[] = []
  let current: Record<string, unknown> | null = null

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()

    if (trimmed.startsWith('- source:')) {
      const item = current ? routeMapItemFromRecord(current) : undefined
      if (item) routes.push(item)
      current = { source: trimmed.split(':', 2)[1].trim() }
      continue
    }

    if (!current || !trimmed.includes(':')) {
      continue
    }

    const [key, ...rest] = trimmed.split(':')
    current[key] = rest.join(':').trim()
  }

  const item = current ? routeMapItemFromRecord(current) : undefined
  if (item) routes.push(item)

  return routes
}

async function loadRouteMap(contentRoot: string): Promise<RouteMapItem[]> {
  const routeMapPath = path.join(contentRoot, 'governance', 'site-route-map.yaml')
  const raw = await fs.readFile(routeMapPath, 'utf8')
  const yamlRoutes = parseRouteMapWithYaml(raw)

  return yamlRoutes.length > 0 ? yamlRoutes : parseRouteMapLineByLine(raw)
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
  const routeIndex = new Map<string, { item: RouteMapItem; index: number }>(
    routeMap.map((item, index) => [item.sourcePath, { item, index }]),
  )
  const pages: SitePage[] = []

  for (const file of matches) {
    const raw = await fs.readFile(path.join(contentRoot, file), 'utf8')
    const parsed = matter(raw)
    const data = parsed.data as Record<string, unknown>
    const routeInfo = routeIndex.get(file)
    const route = routeInfo?.item
    const markdownBody = parsed.content.trim()
    const rawTitle = readString(data.title) ?? route?.title ?? firstMarkdownHeading(markdownBody) ?? titleFromPath(file)
    const title = stripTitlePrefix(rawTitle)
    const description = stripMarkdown(readString(data.description) ?? route?.description ?? firstMarkdownSummary(markdownBody) ?? '')
    // Route map is the canonical URL source. Frontmatter slug is accepted only as a
    // fallback for newly added pages before route-map governance catches up.
    const slug = route?.slug ?? readString(data.slug)

    if (!slug) {
      continue
    }

    const status = isPageStatus(data.status) ? data.status : route?.status ?? 'draft'
    const sourceType = isSourceType(data.source_type) ? data.source_type : route?.sourceType ?? 'generated'
    const body = markdownBody ? parsed.content : buildBodyFallback(title, description)

    pages.push({
      sourcePath: file,
      slug,
      title,
      module: readString(data.module) ?? route?.module ?? 'reference',
      section: readString(data.section) ?? route?.section ?? 'general',
      description,
      order: data.order === undefined ? route?.order ?? (routeInfo ? routeInfo.index + 1 : 999) : parseNumber(data.order),
      status,
      updated: readDateString(data.updated) ?? route?.updated ?? '',
      sourceType,
      navGroup: readString(data.nav_group) ?? route?.navGroup ?? path.basename(path.dirname(file)) ?? '未分组',
      pageType: (readString(data.page_type) ?? route?.pageType ?? 'doc-page') as SitePage['pageType'],
      headings: parseHeadings(body),
      body,
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
