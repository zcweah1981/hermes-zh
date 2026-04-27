import type { SitePack } from '@/lib/content/types'

import { readGeneratedJson } from './read-generated-json'

export async function loadPacksManifest(): Promise<SitePack[]> {
  return readGeneratedJson<SitePack[]>('packs-manifest.json')
}
