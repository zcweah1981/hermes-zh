import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const workflowPath = path.join(root, '.github', 'workflows', 'content-auto-sync.yml')
const lockPath = path.join(root, 'content-cache', 'content-lock.json')
const runbookPath = path.join(root, 'docs', 'governance', 'content-auto-sync-runbook.md')

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

test('site repository accepts content-updated repository_dispatch and locks content sha', () => {
  const workflow = readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /repository_dispatch:/)
  assert.match(workflow, /types:\s*\[content-updated\]/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /content_sha:/)
  assert.match(workflow, /content_repo:/)
  assert.match(workflow, /CONTENT_REPO:\s*\$\{\{\s*github\.event\.client_payload\.content_repo\s*\|\|\s*inputs\.content_repo\s*\|\|\s*'zcweah1981\/awesome-hermes-agent-zh'\s*\}\}/)
  assert.match(workflow, /repository:\s*\$\{\{\s*env\.CONTENT_REPO\s*\}\}/)
  assert.match(workflow, /ref:\s*\$\{\{\s*env\.CONTENT_SHA\s*\}\}/)
  assert.match(workflow, /CONTENT_REPO_PATH:\s*\$\{\{\s*github\.workspace\s*\}\}\/_content_repo/)
  assert.match(workflow, /npm run verify:content:freshness/)
  assert.match(workflow, /content-cache\/content-lock\.json/)
  assert.match(workflow, /build-meta\.json\.sourceSha/) 
  assert.match(workflow, /contents:\s*write/)
  assert.match(workflow, /concurrency:/)
  assert.match(workflow, /Deploy synchronized site to Vercel/)
  assert.match(workflow, /VERCEL_TOKEN/)
  assert.match(workflow, /vercel@latest deploy --prebuilt --prod/)
})

test('content lock records the exact content source used by generated manifests', () => {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
  const meta = JSON.parse(read('content-cache/generated/build-meta.json'))

  assert.equal(lock.contentRepo, 'zcweah1981/awesome-hermes-agent-zh')
  assert.equal(lock.contentRef, 'main')
  assert.match(lock.contentSha, /^[0-9a-f]{40}$/)
  assert.equal(lock.contentSha, meta.sourceSha)
  assert.match(lock.lockedAt, /^\d{4}-\d{2}-\d{2}T/)
})

test('content auto-sync runbook documents secrets, rollback, and duplicate skip behavior', () => {
  const runbook = readFileSync(runbookPath, 'utf8')

  assert.match(runbook, /SITE_REPO_DISPATCH_TOKEN/)
  assert.match(runbook, /repository_dispatch/)
  assert.match(runbook, /content-lock\.json/)
  assert.match(runbook, /workflow_dispatch/)
  assert.match(runbook, /revert/i)
  assert.match(runbook, /同 SHA|same SHA/i)
  assert.doesNotMatch(runbook, /ghp_[A-Za-z0-9_]+/)
})
