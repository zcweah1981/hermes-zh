import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface RouteEntry {
  slug: string
  status?: string
  title?: string
  description?: string
  updated?: string
}

interface PackEntry {
  id: string
  status?: string
  title?: string
  description?: string
  updated?: string
}

interface UrlCandidate {
  url: string
  priority: 'core' | 'content'
  fingerprint: string
}

interface SubmitState {
  manifestHash?: string
  urlFingerprints?: Record<string, string>
  submittedAt?: string
}

const SITE_URL = 'https://hermes-zh.com'
const DEFAULT_INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const INDEXNOW_KEY_PATTERN = /^[0-9a-f]{32}$/
const CORE_URLS = ['/', '/llms.txt', '/ai-index', '/sitemap.xml', '/robots.txt', '/packs']
const DEFAULT_MAX_URLS = 25

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function stableHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function findPublicIndexNowKey(repoRoot: string) {
  const publicDir = join(repoRoot, 'public')
  if (!existsSync(publicDir)) {
    return undefined
  }

  const keyFile = readdirSync(publicDir)
    .filter((name) => /^[0-9a-f]{32}\.txt$/.test(name))
    .sort()[0]

  // CI/public fallback pattern: public/[0-9a-f]{32}.txt
  if (!keyFile) {
    return undefined
  }

  const key = readFileSync(join(publicDir, keyFile), 'utf8').trim()
  if (INDEXNOW_KEY_PATTERN.test(key) && keyFile === `${key}.txt`) {
    return key
  }

  return undefined
}

function resolveIndexNowKey(repoRoot = process.cwd()) {
  const envKey = process.env.INDEXNOW_KEY?.trim()
  if (envKey) {
    if (!INDEXNOW_KEY_PATTERN.test(envKey)) {
      throw new Error('INDEXNOW_KEY must be a lowercase 32-character hex string.')
    }
    return envKey
  }

  const publicKey = findPublicIndexNowKey(repoRoot)
  if (publicKey) {
    return publicKey
  }

  throw new Error(
    'INDEXNOW_KEY is required. Set repository secret INDEXNOW_KEY, or commit a public/<32hex>.txt verification file.',
  )
}

function keyFingerprint(key: string) {
  return createHash('sha256').update(key).digest('hex').slice(0, 12)
}

function readState(path: string): SubmitState {
  if (!existsSync(path)) {
    return {}
  }
  return readJsonFile<SubmitState>(path)
}

function writeState(path: string, state: Required<SubmitState>) {
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`)
}

function loadCandidates(repoRoot = process.cwd()) {
  const routes = readJsonFile<RouteEntry[]>(join(repoRoot, 'content-cache/generated/routes-manifest.json'))
  const packManifest = readJsonFile<PackEntry[]>(join(repoRoot, 'content-cache/generated/packs-manifest.json'))

  const candidates = new Map<string, UrlCandidate>()
  const add = (url: string, priority: UrlCandidate['priority'], source: unknown) => {
    candidates.set(url, { url, priority, fingerprint: stableHash(source) })
  }

  for (const path of CORE_URLS) {
    add(`${SITE_URL}${path}`, 'core', { type: 'core', path })
  }

  for (const route of routes) {
    if (route.status === 'published' && route.slug !== '/docs-overview') {
      add(`${SITE_URL}/docs${route.slug}`, 'content', { type: 'route', route })
    }
  }

  for (const pack of packManifest) {
    if (pack.status === 'published') {
      add(`${SITE_URL}/packs/${pack.id}`, 'content', { type: 'pack', pack })
    }
  }

  const manifestHash = stableHash({
    routes: routes.filter((route) => route.status === 'published'),
    packs: packManifest.filter((pack) => pack.status === 'published'),
    core: CORE_URLS,
  })

  return { candidates: [...candidates.values()].sort((a, b) => a.url.localeCompare(b.url)), manifestHash }
}

function selectSubmitUrls(candidates: UrlCandidate[], state: SubmitState, maxUrls: number) {
  const previous = state.urlFingerprints ?? {}
  const changed = candidates.filter((candidate) => previous[candidate.url] !== candidate.fingerprint)
  const core = candidates.filter((candidate) => candidate.priority === 'core')
  const selected = new Map<string, UrlCandidate>()

  for (const candidate of [...core, ...changed]) {
    if (selected.size >= maxUrls) {
      break
    }
    selected.set(candidate.url, candidate)
  }

  return [...selected.values()].map((candidate) => candidate.url)
}

function parseMaxUrls() {
  const raw = process.env.INDEXNOW_MAX_URLS
  if (!raw) {
    return DEFAULT_MAX_URLS
  }
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value) || value < 1 || value > 10000) {
    throw new Error('INDEXNOW_MAX_URLS must be an integer between 1 and 10000.')
  }
  return value
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const host = process.env.INDEXNOW_HOST ?? 'hermes-zh.com'
  const key = resolveIndexNowKey()
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION ?? `${SITE_URL}/${key}.txt`
  const endpoint = process.env.INDEXNOW_ENDPOINT ?? DEFAULT_INDEXNOW_ENDPOINT
  const stateFile = process.env.INDEXNOW_STATE_FILE ?? join(process.cwd(), '.indexnow-state.json')
  const maxUrls = parseMaxUrls()
  const { candidates, manifestHash } = loadCandidates()
  const state = readState(stateFile)
  const noChange = state.manifestHash === manifestHash
  const submitUrls = noChange ? [] : selectSubmitUrls(candidates, state, maxUrls)
  const urlFingerprints = Object.fromEntries(candidates.map((candidate) => [candidate.url, candidate.fingerprint]))

  console.log(`IndexNow submit target: host=${host} urls=${candidates.length} dryRun=${dryRun}`)
  console.log(`Key location: ${keyLocation.replace(key, '<masked>')}`)
  console.log(`IndexNow key proof: keyFingerprint=${keyFingerprint(key)} source=${process.env.INDEXNOW_KEY ? 'env' : 'public-key-file'}`)
  console.log(`manifest_hash=${manifestHash}`)
  console.log(`change_status=${noChange ? 'NO_CHANGE' : 'CHANGED'} selected_count=${submitUrls.length} max_urls=${maxUrls}`)
  console.log(`First URL: ${candidates[0]?.url ?? '<none>'}`)
  console.log(`Last URL: ${candidates[candidates.length - 1]?.url ?? '<none>'}`)

  if (dryRun) {
    console.log('IndexNow URL list preview:')
    for (const url of submitUrls.slice(0, 20)) {
      console.log(`- ${url}`)
    }
    if (submitUrls.length > 20) {
      console.log(`... ${submitUrls.length - 20} more URLs omitted from preview`)
    }
    console.log('submitted_count=0 dry_run=true')
    return
  }

  if (noChange) {
    console.log('NO_CHANGE: manifest hash unchanged; skip IndexNow API call.')
    console.log('submitted_count=0')
    return
  }

  const payload = {
    host,
    key,
    keyLocation,
    urlList: submitUrls,
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`IndexNow submit failed: status=${response.status} body=${body}`)
  }

  writeState(stateFile, {
    manifestHash,
    urlFingerprints,
    submittedAt: new Date().toISOString(),
  })

  console.log(`IndexNow submit succeeded: status=${response.status} body=${body || 'OK'}`)
  console.log(`submitted_count=${submitUrls.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
