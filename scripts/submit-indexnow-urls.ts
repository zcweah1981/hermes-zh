import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

interface RouteEntry {
  slug: string
  status?: string
}

const SITE_URL = 'https://hermes-zh.com'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const INDEXNOW_KEY_PATTERN = /^[0-9a-f]{32}$/

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
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

function loadUrls() {
  const repoRoot = process.cwd()
  const routes = readJsonFile<RouteEntry[]>(join(repoRoot, 'content-cache/generated/routes-manifest.json'))
  const packManifest = readJsonFile<Array<{ id: string; status?: string }>>(join(repoRoot, 'content-cache/generated/packs-manifest.json'))

  const urls = new Set<string>([
    `${SITE_URL}/`,
    `${SITE_URL}/llms.txt`,
    `${SITE_URL}/ai-index`,
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/robots.txt`,
    `${SITE_URL}/packs`,
  ])

  for (const route of routes) {
    if (route.status === 'published' && route.slug !== '/docs-overview') {
      urls.add(`${SITE_URL}/docs${route.slug}`)
    }
  }

  for (const pack of packManifest) {
    if (pack.status === 'published') {
      urls.add(`${SITE_URL}/packs/${pack.id}`)
    }
  }

  return [...urls].sort()
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const host = process.env.INDEXNOW_HOST ?? 'hermes-zh.com'
  const key = resolveIndexNowKey()
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION ?? `${SITE_URL}/${key}.txt`
  const urlList = loadUrls()

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  }

  console.log(`IndexNow submit target: host=${host} urls=${urlList.length} dryRun=${dryRun}`)
  console.log(`Key location: ${keyLocation.replace(key, '<masked>')}`)
  console.log(`IndexNow key proof: keyFingerprint=${keyFingerprint(key)} source=${process.env.INDEXNOW_KEY ? 'env' : 'public-key-file'}`)
  console.log(`First URL: ${urlList[0]}`)
  console.log(`Last URL: ${urlList[urlList.length - 1]}`)

  if (dryRun) {
    console.log('IndexNow URL list preview:')
    for (const url of urlList.slice(0, 20)) {
      console.log(`- ${url}`)
    }
    if (urlList.length > 20) {
      console.log(`... ${urlList.length - 20} more URLs omitted from preview`)
    }
    return
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
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

  console.log(`IndexNow submit succeeded: status=${response.status} body=${body || 'OK'}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
