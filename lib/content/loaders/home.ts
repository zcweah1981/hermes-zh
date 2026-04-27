import { loadPagesManifest } from '@/lib/content/loaders/pages'
import { loadPacksManifest } from '@/lib/content/loaders/packs'

export async function getHomeData() {
  const [pages, packs] = await Promise.all([loadPagesManifest(), loadPacksManifest()])

  return {
    featuredPages: pages.slice(0, 4),
    featuredPacks: packs.filter((pack) => pack.featured).slice(0, 3),
  }
}
