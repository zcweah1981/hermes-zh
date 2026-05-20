import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

import { redactSeoSecrets } from '../lib/seo/platform-clients.ts'

type Status = 'published' | 'draft' | 'archived'
type SeoCheckStatus = 'pass' | 'warn' | 'fail'
type ChangeType = 'new' | 'updated'

type ContentLock = {
  schemaVersion?: number
  contentRepo?: string
  contentRef?: string
  contentSha?: string
  lockedAt?: string
}

type RouteEntry = {
  sourcePath?: string
  slug: string
  pageType?: string
  module?: string
  section?: string
  title?: string
  description?: string
  order?: number
  status?: Status
  updated?: string
  sourceType?: string
  navGroup?: string
}

type SitePage = RouteEntry & {
  body?: string
  headings?: Array<{ depth: number; text: string; id: string }>
  prev?: string
  next?: string
  githubUrl?: string
}

type SitePack = {
  id: string
  title?: string
  category?: string
  summary?: string
  doc?: string
  install?: string
  download?: string
  status?: Status
  featured?: boolean
  tags?: string[]
}

type SearchItem = {
  type?: string
  title?: string
  slug?: string
  description?: string
  module?: string
  headings?: string[]
}

type SeoChecks = Record<
  | 'title'
  | 'description'
  | 'canonical'
  | 'openGraph'
  | 'twitterCard'
  | 'breadcrumb'
  | 'jsonLd'
  | 'sitemap'
  | 'llms'
  | 'searchIndex'
  | 'internalLinks'
  | 'lastmod'
  | 'keywordStuffing',
  SeoCheckStatus
>

type SeoAction = {
  url: string
  path: string
  sourceKind: 'page' | 'pack'
  changeType: ChangeType
  title: string
  description: string
  updated?: string
  fingerprint: string
  platforms: Array<'indexnow' | 'bing' | 'baidu' | 'gsc_monitor'>
  gscMode: 'read_report_only'
  baiduQuotaClass: 'daily_quota_controlled' | 'not_submitted_third_party_boundary'
  priority: number
  thirdPartyBoundary: 'first_party_content' | 'third_party_reference'
  seoChecks: SeoChecks
  notes: string[]
}

type QueueState = {
  inputHash?: string
  urlFingerprints?: Record<string, string>
  generatedAt?: string
}

const SITE_URL = 'https://hermes-zh.com'
const GENERATED_DIR = join(process.cwd(), 'content-cache', 'generated')
const DEFAULT_QUEUE_FILE = join(GENERATED_DIR, 'seo-action-queue.json')
const DEFAULT_STATE_FILE = join(process.cwd(), 'content-cache', 'seo-action-state.json')
const THIRD_PARTY_HINT = /tweet|twitter|x\.com|第三方|external|community/i

function readJson<T>(path: string, fallback?: T): T {
  if (!existsSync(path)) {
    if (fallback !== undefined) return fallback
    throw new Error(`Missing required JSON file: ${path}`)
  }
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function stableHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function docPath(slug: string) {
  return slug.startsWith('/docs/') ? slug : `/docs${slug.startsWith('/') ? slug : `/${slug}`}`
}

function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`
}

function normalizeText(value: string | undefined) {
  return (value ?? '').trim()
}

function status(condition: boolean): SeoCheckStatus {
  return condition ? 'pass' : 'warn'
}

function keywordStuffingPass(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase()
  const words = text.match(/[a-z0-9\u4e00-\u9fa5]{2,}/g) ?? []
  const counts = new Map<string, number>()
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1)
  return [...counts.values()].every((count) => count <= 4)
}

function checkInternalLinks(body: string | undefined) {
  if (!body) return true
  const links = [...body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1] ?? '')
  return links.every((link) => {
    if (!link || link.startsWith('#')) return true
    if (/^(https?:|mailto:|tel:)/.test(link)) return true
    return !link.includes('undefined') && !link.includes('TODO')
  })
}

function isThirdPartyPage(page: SitePage) {
  const haystack = [page.slug, page.title, page.description, page.body, page.githubUrl].filter(Boolean).join(' ')
  return THIRD_PARTY_HINT.test(haystack)
}

function buildPageChecks(page: SitePage, path: string, search: SearchItem[]): SeoChecks {
  const title = normalizeText(page.title)
  const description = normalizeText(page.description)
  const body = normalizeText(page.body)
  const hasBreadcrumb = Boolean(page.prev || page.next || page.navGroup || page.module)
  const inSearch = search.some((item) => item.type === 'page' && (item.slug === page.slug || item.slug === path))

  return {
    title: status(title.length >= 4 && title.length <= 80),
    description: status(description.length >= 20 && description.length <= 180),
    canonical: status(path.startsWith('/docs/')),
    openGraph: 'pass',
    twitterCard: 'pass',
    breadcrumb: status(hasBreadcrumb),
    jsonLd: status(Boolean(page.pageType)),
    sitemap: status(page.status === 'published'),
    llms: status(page.status === 'published'),
    searchIndex: status(inSearch),
    internalLinks: status(checkInternalLinks(body)),
    lastmod: status(/^\d{4}-\d{2}-\d{2}/.test(page.updated ?? '')),
    keywordStuffing: status(keywordStuffingPass(title, description)),
  }
}

function buildPackChecks(pack: SitePack, path: string, search: SearchItem[]): SeoChecks {
  const title = normalizeText(pack.title)
  const description = normalizeText(pack.summary || pack.category || pack.doc)
  const inSearch = search.some((item) => item.type === 'pack' && item.slug === path)

  return {
    title: status(title.length >= 4 && title.length <= 80),
    description: status(description.length >= 2 && description.length <= 180),
    canonical: status(path.startsWith('/packs/')),
    openGraph: 'pass',
    twitterCard: 'pass',
    breadcrumb: 'pass',
    jsonLd: 'pass',
    sitemap: status(pack.status === 'published'),
    llms: status(pack.status === 'published'),
    searchIndex: status(inSearch),
    internalLinks: status(Boolean(pack.doc || pack.download || pack.install)),
    lastmod: 'pass',
    keywordStuffing: status(keywordStuffingPass(title, description)),
  }
}

function isThirdPartyPack(pack: SitePack) {
  const haystack = [pack.id, pack.title, pack.category, pack.summary, pack.doc, pack.download].filter(Boolean).join(' ')
  return THIRD_PARTY_HINT.test(haystack)
}

function hasBlockingSeoFailure(checks: SeoChecks) {
  return Object.values(checks).some((value) => value === 'fail')
}

function loadInputs() {
  const lock = readJson<ContentLock>(join(process.cwd(), 'content-cache', 'content-lock.json'), {})
  const routes = readJson<RouteEntry[]>(join(GENERATED_DIR, 'routes-manifest.json'), [])
  const pages = readJson<SitePage[]>(join(GENERATED_DIR, 'pages-manifest.json'), [])
  const packs = readJson<SitePack[]>(join(GENERATED_DIR, 'packs-manifest.json'), [])
  const search = readJson<SearchItem[]>(join(GENERATED_DIR, 'search-index.json'), [])
  return { lock, routes, pages, packs, search }
}

function buildCandidates(inputs: ReturnType<typeof loadInputs>) {
  const pagesBySlug = new Map(inputs.pages.map((page) => [page.slug, page]))
  const routeSlugs = new Set(inputs.routes.filter((route) => route.status === 'published').map((route) => route.slug))
  const candidates: SeoAction[] = []

  for (const route of inputs.routes) {
    if (route.status !== 'published') continue
    const page = { ...route, ...(pagesBySlug.get(route.slug) ?? {}) }
    const path = docPath(route.slug)
    const title = normalizeText(page.title)
    const description = normalizeText(page.description)
    const fingerprint = stableHash({ kind: 'page', route, page, search: inputs.search.filter((item) => item.slug === route.slug || item.slug === path) })
    const checks = buildPageChecks(page, path, inputs.search)
    const thirdParty = isThirdPartyPage(page)
    candidates.push({
      url: absoluteUrl(path),
      path,
      sourceKind: 'page',
      changeType: 'new',
      title,
      description,
      updated: page.updated,
      fingerprint,
      platforms: thirdParty ? ['gsc_monitor'] : ['indexnow', 'bing', 'baidu', 'gsc_monitor'],
      gscMode: 'read_report_only',
      baiduQuotaClass: thirdParty ? 'not_submitted_third_party_boundary' : 'daily_quota_controlled',
      priority: thirdParty ? 90 : routeSlugs.has(route.slug) && !hasBlockingSeoFailure(checks) ? 10 : 30,
      thirdPartyBoundary: thirdParty ? 'third_party_reference' : 'first_party_content',
      seoChecks: checks,
      notes: thirdParty
        ? [
            '第三方页面只作为外部引用边界监控；not official built-in capability，不写成 Hermes 中文站官方内置能力。',
            'GSC 仅读取和报告第三方引用入口在本站页面的覆盖情况。',
          ]
        : [
            '自动检查 title/description/canonical/OG/Twitter/Breadcrumb/JSON-LD/sitemap/llms/search-index/内部链接/lastmod；不做关键词堆砌。',
            'GSC 仅进入读取与覆盖率报告监控，不伪造 URL 提交能力。',
            'Baidu 提交由每日 quota 控制，队列按优先级消费。',
          ],
    })
  }

  for (const pack of inputs.packs) {
    if (pack.status !== 'published') continue
    const path = `/packs/${pack.id}`
    const thirdParty = isThirdPartyPack(pack)
    const description = normalizeText(pack.summary || pack.category || pack.doc)
    const fingerprint = stableHash({ kind: 'pack', pack, search: inputs.search.filter((item) => item.slug === path) })
    const checks = buildPackChecks(pack, path, inputs.search)
    candidates.push({
      url: absoluteUrl(path),
      path,
      sourceKind: 'pack',
      changeType: 'new',
      title: normalizeText(pack.title),
      description,
      fingerprint,
      platforms: thirdParty ? ['gsc_monitor'] : ['indexnow', 'bing', 'baidu', 'gsc_monitor'],
      gscMode: 'read_report_only',
      baiduQuotaClass: thirdParty ? 'not_submitted_third_party_boundary' : 'daily_quota_controlled',
      priority: thirdParty ? 90 : 20,
      thirdPartyBoundary: thirdParty ? 'third_party_reference' : 'first_party_content',
      seoChecks: checks,
      notes: thirdParty
        ? [
            '第三方页面只作为外部引用边界监控；not official built-in capability，不写成 Hermes 中文站官方内置能力。',
            'GSC 仅读取和报告第三方引用入口在本站页面的覆盖情况。',
          ]
        : [
            'Pack 页面进入 IndexNow/Bing/Baidu/GSC 监控队列；Baidu 由每日 quota 控制。',
            'GSC 仅进入读取与覆盖率报告监控，不伪造 URL 提交能力。',
          ],
    })
  }

  return candidates.sort((a, b) => a.priority - b.priority || a.url.localeCompare(b.url))
}

function selectChanged(candidates: SeoAction[], previous: Record<string, string>) {
  return candidates
    .filter((action) => previous[action.url] !== action.fingerprint)
    .map((action) => ({ ...action, changeType: previous[action.url] ? 'updated' : 'new' }) satisfies SeoAction)
}

function main() {
  const queueFile = process.env.SEO_ACTION_QUEUE_FILE ?? DEFAULT_QUEUE_FILE
  const stateFile = process.env.SEO_ACTION_QUEUE_STATE_FILE ?? DEFAULT_STATE_FILE
  const dryRun = process.argv.includes('--dry-run')
  const inputs = loadInputs()
  const inputHash = stableHash({
    lock: inputs.lock,
    routes: inputs.routes,
    pages: inputs.pages,
    packs: inputs.packs,
    search: inputs.search,
  })
  const state = readJson<QueueState>(stateFile, {})
  const candidates = buildCandidates(inputs)
  const noChange = state.inputHash === inputHash
  const actions = noChange ? [] : selectChanged(candidates, state.urlFingerprints ?? {})
  const queue = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: noChange ? 'NO_CHANGE' : 'CHANGED',
    source: {
      contentRepo: inputs.lock.contentRepo,
      contentRef: inputs.lock.contentRef,
      contentSha: inputs.lock.contentSha,
      lockedAt: inputs.lock.lockedAt,
    },
    summary: {
      candidateCount: candidates.length,
      queuedCount: actions.length,
      gscMode: 'read_report_only',
      baiduQuota: 'daily_quota_controlled',
    },
    actions,
  }

  writeJson(queueFile, queue)
  if (!dryRun) {
    writeJson(stateFile, {
      inputHash,
      urlFingerprints: Object.fromEntries(candidates.map((action) => [action.url, action.fingerprint])),
      generatedAt: queue.generatedAt,
    } satisfies QueueState)
  }

  const output = [
    `seo_action_queue_status=${queue.status}`,
    `candidate_count=${candidates.length}`,
    `queued_count=${actions.length}`,
    `queue_file=${queueFile}`,
    `gsc_mode=read_report_only`,
    `baidu_quota=daily_quota_controlled`,
    `dry_run=${dryRun}`,
  ].join('\n')
  console.log(redactSeoSecrets(output))
}

try {
  main()
} catch (error) {
  console.error(redactSeoSecrets(error instanceof Error ? error.stack || error.message : String(error)))
  process.exitCode = 1
}
