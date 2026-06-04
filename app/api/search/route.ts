import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

type SearchIndexItem = {
  type?: string
  slug?: string
  title?: string
  text?: string
  id?: string
}

const SEARCH_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
}

let cachedIndex: SearchIndexItem[] | null = null
let cachedIndexMtimeMs = 0

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...SEARCH_CACHE_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().slice(0, 64)
}

function tokenizeQuery(value: string) {
  return normalizeQuery(value)
    .split(/[\s/｜|、，,。:：]+/)
    .filter((token) => token.length >= 2)
}

function loadSearchIndex() {
  const indexPath = path.join(process.cwd(), 'content-cache/generated/search-index.json')
  if (!fs.existsSync(indexPath)) {
    cachedIndex = []
    cachedIndexMtimeMs = 0
    return cachedIndex
  }

  const stat = fs.statSync(indexPath)
  if (cachedIndex && cachedIndexMtimeMs === stat.mtimeMs) {
    return cachedIndex
  }

  const content = fs.readFileSync(indexPath, 'utf-8')
  cachedIndex = JSON.parse(content) as SearchIndexItem[]
  cachedIndexMtimeMs = stat.mtimeMs
  return cachedIndex
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = normalizeQuery(searchParams.get('q') || '')

  try {
    if (q.length < 2) {
      return json([])
    }

    const index = loadSearchIndex()
    const queryTokens = tokenizeQuery(q)

    // Simple token-aware fuzzy search, bounded to avoid large JSON payloads for common terms.
    const matches = index
      .filter((item) => {
        const haystack = [item.title, item.text].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(q) || queryTokens.every((token) => haystack.includes(token))
      })
      .slice(0, 20)

    return json(matches)
  } catch {
    return json({ error: 'Search failed' }, { status: 500 })
  }
}
