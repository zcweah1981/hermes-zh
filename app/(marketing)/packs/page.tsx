import type { Metadata } from 'next'

import { PackCard } from '@/components/packs/pack-card'
import { SectionCard } from '@/components/ui/section-card'
import { loadPacksManifest } from '@/lib/content/loaders/packs'
import { buildCanonicalUrl } from '@/lib/seo/canonical'

export const metadata: Metadata = {
  title: 'Packs',
  description: '浏览已经整理好的 Hermes Packs 与对应使用场景。',
  alternates: {
    canonical: buildCanonicalUrl('/packs'),
  },
}

export default async function PacksPage() {
  const packs = (await loadPacksManifest()).filter((pack) => pack.status === 'published')

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionCard
        eyebrow="Packs"
        title="按场景挑选可用 Packs"
        description="每个 Pack 都对应一个明确任务场景，你可以先看简介，再进入详情页继续阅读关联文档。"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
