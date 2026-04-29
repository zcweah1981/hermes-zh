export type PageStatus = 'draft' | 'published' | 'archived'
export type SourceType = 'original' | 'imported' | 'adapted' | 'generated'
export type PageType = 'home' | 'module-overview' | 'doc-page' | 'reference-page' | 'pack-entry'

export interface SitePage {
  sourcePath: string
  slug: string
  title: string
  module: string
  section: string
  description: string
  order: number
  status: PageStatus
  updated: string
  sourceType: SourceType
  navGroup: string
  pageType: PageType
  headings: Array<{ depth: number; text: string; id: string }>
  body: string
  githubUrl: string
  next?: string
  prev?: string
}

export interface SitePack {
  id: string
  title: string
  category: string
  summary?: string
  modes: Array<'solo' | 'team'>
  doc: string
  install: string
  download?: string
  status: PageStatus
  featured?: boolean
  order?: number
  tags?: string[]
}

export interface RouteMapItem {
  sourcePath: string
  slug: string
  pageType: string
  module: string
  title?: string
  section?: string
  description?: string
  order?: number
  status?: PageStatus
  updated?: string
  sourceType?: SourceType
  navGroup?: string
}
