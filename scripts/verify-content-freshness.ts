import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import type { ContentBuildMeta } from './lib/content-build-meta'

const execFileAsync = promisify(execFile)
const generatedDir = path.join(process.cwd(), 'content-cache', 'generated')
const buildMetaPath = path.join(generatedDir, 'build-meta.json')
const maxAgeMinutes = Number(process.env.CONTENT_MAX_AGE_MINUTES ?? '1440')
const compareSha = process.env.CONTENT_COMPARE_SHA !== '0'

async function getGitSha(contentRoot: string) {
  const { stdout } = await execFileAsync('git', ['-C', contentRoot, 'rev-parse', 'HEAD'])
  return stdout.trim()
}

async function main() {
  const raw = await fs.readFile(buildMetaPath, 'utf8')
  const meta = JSON.parse(raw) as ContentBuildMeta

  if (!meta.generatedAt || Number.isNaN(Date.parse(meta.generatedAt))) {
    throw new Error('build-meta.json has invalid generatedAt')
  }

  const ageMinutes = Math.floor((Date.now() - Date.parse(meta.generatedAt)) / 60000)
  if (ageMinutes > maxAgeMinutes) {
    throw new Error(
      `generated manifests are stale: age=${ageMinutes}m exceeds CONTENT_MAX_AGE_MINUTES=${maxAgeMinutes}`,
    )
  }

  const routeMapExists = await fs
    .access(meta.routeMapPath)
    .then(() => true)
    .catch(() => false)

  if (!routeMapExists) {
    throw new Error(`route map missing at ${meta.routeMapPath}`)
  }

  if (compareSha) {
    if (!meta.sourceSha) {
      throw new Error('build-meta.json missing sourceSha while CONTENT_COMPARE_SHA is enabled')
    }

    const currentSourceSha = await getGitSha(meta.sourceRoot)
    if (currentSourceSha !== meta.sourceSha) {
      throw new Error(
        `generated manifests do not match current content repo HEAD: meta=${meta.sourceSha} current=${currentSourceSha}`,
      )
    }
  }

  console.log(
    `content freshness verified age=${ageMinutes}m sourceSha=${meta.sourceSha ?? 'unknown'} sourceBranch=${meta.sourceBranch ?? 'unknown'}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})