import { promises as fs } from 'node:fs'
import path from 'node:path'

async function main() {
  const generatedDir = path.join(process.cwd(), 'content-cache', 'generated')
  const requiredFiles = [
    'pages-manifest.json',
    'routes-manifest.json',
    'packs-manifest.json',
    'search-index.json',
  ]

  for (const file of requiredFiles) {
    const fullPath = path.join(generatedDir, file)
    await fs.access(fullPath)
    const raw = await fs.readFile(fullPath, 'utf8')
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      throw new Error(`${file} must be an array`)
    }
  }

  console.log('content manifests verified')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
