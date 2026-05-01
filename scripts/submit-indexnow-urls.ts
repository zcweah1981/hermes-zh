import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface RouteEntry {
  slug: string
  status?: string
}

const SITE_URL = 'https://hermes-zh.com'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

function loadUrls() {
  const repoRoot = process.cwd()
  const routes = JSON.parse(readFileSync(join(repoRoot, 'content-cache/generated/routes-manifest.json'), 'utf8')) as RouteEntry[]
  const packManifest = JSON.parse(readFileSync(join(repoRoot, 'content-cache/generated/packs-manifest.json'), 'utf8')) as Array<{ id: string; status?: string }>

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
  const key = requireEnv('INDEXNOW_KEY')
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION ?? `${SITE_URL}/${key}.txt`
  const urlList = loadUrls()

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  }

  console.log(`IndexNow submit target: host=${host} urls=${urlList.length} dryRun=${dryRun}`)
  console.log(`Key location: ${keyLocation}`)
  console.log(`First URL: ${urlList[0]}`)
  console.log(`Last URL: ${urlList[urlList.length - 1]}`)

  if (dryRun) {
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
