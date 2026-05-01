import type { Metadata } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site-config'

import './globals.css'

const CLOUDFLARE_WEB_ANALYTICS_TOKEN = 'b653102bed904fb289cf6e3dd1f8baaa'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/hermes-logo.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'baidu-site-verification': 'codeva-hwY05tbXV2',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_WEB_ANALYTICS_TOKEN })}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
