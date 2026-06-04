import { promises as fs } from 'node:fs'
import path from 'node:path'

import { buildRouteMap } from '../lib/content/resolvers/build-route-map'
import { resolveContentRoot } from '../lib/content/sync/resolve-content-root'
import { loadContentPages, loadPackEntries } from '../lib/content/sync/source-loader'
import type { SitePack, SitePage } from '../lib/content/types'
import { writeContentBuildMeta } from './lib/content-build-meta'

const generatedDir = path.join(process.cwd(), 'content-cache', 'generated')
const preferredContentRoot = process.env.CONTENT_REPO_PATH ?? '/opt/projects/awesome-hermes-agent-zh'
const requiredGeneratedFiles = [
  'pages-manifest.json',
  'routes-manifest.json',
  'packs-manifest.json',
  'search-index.json',
  'build-meta.json',
]

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function hasUsableContentRoot(contentRoot: string) {
  return pathExists(path.join(contentRoot, 'governance', 'site-route-map.yaml'))
}

async function hasGeneratedContent() {
  const checks = await Promise.all(
    requiredGeneratedFiles.map((fileName) => pathExists(path.join(generatedDir, fileName))),
  )

  return checks.every(Boolean)
}

async function writeJson(fileName: string, payload: unknown) {
  await fs.writeFile(path.join(generatedDir, fileName), JSON.stringify(payload, null, 2) + '\n', 'utf8')
}

function buildSearchIndex(pages: SitePage[], packs: SitePack[]) {
  return [
    ...pages.map((page) => {
      const headings = page.headings.map((heading) => heading.text)
      return {
        type: 'page',
        title: page.title,
        slug: page.slug,
        description: page.description,
        module: page.module,
        headings,
        text: [page.title, page.description, page.module, page.section, page.navGroup, ...headings, page.body]
          .filter(Boolean)
          .join(' ')
          .slice(0, 12000),
      }
    }),
    ...packs.map((pack) => {
      const headings = pack.tags ?? []
      return {
        type: 'pack',
        title: pack.title,
        slug: `/packs/${pack.id}`,
        description: pack.summary ?? '',
        module: 'packs',
        headings,
        text: [pack.title, pack.summary ?? '', pack.category, ...headings].filter(Boolean).join(' '),
      }
    }),
  ]
}

async function buildGeneratedContent(contentRoot: string) {
  await fs.mkdir(generatedDir, { recursive: true })

  const [pages, packs] = await Promise.all([loadContentPages(contentRoot), loadPackEntries(contentRoot)])
  const publishedPages = pages.filter((page) => page.status === 'published')
  const publishedPacks = packs.filter((pack) => pack.status === 'published')
  const routes = buildRouteMap(publishedPages)
  const search = buildSearchIndex(publishedPages, publishedPacks)

  await writeJson('pages-manifest.json', publishedPages)
  await writeJson('routes-manifest.json', routes)
  await writeJson('packs-manifest.json', publishedPacks)
  await writeJson('search-index.json', search)
  await writeContentBuildMeta(contentRoot, {
    pages: publishedPages.length,
    routes: routes.length,
    packs: publishedPacks.length,
    search: search.length,
  })

  console.log(
    `[content-build] refreshed manifests from ${contentRoot} pages=${publishedPages.length} routes=${routes.length} packs=${publishedPacks.length} search=${search.length}`,
  )
}

async function main() {
  try {
    const contentRoot = await resolveContentRoot(preferredContentRoot)

    if (await hasUsableContentRoot(contentRoot)) {
      await buildGeneratedContent(contentRoot)
      return
    }
  } catch (error) {
    if (!(await hasGeneratedContent())) {
      throw error
    }

    console.warn(
      `[content-build] failed to resolve fresh content root from ${preferredContentRoot}; using checked-in generated manifests from ${generatedDir}`,
    )
    console.warn(error)
    return
  }

  if (await hasGeneratedContent()) {
    console.log(
      `[content-build] content root unavailable at ${preferredContentRoot}; using checked-in generated manifests from ${generatedDir}`,
    )
    return
  }

  throw new Error(
    `[content-build] content root missing at ${preferredContentRoot} and no generated manifests found in ${generatedDir}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
