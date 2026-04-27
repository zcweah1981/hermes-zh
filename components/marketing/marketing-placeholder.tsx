import Link from 'next/link'

import { SectionCard } from '@/components/ui/section-card'

export function MarketingPlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionCard eyebrow="Placeholder" title={title} description={description}>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/docs/start" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-muted transition hover:bg-white/[0.04]">
            文档页骨架入口 → /docs/start
          </Link>
          <Link href="/packs" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-muted transition hover:bg-white/[0.04]">
            Packs 列表骨架 → /packs
          </Link>
          <a href="https://github.com/zcweah1981/awesome-hermes-agent-zh" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-muted transition hover:bg-white/[0.04]">
            内容真源仓 → GitHub
          </a>
        </div>
      </SectionCard>
    </div>
  )
}
