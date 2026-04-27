import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
