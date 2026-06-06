import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'

const SEO_SECRET_ENV_PATH = '/root/.hermes/secrets/hermes-zh-v3.env'
const DEFAULT_BAIDU_PUSH_ENDPOINT = 'http://data.zz.baidu.com/urls'
const DEFAULT_INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>

export type SmokeStatus = 'readable' | 'submitted' | 'blocked' | 'missing_secret' | 'error'

export interface SeoPlatformSecrets {
  sourcePath: typeof SEO_SECRET_ENV_PATH
  gsc?: {
    serviceAccountJson: Record<string, unknown>
    clientEmail: string
    privateKeyFingerprint: string
  }
  googleApplicationCredentials?: string
  bing?: { apiKey: string }
  baidu?: { token: string; endpoint: string }
  indexNow?: { key: string; keyLocation?: string; endpoint: string; host: string }
}

export interface SeoPlatformClientOptions {
  fetch?: FetchLike
  googleAccessTokenProvider?: (serviceAccountJson: Record<string, unknown>) => Promise<string>
}

export interface BaiduPushResult {
  remain?: number
  success?: number
  not_same_site?: string[]
  not_valid?: string[]
  error?: number
  message?: string
}

export interface SmokeResult {
  platform: 'gsc' | 'bing' | 'baidu' | 'indexnow'
  status: SmokeStatus
  site?: string
  url?: string
  count?: number
  submittedCount?: number
  remainingQuota?: number
  blocker?: 'baidu_quota' | 'indexnow_key_location_403' | 'missing_secret' | 'http_error' | 'gsc_token_unavailable'
  fingerprint?: string
}

function parseDotEnv(text: string) {
  const values: Record<string, string> = {}

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line)
    if (!match) continue
    const [, key, rawValue] = match
    let value = rawValue.trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }

  return values
}

function getEnvText(options: { envText?: string; envPath?: string }) {
  if (options.envText !== undefined) return options.envText
  const envPath = options.envPath ?? SEO_SECRET_ENV_PATH
  if (envPath !== SEO_SECRET_ENV_PATH) {
    throw new Error(`SEO secrets must be read only from ${SEO_SECRET_ENV_PATH}`)
  }
  if (!existsSync(envPath)) return ''
  return readFileSync(envPath, 'utf8')
}

export function stableFingerprint(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 12)
}

export function maskSecret(value: string | undefined) {
  if (!value) return '<missing>'
  return `sha256:${stableFingerprint(value)}`
}

function parseGscServiceAccount(raw: string | undefined) {
  const value = raw?.trim()
  if (!value) return undefined

  const jsonText = value.startsWith('{') ? value : readFileSync(value, 'utf8')
  const parsed = JSON.parse(jsonText) as Record<string, unknown>
  const clientEmail = typeof parsed.client_email === 'string' ? parsed.client_email : ''
  const privateKey = typeof parsed.private_key === 'string' ? parsed.private_key : ''
  if (!clientEmail || !privateKey) {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON must include client_email and private_key')
  }
  return {
    serviceAccountJson: parsed,
    clientEmail,
    privateKeyFingerprint: stableFingerprint(privateKey),
  }
}

export function loadSeoPlatformSecrets(options: { envText?: string; envPath?: string } = {}): SeoPlatformSecrets {
  const values = parseDotEnv(getEnvText(options))
  const gsc = parseGscServiceAccount(values.GSC_SERVICE_ACCOUNT_JSON)
  const bingKey = values.BING_WEBMASTER_API_KEY?.trim()
  const baiduToken = values.BAIDU_PUSH_TOKEN?.trim()
  const indexNowKey = values.INDEXNOW_KEY?.trim()

  return {
    sourcePath: SEO_SECRET_ENV_PATH,
    gsc,
    googleApplicationCredentials: values.GOOGLE_APPLICATION_CREDENTIALS?.trim() || undefined,
    bing: bingKey ? { apiKey: bingKey } : undefined,
    baidu: baiduToken
      ? {
          token: baiduToken,
          endpoint: values.BAIDU_PUSH_ENDPOINT?.trim() || DEFAULT_BAIDU_PUSH_ENDPOINT,
        }
      : undefined,
    indexNow: indexNowKey
      ? {
          key: indexNowKey,
          keyLocation: values.INDEXNOW_KEY_LOCATION?.trim() || undefined,
          endpoint: values.INDEXNOW_ENDPOINT?.trim() || DEFAULT_INDEXNOW_ENDPOINT,
          host: values.INDEXNOW_HOST?.trim() || 'hermes-zh.com',
        }
      : undefined,
  }
}

export function redactSeoSecrets(input: string) {
  let output = input

  output = output.replace(
    /("?(?:token|apiKey|private_key|BING_WEBMASTER_API_KEY|BAIDU_PUSH_TOKEN|INDEXNOW_KEY)"?\s*[:=]\s*")([^"\n]+)(")/gi,
    (_match, prefix: string, value: string, suffix: string) => `${prefix}${maskSecret(value)}${suffix}`,
  )
  output = output.replace(
    /("?(?:client_email|clientEmail)"?\s*[:=]\s*")([^"\n@]+@[^"\n]+)(")/gi,
    (_match, prefix: string, value: string, suffix: string) => `${prefix}${maskSecret(value)}${suffix}`,
  )
  output = output.replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g, '<masked private_key>')
  output = output.replace(/ya29\.[A-Za-z0-9._-]+/g, 'ya29.<masked>')
  output = output.replace(/(apikey|token)=([^&\"\s]+)/gi, (_match, name: string, value: string) => `${name}=${maskSecret(value)}`)

  return output
}

export function classifyBaiduPushResult(result: BaiduPushResult): Omit<SmokeResult, 'platform'> {
  const message = `${result.message ?? ''}`.toLowerCase()
  const isQuota = result.error === 400 && /quota|over|exceed|配额|超额/.test(message)
  if (isQuota || result.remain === 0) {
    return {
      status: 'blocked',
      blocker: 'baidu_quota',
      submittedCount: result.success ?? 0,
      remainingQuota: result.remain ?? 0,
    }
  }
  if (result.error) {
    return {
      status: 'blocked',
      blocker: 'http_error',
      submittedCount: result.success ?? 0,
      remainingQuota: result.remain,
    }
  }
  return {
    status: 'submitted',
    submittedCount: result.success ?? 0,
    remainingQuota: result.remain,
  }
}

export function classifyIndexNowKeyLocation(status: number): Omit<SmokeResult, 'platform'> {
  if (status === 403) {
    return { status: 'blocked', blocker: 'indexnow_key_location_403' }
  }
  if (status >= 200 && status < 300) {
    return { status: 'readable' }
  }
  return { status: 'blocked', blocker: 'http_error' }
}

function withTimeout(ms = 30_000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, done: () => clearTimeout(timeout) }
}

export function createSeoPlatformClients(secrets: SeoPlatformSecrets, options: SeoPlatformClientOptions = {}) {
  const fetcher = options.fetch ?? fetch

  return {
    gsc: {
      async readSites(): Promise<SmokeResult> {
        if (!secrets.gsc) return { platform: 'gsc', status: 'missing_secret', blocker: 'missing_secret' }
        if (!options.googleAccessTokenProvider) {
          return {
            platform: 'gsc',
            status: 'blocked',
            blocker: 'gsc_token_unavailable',
            fingerprint: maskSecret(secrets.gsc.clientEmail),
          }
        }
        const accessToken = await options.googleAccessTokenProvider(secrets.gsc.serviceAccountJson)
        const timer = withTimeout()
        const response = await fetcher('https://www.googleapis.com/webmasters/v3/sites', {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: timer.signal,
        }).finally(timer.done)
        if (!response.ok) return { platform: 'gsc', status: 'blocked', blocker: 'http_error' }
        const data = (await response.json().catch(() => ({}))) as { siteEntry?: unknown[] }
        return {
          platform: 'gsc',
          status: 'readable',
          count: Array.isArray(data.siteEntry) ? data.siteEntry.length : undefined,
          fingerprint: maskSecret(secrets.gsc.clientEmail),
        }
      },
    },
    bing: {
      async readSite(site = 'https://hermes-zh.com'): Promise<SmokeResult> {
        if (!secrets.bing) return { platform: 'bing', status: 'missing_secret', blocker: 'missing_secret', site }
        const url = new URL('https://ssl.bing.com/webmaster/api.svc/json/GetSite')
        url.searchParams.set('siteUrl', site)
        url.searchParams.set('apikey', secrets.bing.apiKey)
        const response = await fetcher(url, { headers: { Accept: 'application/json' } })
        if (!response.ok) return { platform: 'bing', status: 'blocked', blocker: 'http_error', site }
        return { platform: 'bing', status: 'readable', site, fingerprint: maskSecret(secrets.bing.apiKey) }
      },
    },
    baidu: {
      async pushUrls(urls: string[], site = 'https://hermes-zh.com'): Promise<SmokeResult> {
        if (!secrets.baidu) return { platform: 'baidu', status: 'missing_secret', blocker: 'missing_secret', site }
        const endpoint = new URL(secrets.baidu.endpoint)
        if (!endpoint.searchParams.has('site')) endpoint.searchParams.set('site', site)
        if (!endpoint.searchParams.has('token')) endpoint.searchParams.set('token', secrets.baidu.token)
        const response = await fetcher(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain', 'User-Agent': 'hermes-zh-seo-platform-smoke/1.0' },
          body: urls.join('\n'),
        })
        const result = (await response.json().catch(() => ({ error: response.status, message: response.statusText }))) as BaiduPushResult
        return { platform: 'baidu', site, ...classifyBaiduPushResult(result) }
      },
    },
    indexNow: {
      async checkKeyLocation(): Promise<SmokeResult> {
        if (!secrets.indexNow) return { platform: 'indexnow', status: 'missing_secret', blocker: 'missing_secret' }
        const keyLocation = secrets.indexNow.keyLocation ?? `https://${secrets.indexNow.host}/${secrets.indexNow.key}.txt`
        const response = await fetcher(keyLocation, { method: 'GET' })
        return {
          platform: 'indexnow',
          url: keyLocation.replace(secrets.indexNow.key, '<masked>'),
          fingerprint: maskSecret(secrets.indexNow.key),
          ...classifyIndexNowKeyLocation(response.status),
        }
      },
    },
  }
}
