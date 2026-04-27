import type { ReactNode } from 'react'

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl shadow-black/30">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-3xl font-black text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  )
}
