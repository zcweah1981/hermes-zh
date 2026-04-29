import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-canvas text-text-primary">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-shell-glow opacity-90" />
      <div className="site-grid-overlay pointer-events-none absolute inset-x-0 top-0 h-[320px] opacity-30" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
