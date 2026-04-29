import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const LOCAL_CONTENT_REPO = '/opt/projects/awesome-hermes-agent-zh'
const CONTENT_REPO_BRANCH = process.env.CONTENT_REPO_BRANCH ?? 'site-content-anchor'
const CONTENT_REPO_URL =
  process.env.CONTENT_REPO_URL ?? 'https://github.com/zcweah1981/awesome-hermes-agent-zh.git'
const FALLBACK_CONTENT_ROOT = path.join(process.cwd(), '.content-cache', `awesome-hermes-agent-zh-${CONTENT_REPO_BRANCH}`)
const REQUIRED_ROUTE_MAP = path.join('governance', 'site-route-map.yaml')

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function hasRequiredContentRoot(targetPath: string) {
  return pathExists(path.join(targetPath, REQUIRED_ROUTE_MAP))
}

async function runCommand(command: string, args: string[], cwd = process.cwd()) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`))
    })
  })
}

async function cloneFallbackRepo() {
  if (await hasRequiredContentRoot(FALLBACK_CONTENT_ROOT)) {
    return FALLBACK_CONTENT_ROOT
  }

  await fs.rm(FALLBACK_CONTENT_ROOT, { recursive: true, force: true })
  await fs.mkdir(path.dirname(FALLBACK_CONTENT_ROOT), { recursive: true })

  console.log(
    `[content-sync] local content repo missing; cloning ${CONTENT_REPO_URL}#${CONTENT_REPO_BRANCH} -> ${FALLBACK_CONTENT_ROOT}`,
  )

  await runCommand('git', [
    'clone',
    '--depth',
    '1',
    '--branch',
    CONTENT_REPO_BRANCH,
    CONTENT_REPO_URL,
    FALLBACK_CONTENT_ROOT,
  ])

  if (!(await hasRequiredContentRoot(FALLBACK_CONTENT_ROOT))) {
    throw new Error(
      `[content-sync] cloned fallback repo but still missing ${REQUIRED_ROUTE_MAP} under ${FALLBACK_CONTENT_ROOT}`,
    )
  }

  return FALLBACK_CONTENT_ROOT
}

export async function resolveContentRoot(preferredPath = process.env.CONTENT_REPO_PATH ?? LOCAL_CONTENT_REPO) {
  if (await hasRequiredContentRoot(preferredPath)) {
    return preferredPath
  }

  return cloneFallbackRepo()
}
