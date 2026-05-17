import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const assetPath = searchParams.get('path')

  if (!assetPath) {
    return new NextResponse('Missing path parameter', { status: 400 })
  }

  // Prevent path traversal
  const normalizedPath = assetPath.replace(/^\/+/, '')
  const fullPath = join(process.cwd(), 'content-cache', 'raw', normalizedPath)

  try {
    const content = await readFile(fullPath)
    const ext = assetPath.split('.').pop()?.toLowerCase()
    
    let contentType = 'application/octet-stream'
    if (ext === 'png') contentType = 'image/png'
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'svg') contentType = 'image/svg+xml'
    else if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'gif') contentType = 'image/gif'

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error(`Asset not found: ${fullPath}`, error)
    return new NextResponse('Asset not found', { status: 404 })
  }
}
