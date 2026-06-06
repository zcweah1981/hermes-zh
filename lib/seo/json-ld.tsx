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
    description: 'Hermes Agent 中文学习与落地入口，覆盖快速上手、现成方案、国内落地、OpenClaw 迁移、参考手册和问题排查。',
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

export function buildCreativeWorkJsonLd(page: SitePage): JsonLdObject {
  const url = buildCanonicalUrl(toDocPath(page.slug))
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: page.title,
    description: page.description,
    url,
    inLanguage: 'zh-CN',
    dateModified: page.updated || undefined,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
}

function cleanInlineMarkdown(value: string) {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateText(value: string, maxLength = 220) {
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}…` : value
}

function extractSpeedAnswerLine(body: string) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /^(?:>\s*)?(?:💡\s*)?\*\*速答\*\*[:：]|^(?:>\s*)?💡\s*速答[:：]/.test(line))
}

function stripSpeedAnswerMarker(line: string) {
  return line.replace(/^(?:>\s*)?(?:💡\s*)?(?:\*\*速答\*\*|速答)[:：]\s*/, '')
}

export function buildAnswerBlockJsonLd(page: SitePage): JsonLdObject | null {
  const speedAnswer = extractSpeedAnswerLine(page.body)

  if (!speedAnswer) return null

  const answer = cleanInlineMarkdown(stripSpeedAnswerMarker(speedAnswer))
  if (!answer) return null

  const url = buildCanonicalUrl(toDocPath(page.slug))
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${page.title}：速答`,
    abstract: truncateText(answer, 360),
    isPartOf: { '@type': 'CreativeWork', name: page.title, url },
    url,
    inLanguage: 'zh-CN',
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

function cleanFaqHeading(value: string) {
  return value
    .replace(/^#+\s*/, '')
    .replace(/\s*\{#faq-[^}]+}\s*$/i, '')
    .replace(/^\s*(?:❓\s*)?(?:常见问题|FAQ)\s*/i, '')
    .replace(/^\d+[｜|、.．\s-]+/, '')
    .trim()
}

function cleanFaqAnswer(value: string) {
  return cleanInlineMarkdown(value)
}

function extractFaqEntitiesFromBody(body: string) {
  const lines = body.split('\n')
  const entities: JsonLdObject[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    const isFaqHeading =
      /^#{2,4}\s+/.test(line) &&
      (/\{#faq-[^}]+}/i.test(line) || /[？?]/.test(line) || /^#{2,4}\s*(?:❓\s*)?(?:常见问题|FAQ|问题)\s*\d*[:：]?/.test(line))

    if (!isFaqHeading || /^#{2,4}\s*(?:❓\s*)?(?:常见问题|FAQ)\s*$/i.test(line)) continue

    const question = cleanFaqHeading(line)
    if (!question) continue

    const answerLines: string[] = []
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const nextLine = lines[cursor].trim()
      if (/^#{1,6}\s+/.test(nextLine)) break
      if (!nextLine || nextLine === '---') {
        if (answerLines.length > 0) break
        continue
      }
      if (/^[-*+]\s+/.test(nextLine) && answerLines.length === 0) continue
      answerLines.push(nextLine)
      if (answerLines.join(' ').length >= 42) break
    }

    const answer = cleanFaqAnswer(answerLines.join(' '))
    if (!answer) continue

    entities.push({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer.length > 220 ? `${answer.slice(0, 220).trim()}…` : answer,
      },
    })
  }

  return entities
}

export function buildFAQPageJsonLd(page: SitePage): JsonLdObject | null {
  const mainEntity = extractFaqEntitiesFromBody(page.body)
  if (mainEntity.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
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
