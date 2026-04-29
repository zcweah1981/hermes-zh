import { promises as fs } from 'node:fs'
import path from 'node:path'

import { loadContentPages } from '../lib/content/sync/source-loader'
import { resolveContentRoot } from '../lib/content/sync/resolve-content-root'
import { writeContentBuildMeta } from './lib/content-build-meta'

const outputPath = path.join(process.cwd(), 'content-cache', 'generated', 'pages-manifest.json')

async function main() {
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  const repoPath = await resolveContentRoot()
  const pages = (await loadContentPages(repoPath)).filter((page) => page.status === 'published')

  await fs.writeFile(outputPath, JSON.stringify(pages, null, 2) + '\n', 'utf8')
  await writeContentBuildMeta(repoPath, {
    pages: pages.length,
    routes: 0,
    packs: 0,
    search: 0,
  })
  console.log(`synced ${pages.length} pages -> ${path.relative(process.cwd(), outputPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
