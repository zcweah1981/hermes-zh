import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import React from 'react'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { CopyableCodeBlock } from '@/components/docs/copyable-code-block'
import { isExternalMarkdownHref, resolveMarkdownHref, resolveMarkdownImage } from '@/lib/content/markdown/link-resolver'
import { slugifyHeadingText } from '@/lib/content/markdown/slugify'
import type { SitePage } from '@/lib/content/types'

function flattenText(children: ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }

      if (React.isValidElement<{ children?: ReactNode }>(child)) {
        return flattenText(child.props.children)
      }

      return ''
    })
    .join('')
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6, className: string) {
  return function Heading({ children, ...props }: ComponentPropsWithoutRef<`h${typeof level}`>) {
    const text = flattenText(children)
    const id = slugifyHeadingText(text)
    const Tag = `h${level}` as const

    return (
      <Tag id={id} className={className} {...props}>
        {children}
      </Tag>
    )
  }
}

function containsBlockImageFigure(children: ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement<{ node?: { tagName?: string }; src?: unknown }>(child)) {
      return false
    }

    return child.type === 'figure' || child.props.node?.tagName === 'img' || typeof child.props.src === 'string'
  })
}

function normalizeHeadingText(value: string) {
  return value
    .replace(/^#+\s*/, '')
    .replace(/\s*#+\s*$/, '')
    .replace(/[|｜]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripLeadingDuplicateTitle(body: string, title: string) {
  const match = body.match(/^(\s*)#\s+([^\n]+)\n?/)

  if (!match) {
    return body
  }

  const heading = normalizeHeadingText(match[2])
  const pageTitle = normalizeHeadingText(title)

  if (heading === pageTitle || heading.includes(pageTitle) || pageTitle.includes(heading)) {
    return body.slice(match[0].length).replace(/^\n+/, '')
  }

  return body
}

export function MarkdownBody({ page, pages }: { page: SitePage; pages: SitePage[] }) {
  const body = stripLeadingDuplicateTitle(page.body, page.title)

  return (
    <div className="site-doc-prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: createHeading(2, 'mt-10 scroll-mt-28 text-3xl font-black tracking-tight text-white first:mt-0'),
          h2: createHeading(2, 'mt-12 scroll-mt-28 border-t border-white/8 pt-8 text-2xl font-black tracking-tight text-white'),
          h3: createHeading(3, 'mt-9 scroll-mt-28 text-xl font-bold text-white'),
          h4: createHeading(4, 'mt-7 scroll-mt-28 text-lg font-semibold text-white'),
          h5: createHeading(5, 'mt-6 scroll-mt-28 text-base font-semibold text-white'),
          h6: createHeading(6, 'mt-6 scroll-mt-28 text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary'),
          p: ({ children }) => {
            if (containsBlockImageFigure(children)) {
              return <>{children}</>
            }

            return <p className="my-4 text-base leading-8 text-text-secondary">{children}</p>
          },
          a: ({ href = '', children }) => {
            const resolved = resolveMarkdownHref(href, page, pages)
            const external = resolved ? isExternalMarkdownHref(resolved) : false

            if (!resolved) {
              return <span>{children}</span>
            }

            if (resolved.startsWith('#')) {
              return (
                <a href={resolved} className="font-medium text-brand-primary underline decoration-white/10 underline-offset-4 transition hover:text-brand-hover">
                  {children}
                </a>
              )
            }

            if (!external && resolved.startsWith('/')) {
              return (
                <Link href={resolved} className="font-medium text-brand-primary underline decoration-white/10 underline-offset-4 transition hover:text-brand-hover">
                  {children}
                </Link>
              )
            }

            return (
              <a
                href={resolved}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-primary underline decoration-white/10 underline-offset-4 transition hover:text-brand-hover"
              >
                {children}
              </a>
            )
          },
          ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2 text-base leading-8 text-text-secondary">{children}</ul>,
          ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2 text-base leading-8 text-text-secondary">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-2xl border-l-4 border-brand-primary/70 bg-white/[0.03] px-5 py-4 text-base leading-8 text-text-secondary">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-white/8" />,
          code: ({ children, className, ...props }: any) => {
            const inline = !(className ?? '')

            if (inline) {
              return <code className="rounded bg-bg-code px-1.5 py-0.5 font-mono text-[0.95em] text-brand-primary">{children}</code>
            }

            return <code className={className} {...props}>{children}</code>
          },
          pre: ({ children }) => {
            const code = flattenText(children).replace(/\n$/, '')

            return <CopyableCodeBlock code={code}>{children}</CopyableCodeBlock>
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full border-collapse text-left text-sm leading-7 text-text-secondary">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.04] text-white">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-t border-white/10 align-top">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3">{children}</td>,
          img: ({ src = '', alt = '' }) => {
            if (typeof src !== 'string') {
              return null
            }

            const resolved = resolveMarkdownImage(src, page)

            if (!resolved) {
              return null
            }

            return (
              <figure className="my-8 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element -- markdown images resolve to external/raw content URLs at runtime */}
                <img src={resolved} alt={alt} className="h-auto w-full" loading="lazy" />
                {alt ? <figcaption className="border-t border-white/10 px-4 py-3 text-xs leading-6 text-text-tertiary">{alt}</figcaption> : null}
              </figure>
            )
          },
        }}
      >
        {body}
      </Markdown>
    </div>
  )
}
