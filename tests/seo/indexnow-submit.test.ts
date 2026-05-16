import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()
const indexNowKey = '668040d910c747aca5f3763d0c2c2737'

describe('IndexNow submission tooling', () => {
  it('hosts the IndexNow key file from the public site root', () => {
    const keyFile = join(repoRoot, 'public', `${indexNowKey}.txt`)

    assert.ok(existsSync(keyFile), 'IndexNow key file must exist in public/')
    assert.equal(readFileSync(keyFile, 'utf8'), `${indexNowKey}\n`)
  })

  it('exposes an npm script and uses the official IndexNow endpoint', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
    const script = readFileSync(join(repoRoot, 'scripts/submit-indexnow-urls.ts'), 'utf8')

    assert.equal(pkg.scripts['submit:indexnow'], 'tsx scripts/submit-indexnow-urls.ts')
    assert.match(script, /https:\/\/api\.indexnow\.org\/IndexNow/)
    assert.match(script, /INDEXNOW_HOST/)
    assert.match(script, /INDEXNOW_KEY_LOCATION/)
    assert.match(script, /urlList/)
  })

  it('runs IndexNow submission from GitHub Actions on demand and on schedule', () => {
    const workflowPath = join(repoRoot, '.github', 'workflows', 'indexnow-submit.yml')

    assert.ok(existsSync(workflowPath), 'IndexNow workflow must exist')

    const workflow = readFileSync(workflowPath, 'utf8')
    assert.match(workflow, /name:\s*IndexNow Submit/)
    assert.match(workflow, /workflow_dispatch:/)
    assert.match(workflow, /dry_run:/)
    assert.match(workflow, /schedule:/)
    assert.match(workflow, /cron:\s*['"]17 \*\/6 \* \* \*['"]/)
    assert.match(workflow, /concurrency:/)
  })

  it('checks out both source repositories, builds content, and keeps the npm script contract', () => {
    const workflow = readFileSync(join(repoRoot, '.github', 'workflows', 'indexnow-submit.yml'), 'utf8')

    assert.match(workflow, /actions\/checkout@v4/)
    assert.match(workflow, /repository:\s*zcweah1981\/awesome-hermes-agent-zh/)
    assert.match(workflow, /path:\s*_content_repo/)
    assert.match(workflow, /actions\/setup-node@v4/)
    assert.match(workflow, /node-version:\s*22/)
    assert.match(workflow, /npm ci/)
    assert.match(workflow, /npm run build:content/)
    assert.match(workflow, /CONTENT_REPO_PATH:\s*\$\{\{\s*github\.workspace\s*\}\}\/_content_repo/)
    assert.match(workflow, /npm run submit:indexnow/)
    assert.doesNotMatch(workflow, /tsx scripts\/submit-indexnow-urls\.ts/)
  })

  it('derives INDEXNOW_KEY safely in CI without committing secrets', () => {
    const workflow = readFileSync(join(repoRoot, '.github', 'workflows', 'indexnow-submit.yml'), 'utf8')

    assert.match(workflow, /secrets\.INDEXNOW_KEY/)
    assert.match(workflow, /public\/\*\.txt/)
    assert.match(workflow, /\[0-9a-f\]\{32\}/)
    assert.match(workflow, /GITHUB_ENV/)
    assert.match(workflow, /INDEXNOW_KEY_LOCATION/)
    assert.match(workflow, /::add-mask::/)
    assert.doesNotMatch(workflow, new RegExp(indexNowKey))
  })
})
