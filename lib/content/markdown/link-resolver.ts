import path from 'node:path'

import type { SitePage } from '@/lib/content/types'

const CONTENT_REPO_BRANCH = process.env.CONTENT_REPO_BRANCH ?? 'site-content-anchor'
const CONTENT_REPO_OWNER = 'zcweah1981/awesome-hermes-agent-zh'

function toDocHref(slug: string) {
  return slug.startsWith('/docs/') ? slug : `/docs${slug}`
}

function toBlobUrl(relativePath: string) {
  return `https://github.com/${CONTENT_REPO_OWNER}/blob/${CONTENT_REPO_BRANCH}/${relativePath}`
}

function toRawUrl(relativePath: string) {
  return `https://raw.githubusercontent.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_BRANCH}/${relativePath}`
}

function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:|hermes:)/i.test(href)
}

function normalizeMarkdownTarget(target: string) {
  const trimmed = target.trim().replace(/^<|>$/g, '')

  if (!trimmed || trimmed.startsWith('#') || isExternalHref(trimmed) || trimmed.startsWith('/')) {
    return trimmed
  }

  const [pathname, hash] = trimmed.split('#', 2)

  try {
    const decoded = decodeURI(pathname)
    return hash ? `${decoded}#${hash}` : decoded
  } catch {
    return trimmed
  }
}

function resolveRepoPath(currentSourcePath: string, targetPath: string) {
  return path.posix.normalize(path.posix.join(path.posix.dirname(currentSourcePath), targetPath))
}

function splitHash(href: string) {
  const [pathname, hash] = href.split('#', 2)
  return { pathname, hash }
}

export function resolveMarkdownHref(href: string, page: SitePage, pages: SitePage[]) {
  const normalized = normalizeMarkdownTarget(href)

  if (!normalized || normalized.startsWith('#') || normalized.startsWith('/')) {
    return normalized
  }

  if (isExternalHref(normalized)) {
    return normalized
  }

  const { pathname, hash } = splitHash(normalized)
  const resolvedPath = resolveRepoPath(page.sourcePath, pathname)

  if (pathname.endsWith('.md')) {
    const targetPage = pages.find((item) => item.sourcePath === resolvedPath)

    if (!targetPage) {
      return toBlobUrl(resolvedPath)
    }

    return hash ? `${toDocHref(targetPage.slug)}#${hash}` : toDocHref(targetPage.slug)
  }

  return toRawUrl(resolvedPath)
}

export function resolveMarkdownImage(src: string, page: SitePage) {
  const normalized = normalizeMarkdownTarget(src)

  if (!normalized || normalized.startsWith('#') || normalized.startsWith('/')) {
    return normalized
  }

  if (isExternalHref(normalized)) {
    return normalized
  }

  const { pathname } = splitHash(normalized)
  return toRawUrl(resolveRepoPath(page.sourcePath, pathname))
}

export function isExternalMarkdownHref(href: string) {
  return isExternalHref(href) || href.startsWith('http')
}
