import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'
import * as path from 'node:path'

const REQUESTED_PORT = Number(process.env.SMOKE_PORT ?? 3100)
const DEFAULT_HOST = process.env.SMOKE_HOST ?? '127.0.0.1'
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS ?? 10_000)
const SERVER_READY_TIMEOUT_MS = Number(process.env.SMOKE_SERVER_READY_TIMEOUT_MS ?? 30_000)

const routes = [
  {
    path: '/',
    contentType: 'text/html',
    includes: ['Hermes Agent 中文站'],
  },
  {
    path: '/docs/start',
    contentType: 'text/html',
    includes: ['从这开始'],
  },
  {
    path: '/search',
    contentType: 'text/html',
    includes: ['搜索'],
  },
  {
    path: '/packs/miniapp-lab',
    contentType: 'text/html',
    includes: ['微信小程序助手 Pack'],
  },
  {
    path: '/sitemap.xml',
    contentType: 'application/xml',
    includes: ['https://hermes-zh.com/', 'https://hermes-zh.com/packs/miniapp-lab'],
  },
  {
    path: '/robots.txt',
    contentType: 'text/plain',
    includes: ['Allow: /', 'Sitemap: https://hermes-zh.com/sitemap.xml'],
  },
] as const

async function ensureBuildArtifacts() {
  await access(path.join(process.cwd(), '.next', 'BUILD_ID'))
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, {
      redirect: 'manual',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function waitForServer(baseUrl: string, child: ReturnType<typeof spawn>) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < SERVER_READY_TIMEOUT_MS) {
    if (child.exitCode !== null) {
      throw new Error(`Smoke server exited early with code ${child.exitCode}`)
    }

    try {
      const response = await fetchWithTimeout(baseUrl)
      if (response.ok) {
        return
      }
    } catch {
      // keep retrying until timeout
    }

    await delay(500)
  }

  throw new Error(`Timed out waiting for smoke server at ${baseUrl}`)
}

async function findAvailablePort(host: string, preferredPort: number) {
  return await new Promise<number>((resolve, reject) => {
    const server = createServer()
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        const fallback = createServer()
        fallback.once('error', reject)
        fallback.listen(0, host, () => {
          const address = fallback.address()
          fallback.close(() => {
            if (typeof address === 'object' && address?.port) {
              resolve(address.port)
            } else {
              reject(new Error('Unable to allocate fallback smoke port'))
            }
          })
        })
        return
      }
      reject(error)
    })
    server.listen(preferredPort, host, () => {
      server.close(() => resolve(preferredPort))
    })
  })
}

function startServer(port: number) {
  return spawn('npm', ['run', 'start', '--', '--hostname', DEFAULT_HOST, '--port', String(port)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: DEFAULT_HOST,
      FORCE_COLOR: '0',
    },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

async function runChecks(baseUrl: string) {
  for (const route of routes) {
    const url = new URL(route.path, `${baseUrl}/`).toString()
    const response = await fetchWithTimeout(url)
    const body = await response.text()
    const contentType = response.headers.get('content-type') ?? ''

    if (response.status !== 200) {
      throw new Error(`Smoke check failed for ${route.path}: expected 200, received ${response.status}`)
    }

    if (!contentType.includes(route.contentType)) {
      throw new Error(`Smoke check failed for ${route.path}: expected content-type to include ${route.contentType}, received ${contentType}`)
    }

    for (const snippet of route.includes) {
      if (!body.includes(snippet)) {
        throw new Error(`Smoke check failed for ${route.path}: missing snippet ${JSON.stringify(snippet)}`)
      }
    }

    console.log(`✓ ${route.path} -> ${response.status} ${contentType}`)
  }
}

async function main() {
  const usingExternalBaseUrl = Boolean(process.env.SMOKE_BASE_URL)
  const port = usingExternalBaseUrl ? REQUESTED_PORT : await findAvailablePort(DEFAULT_HOST, REQUESTED_PORT)
  const baseUrl = process.env.SMOKE_BASE_URL ?? `http://${DEFAULT_HOST}:${port}`
  let child: ReturnType<typeof spawn> | undefined

  if (!usingExternalBaseUrl) {
    await ensureBuildArtifacts()
    child = startServer(port)
    await waitForServer(baseUrl, child)
  }

  try {
    await runChecks(baseUrl)
    console.log(`Smoke checks passed for ${baseUrl}`)
  } finally {
    if (child && child.exitCode === null) {
      child.kill('SIGTERM')
      await Promise.race([
        new Promise<void>((resolve) => child?.once('exit', () => resolve())),
        delay(5_000),
      ])
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  console.error(message)
  process.exit(1)
})
