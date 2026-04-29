import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LEGACY_WWW_HOST = 'www.hermes-zh.com'
const CANONICAL_HOST = 'hermes-zh.com'

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname !== LEGACY_WWW_HOST) {
    return NextResponse.next()
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.hostname = CANONICAL_HOST
  redirectUrl.protocol = 'https'

  return NextResponse.redirect(redirectUrl, 308)
}

export const config = {
  matcher: ['/((?!_next|api/revalidate).*)'],
}