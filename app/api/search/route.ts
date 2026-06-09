import { NextResponse } from 'next/server'

const SEARCH_REDIRECT_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300',
}

export async function GET(request: Request) {
  const sourceUrl = new URL(request.url)
  const redirectUrl = new URL(request.url)
  redirectUrl.pathname = '/search'
  redirectUrl.search = ''
  const query = sourceUrl.searchParams.get('q')

  if (query) {
    redirectUrl.searchParams.set('q', query.trim().slice(0, 64))
  }

  return NextResponse.redirect(redirectUrl, {
    status: 308,
    headers: SEARCH_REDIRECT_CACHE_HEADERS,
  })
}
