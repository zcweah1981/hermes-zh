import { promises as fs } from 'node:fs'
import path from 'node:path'

import { buildRouteMap } from '../lib/content/resolvers/build-route-map'
import { loadContentPages, loadPackEntries } from '../lib/content/sync/source-loader'
import { resolveContentRoot } from '../lib/content/sync/resolve-content-root'
import type { SitePack, SitePage } from '../lib/content/types'
import { syncReferencedContentAssets } from './lib/content-assets'
import { writeContentBuildMeta } from './lib/content-build-meta'

const generatedDir = path.join(process.cwd(), 'content-cache', 'generated')

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

async function main() {
  await fs.mkdir(generatedDir, { recursive: true })

  const repoPath = await resolveContentRoot()
  const [pages, packs] = await Promise.all([loadContentPages(repoPath), loadPackEntries(repoPath)])
  const publishedPages = pages.filter((page) => page.status === 'published')
  const publishedPacks = packs.filter((pack) => pack.status === 'published')
  const routes = buildRouteMap(publishedPages)
  const search = buildSearchIndex(publishedPages, publishedPacks)
  const syncedAssets = await syncReferencedContentAssets(repoPath, publishedPages)

  await writeJson('pages-manifest.json', publishedPages)
  await writeJson('routes-manifest.json', routes)
  await writeJson('packs-manifest.json', publishedPacks)
  await writeJson('search-index.json', search)
  await writeContentBuildMeta(repoPath, {
    pages: publishedPages.length,
    routes: routes.length,
    packs: publishedPacks.length,
    search: search.length,
  })

  console.log(
    `built pages=${publishedPages.length} routes=${routes.length} packs=${publishedPacks.length} search=${search.length} assets=${syncedAssets.copied}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
