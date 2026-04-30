import type { SitePage } from '@/lib/content/types'

const invalidSummaryPatterns = [
  /^这一页只解决一件事[:：]?$/,
  /^本页主要介绍[:：]?$/,
  /^在这一节中[:：]?$/,
  /^你将学会[:：]?$/,
  /^先说结论[:：]?$/,
  /^下一步[:：]?$/,
]

const templatePrefixes = [
  '这一页只解决一件事',
  '本页主要介绍',
  '在这一节中',
  '你将学会',
  '先说结论',
  '下一步',
]

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function stripTemplatePrefix(value: string) {
  let next = value.trim()
  for (const prefix of templatePrefixes) {
    const pattern = new RegExp(`^${prefix}[：:]?\\s*`)
    next = next.replace(pattern, '')
  }
  return next.trim()
}

function cleanMarkdownInline(value: string) {
  return normalizeWhitespace(
    value
      .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/(?:\.\.\/)+[^\s)]+/g, ' ')
      .replace(/%[0-9A-Fa-f]{2}/g, ' '),
  )
}

function meaningfulLength(value: string) {
  return value.replace(/[\s，。！？、：:；;,.!?“”"'「」《》（）()\[\]【】]/g, '').length
}

export function isInvalidNavSummary(value: string) {
  const cleaned = cleanMarkdownInline(value)
  const withoutPrefix = stripTemplatePrefix(cleaned)

  if (!cleaned) return true
  if (invalidSummaryPatterns.some((pattern) => pattern.test(cleaned))) return true
  if (!withoutPrefix) return true
  if (meaningfulLength(withoutPrefix) < 8) return true
  if (/(?:\.\.\/)+|\/assets\/|\.png\)|\.jpg\)|\.webp\)|frontmatter|route map|build|proof|VFIX/i.test(cleaned)) return true

  return false
}

function finalizeSummary(value: string) {
  const cleaned = stripTemplatePrefix(cleanMarkdownInline(value))
  if (isInvalidNavSummary(cleaned)) return null
  if (cleaned.length <= 96) return cleaned

  const slice = cleaned.slice(0, 96)
  const lastPunctuation = Math.max(
    slice.lastIndexOf('。'),
    slice.lastIndexOf('！'),
    slice.lastIndexOf('？'),
    slice.lastIndexOf('；'),
  )
  return `${(lastPunctuation >= 36 ? slice.slice(0, lastPunctuation + 1) : slice).trim()}…`
}

function stripFrontmatter(body: string) {
  return body.replace(/^---\s*[\s\S]*?\s*---\s*/u, '')
}

function isSkippableLine(value: string) {
  const cleaned = cleanMarkdownInline(value)
  return (
    !cleaned ||
    cleaned === '---' ||
    /^#+\s+/.test(cleaned) ||
    /^如果你想先回到/.test(cleaned) ||
    /^如果需要/.test(cleaned) ||
    /^你可以先/.test(cleaned) ||
    isInvalidNavSummary(cleaned)
  )
}

export function extractSummaryFromBody(body: string): string | null {
  const withoutFrontmatter = stripFrontmatter(body)
  const normalizedLines = withoutFrontmatter
    .replace(/!\[[^\]]*]\([^)]*\)/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())

  for (const line of normalizedLines) {
    if (isSkippableLine(line)) continue
    const summary = finalizeSummary(line)
    if (summary) return summary
  }

  return null
}

export function getDocNavSummary(page: SitePage) {
  const metadataSummary = finalizeSummary(page.description)
  if (metadataSummary) return metadataSummary

  const bodySummary = extractSummaryFromBody(page.body)
  if (bodySummary) return bodySummary

  return `阅读「${page.title}」，继续完成当前学习路径。`
}
