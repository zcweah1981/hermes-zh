import type { Metadata } from 'next'

import { PackCard } from '@/components/packs/pack-card'
import { SectionCard } from '@/components/ui/section-card'
import { loadPacksManifest } from '@/lib/content/loaders/packs'
import { SiteJsonLd, buildCollectionPageJsonLd } from '@/lib/seo/json-ld'
import { buildSeoMetadata, getCorePageSeo } from '@/lib/seo/metadata'

const packsSeo = getCorePageSeo('/packs')

export const dynamic = 'force-static'
export const revalidate = false
export const fetchCache = 'force-cache'

export const metadata: Metadata = buildSeoMetadata({
  title: packsSeo.title,
  description: packsSeo.description,
  pathname: '/packs',
})

export default async function PacksPage() {
  const packs = (await loadPacksManifest()).filter((pack) => pack.status === 'published')

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SiteJsonLd data={buildCollectionPageJsonLd({ title: packsSeo.title, description: packsSeo.description, pathname: '/packs' })} />
      <SectionCard
        eyebrow="Packs"
        title="按场景挑选可用 Packs"
        description={packsSeo.aiSummary}
        isH1={true}
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
