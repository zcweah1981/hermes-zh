import type { ReactNode } from 'react'

type SectionCardProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
  density?: 'marketing' | 'docs'
  variant?: 'base' | 'interactive' | 'selected' | 'compact'
}

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
  density = 'marketing',
  variant = 'base',
}: SectionCardProps) {
  const isDocs = density === 'docs'
  const variantClass =
    variant === 'selected'
      ? 'site-section-card-selected'
      : variant === 'interactive'
        ? 'site-section-card-interactive'
        : ''
  const densityClass = isDocs ? 'p-6 md:p-8' : 'p-8 md:p-10'
  const shellClass = variant === 'compact' ? 'site-compact-card' : 'site-section-card'

  return (
    <section className={`${shellClass} ${variantClass} ${densityClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">{eyebrow}</p>
      <h2 className={`mt-4 ${isDocs ? 'text-2xl md:text-[30px]' : 'font-serif text-3xl md:text-[40px]'} font-bold leading-tight text-text-primary`}>
        {title}
      </h2>
      <p className={`mt-3 max-w-2xl ${isDocs ? 'text-sm leading-7' : 'text-base leading-8'} text-text-secondary`}>
        {description}
      </p>
      {children ? <div className={isDocs ? 'mt-5' : 'mt-7'}>{children}</div> : null}
    </section>
  )
}
