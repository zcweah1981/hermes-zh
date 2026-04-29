import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const generatedDir = path.join(process.cwd(), 'content-cache', 'generated')
export const buildMetaPath = path.join(generatedDir, 'build-meta.json')

export interface ContentBuildMeta {
  schemaVersion: 1
  generatedAt: string
  sourceRoot: string
  sourceBranch: string | null
  sourceSha: string | null
  routeMapPath: string
  counts: {
    pages: number
    routes: number
    packs: number
    search: number
  }
}

async function runGit(contentRoot: string, args: string[]) {
  try {
    const { stdout } = await execFileAsync('git', ['-C', contentRoot, ...args])
    return stdout.trim() || null
  } catch {
    return null
  }
}

export async function buildContentBuildMeta(
  contentRoot: string,
  counts: ContentBuildMeta['counts'],
): Promise<ContentBuildMeta> {
  const [sourceBranch, sourceSha] = await Promise.all([
    runGit(contentRoot, ['branch', '--show-current']),
    runGit(contentRoot, ['rev-parse', 'HEAD']),
  ])

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceRoot: contentRoot,
    sourceBranch,
    sourceSha,
    routeMapPath: path.join(contentRoot, 'governance', 'site-route-map.yaml'),
    counts,
  }
}

export async function writeContentBuildMeta(
  contentRoot: string,
  counts: ContentBuildMeta['counts'],
) {
  await fs.mkdir(generatedDir, { recursive: true })
  const payload = await buildContentBuildMeta(contentRoot, counts)
  await fs.writeFile(buildMetaPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  return payload
}
