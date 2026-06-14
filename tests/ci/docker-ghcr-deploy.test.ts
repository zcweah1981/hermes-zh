import { strict as assert } from 'node:assert'
import { existsSync, readFileSync } from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

const root = process.cwd()
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), 'utf8')

const forbiddenSecretPatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9_]+/,
  /github_pat_[A-Za-z0-9_]+/,
  /\.pem\b/,
  /sshkey\.zip/,
]

test('Next.js is configured for standalone Docker runtime without Vercel workflow removal', () => {
  const nextConfig = read('next.config.ts')
  assert.match(nextConfig, /output:\s*['"]standalone['"]/, 'next.config.ts must enable standalone output')

  for (const workflow of [
    '.github/workflows/verify.yml',
    '.github/workflows/content-auto-sync.yml',
    '.github/workflows/indexnow-submit.yml',
    '.github/workflows/preview.yml',
  ]) {
    assert.ok(existsSync(path.join(root, workflow)), `${workflow} must remain present`)
  }
})

test('Dockerfile builds a production standalone image listening on 3018/0.0.0.0', () => {
  const dockerfile = read('Dockerfile')
  assert.match(dockerfile, /FROM\s+node:22-alpine\s+AS\s+deps/)
  assert.match(dockerfile, /FROM\s+node:22-alpine\s+AS\s+builder/)
  assert.match(dockerfile, /FROM\s+node:22-alpine\s+AS\s+runner/)
  assert.match(dockerfile, /npm\s+ci/)
  assert.match(dockerfile, /apk\s+add\s+--no-cache\s+git/)
  assert.match(dockerfile, /CONTENT_REPO_PATH=\/app\/_content_repo/)
  assert.match(dockerfile, /npm\s+run\s+build/)
  assert.match(dockerfile, /\.next\/standalone/)
  assert.match(dockerfile, /ENV\s+NODE_ENV=production/)
  assert.match(dockerfile, /ENV\s+PORT=3018/)
  assert.match(dockerfile, /ENV\s+HOSTNAME="?0\.0\.0\.0"?/)
  assert.match(dockerfile, /EXPOSE\s+3018/)
  assert.match(dockerfile, /CMD\s+\["node",\s*"server\.js"\]/)

  for (const pattern of forbiddenSecretPatterns) {
    assert.doesNotMatch(dockerfile, pattern)
  }
})

test('.dockerignore excludes local/runtime/secrets noise while keeping required production assets', () => {
  const dockerignore = read('.dockerignore')
  for (const required of ['.git', 'node_modules', '.next', 'out', 'coverage', '.env*', '.vercel', 'artifacts', 'npm-debug.log*', 'runtime-env']) {
    assert.match(dockerignore, new RegExp(`(^|\\n)${required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\n|$)`), `${required} must be ignored`)
  }

  for (const mustKeep of ['public', 'content-cache/generated', 'content-cache/content-lock.json', 'package.json', 'package-lock.json']) {
    assert.doesNotMatch(dockerignore, new RegExp(`(^|\\n)${mustKeep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\n|$)`), `${mustKeep} must not be ignored`)
  }
})

test('GHCR workflow publishes latest and commit SHA tags without hard-coded secrets', () => {
  const workflow = read('.github/workflows/docker-image.yml')
  assert.match(workflow, /name:\s*docker-image/)
  assert.match(workflow, /push:/)
  assert.match(workflow, /branches:\s*\[main\]/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /packages:\s*write/)
  assert.doesNotMatch(workflow, /id-token:\s*write/)
  assert.match(workflow, /docker\/login-action@v3/)
  assert.match(workflow, /registry:\s*ghcr\.io/)
  assert.match(workflow, /username:\s*\$\{\{\s*github\.actor\s*\}\}/)
  assert.match(workflow, /password:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/)
  assert.match(workflow, /docker\/metadata-action@v5/)
  assert.match(workflow, /type=raw,value=latest/)
  assert.match(workflow, /type=sha,format=long,prefix=/)
  assert.match(workflow, /docker\/build-push-action@v6/)
  assert.match(workflow, /push:\s*true/)
  assert.match(workflow, /npm run typecheck/)
  assert.match(workflow, /npm run lint/)
  assert.match(workflow, /npm test/)
  assert.match(workflow, /npm run build/)
  assert.match(workflow, /npm run smoke/)
  assert.match(workflow, /npm run verify:content/)
  assert.match(workflow, /npm run verify:content:freshness/)
  assert.match(workflow, /repository:\s*zcweah1981\/awesome-hermes-agent-zh/)
  assert.match(workflow, /CONTENT_REPO_PATH:\s*\$\{\{\s*github\.workspace\s*\}\}\/_content_repo/)
  assert.doesNotMatch(workflow, /VERCEL_TOKEN/)

  for (const pattern of forbiddenSecretPatterns) {
    assert.doesNotMatch(workflow, pattern)
  }
})

test('Docker deploy runbook documents pull-based /opt/hermes-zh deployment on port 3018 with placeholders only', () => {
  const runbook = read('docs/ops/tencent-docker-compose-dual-deploy.md')
  assert.match(runbook, /\/opt\/hermes-zh/)
  assert.match(runbook, /docker compose pull/)
  assert.match(runbook, /docker compose up -d/)
  assert.match(runbook, /ghcr\.io\/zcweah1981\/hermes-zh:latest/)
  assert.match(runbook, /PORT=3018/)
  assert.match(runbook, /HOSTNAME=0\.0\.0\.0/)
  assert.match(runbook, /expose:\s*\n\s*- "3018"/)
  assert.match(runbook, /reverse_proxy hermes-zh:3018/)
  assert.match(runbook, /服务器不构建源码|不在服务器本地构建源码/)

  for (const pattern of forbiddenSecretPatterns) {
    assert.doesNotMatch(runbook, pattern)
  }
})
