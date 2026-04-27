import Link from 'next/link'

import type { SitePack } from '@/lib/content/types'

export function PackCard({ pack }: { pack: SitePack }) {
  return (
    <Link
      href={`/packs/${pack.id}`}
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-1 hover:bg-white/[0.04]"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-accent">{pack.category}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{pack.title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted">{pack.summary}</p>
    </Link>
  )
}
