import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { SitePage } from '../../lib/content/types'

const markdownImagePattern = /!\[[^\]]*\]\(([^)]+)\)/g
const supportedAssetPattern = /\.(?:png|jpe?g|webp|gif|svg|avif)$/i

function isExternalOrAbsolute(src: string) {
  return /^(?:https?:|mailto:|tel:|hermes:|data:|#|\/)/i.test(src)
}

function normalizeMarkdownImageTarget(rawTarget: string) {
  const target = rawTarget.trim().replace(/^<|>$/g, '')
  const withoutTitle = target.match(/^(\S+)/)?.[1] ?? target
  const [pathname] = withoutTitle.split('#', 1)

  if (!pathname || isExternalOrAbsolute(pathname)) {
    return undefined
  }

  try {
    return decodeURI(pathname)
  } catch {
    return pathname
  }
}

function findReferencedAssetPaths(pages: SitePage[]) {
  const assetPaths = new Map<string, string>()

  for (const page of pages) {
    for (const match of page.body.matchAll(markdownImagePattern)) {
      const target = normalizeMarkdownImageTarget(match[1] ?? '')

      if (!target || !supportedAssetPattern.test(target)) {
        continue
      }

      const repoRelativePath = path.posix.normalize(path.posix.join(path.posix.dirname(page.sourcePath), target))
      const basename = path.posix.basename(repoRelativePath)
      const existingPath = assetPaths.get(basename)

      if (existingPath && existingPath !== repoRelativePath) {
        throw new Error(
          `content asset basename collision: ${basename} is referenced by both ${existingPath} and ${repoRelativePath}`,
        )
      }

      assetPaths.set(basename, repoRelativePath)
    }
  }

  return assetPaths
}

export async function syncReferencedContentAssets(contentRoot: string, pages: SitePage[]) {
  const publicAssetsDir = path.join(process.cwd(), 'public', 'content-assets')
  const referencedAssets = findReferencedAssetPaths(pages)
  let copied = 0
  const missing: string[] = []

  await fs.mkdir(publicAssetsDir, { recursive: true })

  for (const [basename, repoRelativePath] of referencedAssets) {
    const sourcePath = path.join(contentRoot, repoRelativePath)
    const targetPath = path.join(publicAssetsDir, basename)

    try {
      await fs.copyFile(sourcePath, targetPath)
      copied += 1
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        missing.push(repoRelativePath)
        continue
      }

      throw error
    }
  }

  if (missing.length > 0) {
    throw new Error(`missing referenced content assets:\n${missing.map((item) => `- ${item}`).join('\n')}`)
  }

  return { copied, directory: publicAssetsDir }
}
