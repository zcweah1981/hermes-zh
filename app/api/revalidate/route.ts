import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

type RevalidatePayload = {
  path?: string
  paths?: string[]
  tag?: string
  tags?: string[]
}

function uniqueStrings(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (value ? [value] : []))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_TOKEN

  if (!secret) {
    return NextResponse.json({ ok: false, error: 'missing REVALIDATE_TOKEN' }, { status: 500 })
  }

  let body: RevalidatePayload = {}

  try {
    body = (await request.json()) as RevalidatePayload
  } catch {
    body = {}
  }

  const token = request.headers.get('x-revalidate-token') ?? request.nextUrl.searchParams.get('token') ?? undefined

  if (token !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const paths = uniqueStrings([body.path, ...(body.paths ?? [])])
  const tags = uniqueStrings([body.tag, ...(body.tags ?? [])])

  if (paths.length === 0 && tags.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'provide at least one path or tag to revalidate' },
      { status: 400 },
    )
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  for (const tag of tags) {
    revalidateTag(tag)
  }

  return NextResponse.json({
    ok: true,
    revalidated: {
      paths,
      tags,
    },
  })
}
