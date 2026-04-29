import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { ContentBuildMeta } from './lib/content-build-meta'

async function main() {
  const generatedDir = path.join(process.cwd(), 'content-cache', 'generated')
  const arrayFiles = [
    'pages-manifest.json',
    'routes-manifest.json',
    'packs-manifest.json',
    'search-index.json',
  ]

  for (const file of arrayFiles) {
    const fullPath = path.join(generatedDir, file)
    await fs.access(fullPath)
    const raw = await fs.readFile(fullPath, 'utf8')
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      throw new Error(`${file} must be an array`)
    }
  }

  await fs.access(path.join(generatedDir, 'build-meta.json'))
  const buildMetaRaw = await fs.readFile(path.join(generatedDir, 'build-meta.json'), 'utf8')
  const buildMeta = JSON.parse(buildMetaRaw) as ContentBuildMeta

  if (buildMeta.schemaVersion !== 1) {
    throw new Error('build-meta.json schemaVersion must be 1')
  }

  if (!buildMeta.generatedAt || Number.isNaN(Date.parse(buildMeta.generatedAt))) {
    throw new Error('build-meta.json generatedAt must be a valid ISO timestamp')
  }

  if (!buildMeta.sourceRoot || !buildMeta.routeMapPath) {
    throw new Error('build-meta.json must record sourceRoot and routeMapPath')
  }

  if (!buildMeta.counts || typeof buildMeta.counts !== 'object') {
    throw new Error('build-meta.json must include counts')
  }

  console.log('content manifests verified')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
