import { promises as fs } from 'node:fs'
import path from 'node:path'

import { buildRouteMap } from '../lib/content/resolvers/build-route-map'
import type { SitePack, SitePage } from '../lib/content/types'

const generatedDir = path.join(process.cwd(), 'content-cache', 'generated')

const fallbackPacks: SitePack[] = [
  {
    id: 'meeting-lab',
    title: '会议纪要助手',
    category: '会议与信息整理',
    summary: 'packs 页最小样板，用于验证列表页与详情页。',
    modes: ['solo', 'team'],
    doc: 'docs/solutions/meeting-minutes.md',
    install: 'packs/meeting-lab/INSTALL.md',
    download: 'packs/meeting-lab/01-super-individual.zip',
    status: 'published',
    featured: true,
    order: 1,
    tags: ['meeting', 'minutes'],
  },
]

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(generatedDir, fileName), 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson(fileName: string, payload: unknown) {
  await fs.writeFile(path.join(generatedDir, fileName), JSON.stringify(payload, null, 2) + '\n', 'utf8')
}

async function main() {
  await fs.mkdir(generatedDir, { recursive: true })

  const pages = await readJson<SitePage[]>('pages-manifest.json', [])
  const packs = await readJson<SitePack[]>('packs-manifest.json', fallbackPacks)
  const routes = buildRouteMap(pages)
  const search = pages.map((page) => ({
    title: page.title,
    slug: page.slug,
    description: page.description,
  }))

  await writeJson('routes-manifest.json', routes)
  await writeJson('packs-manifest.json', packs)
  await writeJson('search-index.json', search)

  console.log(`built routes=${routes.length} packs=${packs.length} search=${search.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
