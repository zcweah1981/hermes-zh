import { PackCard } from '@/components/packs/pack-card'
import { SectionCard } from '@/components/ui/section-card'
import { loadPacksManifest } from '@/lib/content/loaders/packs'

export default async function PacksPage() {
  const packs = await loadPacksManifest()

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionCard
        eyebrow="Packs"
        title="Packs 列表占位"
        description="当前先消费 generated packs-manifest.json 样板，后续切到内容仓 packs/**/manifest.yaml 自动生成。"
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
