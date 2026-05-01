import { readFileSync } from 'node:fs'
import * as path from 'node:path'

import type { SitePack, SitePage } from '../lib/content/types'
import { toDocPath } from '../lib/routing/docs-path'
import { buildCanonicalUrl } from '../lib/seo/canonical'

type BaiduPushResult = {
  remain?: number
  success?: number
  not_same_site?: string[]
  not_valid?: string[]
  error?: number
  message?: string
}

const DEFAULT_SITE = 'https://hermes-zh.com'
const BAIDU_ENDPOINT = 'http://data.zz.baidu.com/urls'
const MAX_URLS_PER_REQUEST = 2000

function readJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'content-cache', 'generated', fileName), 'utf8')) as T
}

function normalizeSite(rawSite: string | undefined) {
  const site = (rawSite ?? DEFAULT_SITE).trim().replace(/\/$/, '')
  if (!site.startsWith('http://') && !site.startsWith('https://')) {
    return `https://${site}`
  }
  return site
}

export function buildBaiduSubmitUrls(site = DEFAULT_SITE) {
  const pages = readJson<SitePage[]>('pages-manifest.json')
  const packs = readJson<SitePack[]>('packs-manifest.json')
  const staticRoutes = ['/', '/docs/docs-overview', '/packs']
  const origin = normalizeSite(site)

  const urls = [
    ...staticRoutes.map((route) => buildCanonicalUrl(route)),
    ...pages.filter((page) => page.status === 'published').map((page) => buildCanonicalUrl(toDocPath(page.slug))),
    ...packs.filter((pack) => pack.status === 'published').map((pack) => buildCanonicalUrl(`/packs/${pack.id}`)),
  ].map((url) => url.replace(/^https:\/\/hermes-zh\.com/i, origin))

  return Array.from(new Set(urls)).sort()
}

function redactToken(token: string) {
  if (token.length <= 8) return '********'
  return `${token.slice(0, 3)}***${token.slice(-3)}`
}

async function submitToBaidu(urls: string[], site: string, token: string) {
  const endpoint = `${BAIDU_ENDPOINT}?site=${encodeURIComponent(site)}&token=${encodeURIComponent(token)}`
  const timeoutMs = Number(process.env.BAIDU_SUBMIT_TIMEOUT_MS ?? '30000')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'User-Agent': 'hermes-zh-baidu-url-submit/1.0',
    },
    body: urls.join('\n'),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout))
  const result = (await response.json()) as BaiduPushResult
  if (!response.ok || result.error) {
    throw new Error(`Baidu URL submit failed: status=${response.status} body=${JSON.stringify(result)}`)
  }
  return result
}

async function main() {
  const token = process.env.BAIDU_PUSH_TOKEN
  const site = normalizeSite(process.env.BAIDU_SITE ?? process.env.SITE_DOMAIN)
  const dryRun = process.env.BAIDU_SUBMIT_DRY_RUN === '1' || process.argv.includes('--dry-run')
  const urls = buildBaiduSubmitUrls(site)

  if (urls.length === 0) {
    throw new Error('No URLs found for Baidu submit')
  }
  if (urls.length > MAX_URLS_PER_REQUEST) {
    throw new Error(`Too many URLs for one Baidu request: ${urls.length} > ${MAX_URLS_PER_REQUEST}`)
  }
  if (!token && !dryRun) {
    throw new Error('Missing BAIDU_PUSH_TOKEN. Put it in local/project secrets, not in git.')
  }

  console.log(`Baidu API submit target: site=${site} urls=${urls.length} dryRun=${dryRun}`)
  console.log(`First URL: ${urls[0]}`)
  console.log(`Last URL: ${urls[urls.length - 1]}`)

  if (dryRun) {
    console.log('Dry run only. No URLs were submitted.')
    return
  }

  const result = await submitToBaidu(urls, site, token as string)
  console.log(`Baidu token: ${redactToken(token as string)}`)
  console.log(`Baidu API result: ${JSON.stringify(result)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
