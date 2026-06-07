import { type NextRequest, NextResponse } from 'next/server'

const STATIC_ASSET_PREFIX = '/content-assets/'

function normalizeAssetPath(assetPath: string) {
  return assetPath
    .replace(/^\/+/, '')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/')
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const assetPath = searchParams.get('path')

  if (!assetPath) {
    return new NextResponse('Missing path parameter', { status: 400 })
  }

  const normalizedPath = normalizeAssetPath(assetPath)
  if (!normalizedPath) {
    return new NextResponse('Invalid path parameter', { status: 400 })
  }

  const target = new URL(`${STATIC_ASSET_PREFIX}${normalizedPath}`, origin)
  return NextResponse.redirect(target, { status: 308 })
}
