import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import {
  classifyBaiduPushResult,
  classifyIndexNowKeyLocation,
  createSeoPlatformClients,
  loadSeoPlatformSecrets,
  maskSecret,
  redactSeoSecrets,
  type FetchLike,
} from '../../lib/seo/platform-clients'

const repoRoot = process.cwd()

const sampleServiceAccount = {
  type: 'service_account',
  project_id: 'hermes-zh-test',
  private_key_id: 'abc123privatekeyid',
  private_key: '-----BEGIN PRIVATE KEY-----\nsecret-private-key-material\n-----END PRIVATE KEY-----\n',
  client_email: 'seo-service-account@hermes-zh-test.iam.gserviceaccount.com',
  token_uri: 'https://oauth2.googleapis.com/token',
}

describe('SEO platform secret contract and clients', () => {
  it('documents only placeholder variables for GSC/Bing/Baidu/IndexNow secrets', () => {
    const docPath = `${repoRoot}/docs/ops/seo-platform-secret-contract.md`
    const envPath = `${repoRoot}/docs/ops/seo-platform.env.example`

    assert.ok(existsSync(docPath), 'secret contract doc must exist')
    assert.ok(existsSync(envPath), 'placeholder env example must exist')

    const doc = readFileSync(docPath, 'utf8')
    const env = readFileSync(envPath, 'utf8')
    const requiredNames = [
      'GSC_SERVICE_ACCOUNT_JSON',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'BING_WEBMASTER_API_KEY',
      'BAIDU_PUSH_TOKEN',
      'BAIDU_PUSH_ENDPOINT',
      'INDEXNOW_KEY',
      'INDEXNOW_KEY_LOCATION',
    ]

    for (const name of requiredNames) {
      assert.match(doc, new RegExp(name), `doc must mention ${name}`)
      assert.match(env, new RegExp(`^${name}=`, 'm'), `env example must include ${name}`)
    }

    assert.doesNotMatch(env, /-----BEGIN PRIVATE KEY-----/)
    assert.doesNotMatch(env, /AIza|ya29\.|[a-f0-9]{32}/i)
    assert.match(doc, /\/root\/\.hermes\/secrets\/hermes-zh-v3\.env/)
    assert.match(doc, /不得|不要|禁止/)
  })

  it('loads secrets only from the fixed env contract and GSC_SERVICE_ACCOUNT_JSON', () => {
    const env = [
      `GSC_SERVICE_ACCOUNT_JSON=${JSON.stringify(sampleServiceAccount)}`,
      'GOOGLE_APPLICATION_CREDENTIALS=/tmp/masked-service-account.json',
      'BING_WEBMASTER_API_KEY=bing-secret-token',
      'BAIDU_PUSH_TOKEN=baidu-secret-token',
      'BAIDU_PUSH_ENDPOINT=http://data.zz.baidu.com/urls?site=https%3A%2F%2Fhermes-zh.com&token=***',
      'INDEXNOW_KEY=0123456789abcdef0123456789abcdef',
      'INDEXNOW_KEY_LOCATION=https://hermes-zh.com/0123456789abcdef0123456789abcdef.txt',
    ].join('\n')

    const secrets = loadSeoPlatformSecrets({ envText: env })

    assert.equal(secrets.sourcePath, '/root/.hermes/secrets/hermes-zh-v3.env')
    assert.equal(secrets.gsc?.clientEmail, sampleServiceAccount.client_email)
    assert.equal(secrets.gsc?.privateKeyFingerprint.length, 12)
    assert.equal(secrets.bing?.apiKey, 'bing-secret-token')
    assert.equal(secrets.baidu?.endpoint, 'http://data.zz.baidu.com/urls?site=https%3A%2F%2Fhermes-zh.com&token=***')
    assert.equal(secrets.indexNow?.key, '0123456789abcdef0123456789abcdef')
  })

  it('accepts GSC_SERVICE_ACCOUNT_JSON as an env file path without exposing secret payloads', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hermes-zh-gsc-'))
    const jsonPath = join(dir, 'service-account.json')
    try {
      writeFileSync(jsonPath, JSON.stringify(sampleServiceAccount), 'utf8')
      const secrets = loadSeoPlatformSecrets({
        envText: [
          `GSC_SERVICE_ACCOUNT_JSON=${jsonPath}`,
          'BING_WEBMASTER_API_KEY=bing-secret-token',
          'BAIDU_PUSH_TOKEN=baidu-secret-token',
          'INDEXNOW_KEY=0123456789abcdef0123456789abcdef',
        ].join('\n'),
      })
      const report = redactSeoSecrets(JSON.stringify(secrets))

      assert.equal(secrets.gsc?.clientEmail, sampleServiceAccount.client_email)
      assert.equal(secrets.gsc?.privateKeyFingerprint.length, 12)
      assert.doesNotMatch(report, /\[REDACTED PRIVATE KEY\]|seo-service-account@hermes-zh-test\.iam\.gserviceaccount\.com/)
      assert.match(report, /sha256:/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('redacts token, private_key and client_email values from logs/reports', () => {
    const raw = JSON.stringify({
      token: 'baidu-secret-token',
      private_key: sampleServiceAccount.private_key,
      client_email: sampleServiceAccount.client_email,
      nested: { BING_WEBMASTER_API_KEY: 'bing-secret-token' },
    })

    const redacted = redactSeoSecrets(raw)

    assert.doesNotMatch(redacted, /baidu-secret-token|bing-secret-token|secret-private-key-material/)
    assert.doesNotMatch(redacted, /seo-service-account@hermes-zh-test\.iam\.gserviceaccount\.com/)
    assert.match(redacted, /masked|sha256:/)
    assert.match(maskSecret('baidu-secret-token'), /^sha256:[a-f0-9]{12}$/)
  })

  it('classifies smoke blockers without leaking secret values', async () => {
    const calls: string[] = []
    const fakeFetch: FetchLike = async (url, init) => {
      calls.push(String(url))
      if (String(url).includes('ssl.bing.com')) {
        assert.doesNotMatch(JSON.stringify(init), /bing-secret-token/)
        return new Response(JSON.stringify({ siteUrl: 'https://hermes-zh.com' }), { status: 200 })
      }
      if (String(url).includes('data.zz.baidu.com')) {
        return new Response(JSON.stringify({ error: 400, message: 'over quota' }), { status: 200 })
      }
      if (String(url).includes('0123456789abcdef0123456789abcdef.txt')) {
        return new Response('forbidden', { status: 403 })
      }
      return new Response('{}', { status: 200 })
    }

    const clients = createSeoPlatformClients(
      loadSeoPlatformSecrets({
        envText: [
          `GSC_SERVICE_ACCOUNT_JSON=${JSON.stringify(sampleServiceAccount)}`,
          'BING_WEBMASTER_API_KEY=bing-secret-token',
          'BAIDU_PUSH_TOKEN=baidu-secret-token',
          'BAIDU_PUSH_ENDPOINT=http://data.zz.baidu.com/urls?site=https%3A%2F%2Fhermes-zh.com&token=***',
          'INDEXNOW_KEY=0123456789abcdef0123456789abcdef',
          'INDEXNOW_KEY_LOCATION=https://hermes-zh.com/0123456789abcdef0123456789abcdef.txt',
        ].join('\n'),
      }),
      { fetch: fakeFetch, googleAccessTokenProvider: async () => 'ya29.fake-access-token' },
    )

    const gsc = await clients.gsc.readSites()
    const bing = await clients.bing.readSite('https://hermes-zh.com')
    const baidu = await clients.baidu.pushUrls(['https://hermes-zh.com/'])
    const indexNow = await clients.indexNow.checkKeyLocation()
    const report = redactSeoSecrets(JSON.stringify({ gsc, bing, baidu, indexNow, calls }))

    assert.equal(gsc.status, 'readable')
    assert.equal(bing.status, 'readable')
    assert.equal(baidu.status, 'blocked')
    assert.equal(baidu.blocker, 'baidu_quota')
    assert.equal(indexNow.status, 'blocked')
    assert.equal(indexNow.blocker, 'indexnow_key_location_403')
    assert.doesNotMatch(report, /baidu-secret-token|bing-secret-token|ya29\.fake-access-token/)
  })

  it('classifies Baidu quota and IndexNow 403 as actionable blockers', () => {
    assert.deepEqual(classifyBaiduPushResult({ error: 400, message: 'over quota' }), {
      status: 'blocked',
      blocker: 'baidu_quota',
      submittedCount: 0,
      remainingQuota: 0,
    })

    assert.deepEqual(classifyIndexNowKeyLocation(403), {
      status: 'blocked',
      blocker: 'indexnow_key_location_403',
    })
  })
})
