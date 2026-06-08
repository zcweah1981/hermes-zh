import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const projectRoot = process.cwd()
const generatedDir = path.join(projectRoot, 'content-cache', 'generated')
const tsxBin = path.join(projectRoot, 'node_modules', '.bin', 'tsx')
const contentRoot =
  process.env.CONTENT_REPO_PATH ??
  (existsSync(path.join(projectRoot, '_content_repo'))
    ? path.join(projectRoot, '_content_repo')
    : '/opt/projects/awesome-hermes-agent-zh')

async function runScript(scriptPath: string) {
  return execFileAsync(tsxBin, [scriptPath], {
    cwd: projectRoot,
    env: { ...process.env, CONTENT_REPO_PATH: contentRoot },
  })
}

async function readGeneratedJson<T>(fileName: string): Promise<T> {
  const raw = await fs.readFile(path.join(generatedDir, fileName), 'utf8')
  return JSON.parse(raw) as T
}

const approvedPracticalSlugs = [
  '/start/practical/discord-entry',
  '/start/practical/mcp-universal-plug',
  '/start/practical/ollama-local-model',
  '/start/practical/hermes-ollama-fastest',
  '/start/practical/custom-skills',
  '/start/practical/github-pr-reviewer',
  '/start/practical/hermes-advanced-production',
  '/start/practical/hermes-control-room',
  '/start/practical/60day-analyst-lessons',
  '/start/practical/hermes-deep-dive-build-your-own',
  '/start/practical/security-hardening',
  '/start/practical/voice-mode',
]

const expectedPublishedPages = 120
const expectedPublishedPacks = 11
const expectedSearchEntries = expectedPublishedPages + expectedPublishedPacks

test('sync-content writes the published pages manifest from the real content repo', async () => {
  const { stdout } = await runScript('scripts/sync-content.ts')
  assert.match(stdout, new RegExp(`synced ${expectedPublishedPages} pages -> content-cache\\/generated\\/pages-manifest\\.json`))

  const pages = await readGeneratedJson<Array<{ slug: string; status: string }>>('pages-manifest.json')
  assert.equal(pages.length, expectedPublishedPages)
  assert.ok(pages.every((page) => page.status === 'published'))
  assert.ok(pages.some((page) => page.slug === '/start'))
  assert.ok(pages.some((page) => page.slug === '/solutions/x-twitter'))
  assert.ok(pages.some((page) => page.slug === '/start/practical/home-assistant'))
  for (const slug of approvedPracticalSlugs) {
    assert.ok(pages.some((page) => page.slug === slug), `missing approved practical slug ${slug}`)
  }
})

test('build-manifests writes pages, routes, packs, and search manifests', async () => {
  const { stdout } = await runScript('scripts/build-manifests.ts')
  assert.match(
    stdout,
    new RegExp(`built pages=${expectedPublishedPages} routes=${expectedPublishedPages} packs=${expectedPublishedPacks} search=${expectedSearchEntries} assets=\\d+`),
  )

  const [pages, routes, packs, search, buildMeta] = await Promise.all([
    readGeneratedJson<Array<{ slug: string; status: string; body: string }>>('pages-manifest.json'),
    readGeneratedJson<Array<{ slug: string; sourcePath: string; title: string; description: string; status: string }>>(
      'routes-manifest.json',
    ),
    readGeneratedJson<Array<{ id: string; status: string }>>('packs-manifest.json'),
    readGeneratedJson<Array<{ type: string; slug: string }>>('search-index.json'),
    readGeneratedJson<{
      sourceBranch: string | null
      sourceSha: string | null
      counts: { pages: number; routes: number; packs: number; search: number }
    }>('build-meta.json'),
  ])

  assert.equal(pages.length, expectedPublishedPages)
  assert.equal(routes.length, pages.length)
  assert.equal(packs.length, expectedPublishedPacks)
  assert.equal(search.length, pages.length + packs.length)
  assert.ok(pages.some((page) => page.slug === '/solutions/x-twitter'))
  assert.ok(pages.some((page) => page.slug === '/start/practical/home-assistant'))
  assert.ok(routes.some((route) => route.slug === '/solutions/x-twitter'))
  assert.ok(routes.some((route) => route.slug === '/start/practical/home-assistant'))
  assert.ok(search.some((entry) => entry.type === 'page' && entry.slug === '/solutions/x-twitter'))
  assert.ok(search.some((entry) => entry.type === 'page' && entry.slug === '/start/practical/home-assistant'))
  for (const slug of approvedPracticalSlugs) {
    assert.ok(pages.some((page) => page.slug === slug), `pages-manifest missing approved practical slug ${slug}`)
    assert.ok(routes.some((route) => route.slug === slug), `routes-manifest missing approved practical slug ${slug}`)
    assert.ok(search.some((entry) => entry.type === 'page' && entry.slug === slug), `search-index missing approved practical slug ${slug}`)
  }
  const practicalPages = pages.filter((page) => page.slug.startsWith('/start/practical/') && /solution-practical-.*\.webp/.test(page.body))
  assert.equal(practicalPages.length, 10)

  for (const page of practicalPages) {
    const imageName = page.body.match(/solution-practical-[^)]+\.webp/)?.[0]
    assert.ok(imageName, `missing practical WebP image reference in ${page.slug}`)
    assert.equal(existsSync(path.join(projectRoot, 'public', 'content-assets', imageName)), true)
  }

  const startRoute = routes.find((route) => route.slug === '/start')
  assert.equal(startRoute?.sourcePath, 'docs/01-从这开始/总览.md')
  assert.equal(startRoute?.title, '从这开始')
  assert.equal(startRoute?.description, 'Hermes 中文站学习主线入口。')
  assert.equal(startRoute?.status, 'published')
  assert.ok(packs.some((pack) => pack.id === 'webdev-lab' && pack.status === 'published'))
  assert.ok(search.some((entry) => entry.type === 'pack' && entry.slug === '/packs/webdev-lab'))
  assert.equal(buildMeta.sourceBranch, 'main')
  assert.match(buildMeta.sourceSha ?? '', /^[0-9a-f]{40}$/)
  assert.deepEqual(buildMeta.counts, {
    pages: expectedPublishedPages,
    routes: expectedPublishedPages,
    packs: expectedPublishedPacks,
    search: expectedSearchEntries,
  })
})
