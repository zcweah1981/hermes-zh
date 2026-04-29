import { readGeneratedJson } from './read-generated-json'

export interface SearchEntry {
  type: 'page' | 'pack'
  title: string
  slug: string
  description: string
  module: string
  headings: string[]
}

export async function loadSearchIndex(): Promise<SearchEntry[]> {
  return readGeneratedJson<SearchEntry[]>('search-index.json')
}