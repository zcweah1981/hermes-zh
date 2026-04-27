import type { RouteMapItem } from '@/lib/content/types'

import { readGeneratedJson } from './read-generated-json'

export async function loadRoutesManifest(): Promise<RouteMapItem[]> {
  return readGeneratedJson<RouteMapItem[]>('routes-manifest.json')
}
