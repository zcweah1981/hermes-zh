import type { SitePack, SitePage } from '@/lib/content/types'
import { toDocPath } from '@/lib/routing/docs-path'
import { buildCanonicalUrl } from '@/lib/seo/canonical'
import { getEffectiveDescription, getPackSeoDescription } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

type JsonLdObject = Record<string, unknown>

function serializeJsonLd(data: JsonLdObject | JsonLdObject[]) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function SiteJsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}

export function buildOrganizationJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: buildCanonicalUrl('/hermes-logo.png'),
    sameAs: ['https://github.com/zcweah1981/awesome-hermes-agent-zh'],
  }
}

export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'zh-CN',
    description: 'Hermes Agent 中文教程、Packs 与国内落地导航站。',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildDocBreadcrumbJsonLd(page: SitePage): JsonLdObject {
  return buildBreadcrumbJsonLd([
    { name: SITE_NAME, url: SITE_URL },
    { name: page.module || '文档', url: buildCanonicalUrl(toDocPath(page.slug).split('/').slice(0, 3).join('/') || '/docs') },
    { name: page.title, url: buildCanonicalUrl(toDocPath(page.slug)) },
  ])
}

export function buildTechArticleJsonLd(page: SitePage): JsonLdObject {
  const url = buildCanonicalUrl(toDocPath(page.slug))
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.title,
    description: getEffectiveDescription(page),
    url,
    inLanguage: 'zh-CN',
    dateModified: page.updated || undefined,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: url,
  }
}

export function buildCollectionPageJsonLd(input: { title: string; description: string; pathname: string }): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.title,
    description: input.description,
    url: buildCanonicalUrl(input.pathname),
    inLanguage: 'zh-CN',
  }
}

export function buildWebPageJsonLd(input: { title: string; description: string; pathname: string }): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.title,
    description: input.description,
    url: buildCanonicalUrl(input.pathname),
    inLanguage: 'zh-CN',
  }
}

export function buildFAQPageJsonLd(page: SitePage): JsonLdObject | null {
  if (!/问题|FAQ|排查|常见/.test(`${page.title} ${page.module} ${page.section}`)) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${page.title} 应该先查哪里？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: getEffectiveDescription(page),
        },
      },
    ],
  }
}

export function buildSoftwareSourceCodeJsonLd(pack: SitePack): JsonLdObject {
  const url = buildCanonicalUrl(`/packs/${pack.id}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: `${pack.title} Pack`,
    description: getPackSeoDescription(pack),
    url,
    codeRepository: 'https://github.com/zcweah1981/awesome-hermes-agent-zh',
    programmingLanguage: 'Markdown',
    inLanguage: 'zh-CN',
    applicationCategory: pack.category,
  }
}
