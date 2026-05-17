import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'

import { SiteJsonLd, buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/json-ld'
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, absoluteOgImage } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

import './globals.css'

const CLOUDFLARE_WEB_ANALYTICS_TOKEN = 'b653102bed904fb289cf6e3dd1f8baaa'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s｜${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
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
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: 'zh_CN',
    images: [{ url: absoluteOgImage(DEFAULT_OG_IMAGE), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteOgImage(DEFAULT_OG_IMAGE)],
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
      <head>
        <link
          rel="preload"
          href="/fonts/noto-sans-sc.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/noto-serif-sc.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SiteJsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd()]} />
        <Script
          id="hermes-analytics-events"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  function getAnalyticsDetail(element) {
    var event = element.dataset.analyticsEvent;
    if (!event) return null;
    return {
      event: event,
      label: element.dataset.analyticsLabel,
      destination: element.dataset.analyticsDestination,
      section: element.dataset.analyticsSection
    };
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;

    var analyticsTarget = target.closest('[data-analytics-event]');
    if (!(analyticsTarget instanceof HTMLElement)) return;

    var detail = getAnalyticsDetail(analyticsTarget);
    if (!detail) return;

    window.dispatchEvent(new CustomEvent('hermes:analytics', { detail: detail }));
  }, { capture: true });
})();`,
          }}
        />
        {children}
        <Analytics />
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_WEB_ANALYTICS_TOKEN })}
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
