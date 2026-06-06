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
  matcher: [
    '/((?!_next|api|fonts|content-assets|assets|og|favicon|logo|icon|apple-icon|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|mjs|map|txt|xml|json|woff|woff2|ttf|otf|eot|pdf|zip|gz|br)$).*)',
  ],
}