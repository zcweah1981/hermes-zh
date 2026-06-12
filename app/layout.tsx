import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'

import { SiteJsonLd, buildOrganizationJsonLd, buildSoftwareApplicationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/json-ld'
import { buildCanonicalUrl } from '@/lib/seo/canonical'
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, absoluteOgImage } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

import './globals.css'

const CLOUDFLARE_WEB_ANALYTICS_TOKEN='b65310...baaa'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-N2Q0TXQDRZ'

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
      { url: '/hermes-logo.webp', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
  alternates: {
    canonical: buildCanonicalUrl('/'),
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
          href="/fonts/noto-serif-sc.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchpriority="high"
        />
        <link
          rel="preload"
          href="/fonts/noto-sans-sc.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchpriority="high"
        />
      </head>
      <body>
        <SiteJsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd(), buildSoftwareApplicationJsonLd()]} />
        <Script
          id="ga4-gtag-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
        <Script
          id="idle-script-loader"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var loaded = false;
  function loadScripts() {
    if (loaded) return;
    loaded = true;

    // Load GA4
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
    document.head.appendChild(ga);

    // Load Cloudflare Analytics
    var cf = document.createElement('script');
    cf.async = true;
    cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.setAttribute('data-cf-beacon', JSON.stringify({ token: '${CLOUDFLARE_WEB_ANALYTICS_TOKEN}' }));
    document.head.appendChild(cf);
  }

  // 1. Trigger on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
      setTimeout(loadScripts, 3000); // Wait bit more after idle
    });
  } else {
    window.setTimeout(loadScripts, 15000);
  }

  // 2. Trigger on user interaction
  var interactions = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
  interactions.forEach(function(event) {
    window.addEventListener(event, loadScripts, { once: true, passive: true });
  });
})();`,
          }}
        />
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
    if (typeof window.gtag === 'function') {
      window.gtag('event', detail.event, {
        event_label: detail.label,
        link_url: detail.destination,
        page_section: detail.section
      });
    }
  }, { capture: true });
})();`,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
