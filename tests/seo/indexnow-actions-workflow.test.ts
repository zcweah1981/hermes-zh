import * as assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const workflowPath = join(repoRoot, '.github/workflows/indexnow-submit.yml')
const submitScriptPath = join(repoRoot, 'scripts/submit-indexnow-urls.ts')

function readWorkflow() {
  assert.ok(existsSync(workflowPath), 'IndexNow GitHub Actions workflow must exist')
  return readFileSync(workflowPath, 'utf8')
}

describe('IndexNow GitHub Actions migration', () => {
  it('defines manual and scheduled triggers for IndexNow submission', () => {
    const workflow = readWorkflow()

    assert.match(workflow, /^name: IndexNow Submit/m)
    assert.match(workflow, /workflow_dispatch:/)
    assert.match(workflow, /dry_run:/)
    assert.match(workflow, /schedule:/)
    assert.match(workflow, /cron: ['"]17 \*\/6 \* \* \*['"]/)
    assert.match(workflow, /concurrency:/)
  })

  it('checks out both site and content repositories before rebuilding manifests', () => {
    const workflow = readWorkflow()

    assert.match(workflow, /Checkout hermes-zh \(site repo\)/)
    assert.match(workflow, /Checkout awesome-hermes-agent-zh \(content repo\)/)
    assert.match(workflow, /repository: zcweah1981\/awesome-hermes-agent-zh/)
    assert.match(workflow, /CONTENT_REPO_PATH: \$\{\{ github\.workspace \}\}\/_content_repo/)
    assert.match(workflow, /npm ci/)
    assert.match(workflow, /npm run build:content/)
    assert.match(workflow, /npm run submit:indexnow/)
  })

  it('resolves INDEXNOW_KEY from secret first and public key file fallback without leaking tokens', () => {
    const workflow = readWorkflow()

    assert.match(workflow, /INDEXNOW_KEY_SECRET: \$\{\{ secrets\.INDEXNOW_KEY \}\}/)
    assert.match(workflow, /public\/\[0-9a-f\]\{32\}\.txt/)
    assert.match(workflow, /INDEXNOW_KEY=.*/)
    assert.match(workflow, /::add-mask::/)
    assert.doesNotMatch(workflow, /668040d910c747aca5f3763d0c2c2737/)
  })

  it('keeps submit script CI-friendly with key inference, dry-run URL proof, and official endpoint', () => {
    const script = readFileSync(submitScriptPath, 'utf8')

    assert.match(script, /https:\/\/api\.indexnow\.org\/IndexNow/)
    assert.match(script, /resolveIndexNowKey/)
    assert.match(script, /public[\s\S]*\[0-9a-f\]\{32\}[\s\S]*\.txt/)
    assert.match(script, /INDEXNOW_KEY is required/)
    assert.match(script, /IndexNow URL list preview/)
    assert.match(script, /keyFingerprint/)
  })
})
