import type { SitePage } from '@/lib/content/types'

import { readGeneratedJson } from './read-generated-json'

export async function loadPagesManifest(): Promise<SitePage[]> {
  return readGeneratedJson<SitePage[]>('pages-manifest.json')
}
