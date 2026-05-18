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

test('sync-content writes the published pages manifest from the real content repo', async () => {
  const { stdout } = await runScript('scripts/sync-content.ts')
  assert.match(stdout, /synced 91 pages -> content-cache\/generated\/pages-manifest\.json/)

  const pages = await readGeneratedJson<Array<{ slug: string; status: string }>>('pages-manifest.json')
  assert.equal(pages.length, 91)
  assert.ok(pages.every((page) => page.status === 'published'))
  assert.ok(pages.some((page) => page.slug === '/start'))
  assert.ok(pages.some((page) => page.slug === '/solutions/x-twitter'))
})

test('build-manifests writes pages, routes, packs, and search manifests', async () => {
  const { stdout } = await runScript('scripts/build-manifests.ts')
  assert.match(stdout, /built pages=91 routes=91 packs=11 search=102/)

  const [pages, routes, packs, search, buildMeta] = await Promise.all([
    readGeneratedJson<Array<{ slug: string; status: string }>>('pages-manifest.json'),
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

  assert.equal(pages.length, 91)
  assert.equal(routes.length, pages.length)
  assert.equal(packs.length, 11)
  assert.equal(search.length, pages.length + packs.length)
  assert.ok(pages.some((page) => page.slug === '/solutions/x-twitter'))
  assert.ok(routes.some((route) => route.slug === '/solutions/x-twitter'))
  assert.ok(search.some((entry) => entry.type === 'page' && entry.slug === '/solutions/x-twitter'))
  const startRoute = routes.find((route) => route.slug === '/start')
  assert.equal(startRoute?.sourcePath, 'docs/01-从这开始/总览.md')
  assert.equal(startRoute?.title, '从这开始')
  assert.equal(startRoute?.description, 'Hermes 中文站学习主线入口。')
  assert.equal(startRoute?.status, 'published')
  assert.ok(packs.some((pack) => pack.id === 'webdev-lab' && pack.status === 'published'))
  assert.ok(search.some((entry) => entry.type === 'pack' && entry.slug === '/packs/webdev-lab'))
  assert.equal(buildMeta.sourceBranch, 'main')
  assert.match(buildMeta.sourceSha ?? '', /^[0-9a-f]{40}$/)
  assert.deepEqual(buildMeta.counts, { pages: 91, routes: 91, packs: 11, search: 102 })
})
