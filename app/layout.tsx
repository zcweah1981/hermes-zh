import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'

import { SiteJsonLd, buildOrganizationJsonLd, buildSoftwareApplicationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/json-ld'
import { buildCanonicalUrl } from '@/lib/seo/canonical'
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, absoluteOgImage } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

import './globals.css'

const CLOUDFLARE_WEB_ANALYTICS_TOKEN='b653102bed904fb289cf6e3dd1f8baaa'
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
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .site-hero-fullscreen {
                  min-height: calc(100vh - var(--site-header-height));
                  height: calc(100vh - var(--site-header-height));
                  contain-intrinsic-size: calc(100vh - var(--site-header-height));
                  background: #071021;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .site-hero-content {
                  position: relative;
                  z-index: 10;
                  box-sizing: border-box;
                  margin: 0 auto;
                  max-width: 56rem;
                  min-height: calc(100vh - var(--site-header-height));
                  height: calc(100vh - var(--site-header-height));
                  contain-intrinsic-size: calc(100vh - var(--site-header-height));
                  padding: 5rem 0;
                  text-align: center;
                }
                .site-hero-title {
                  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
                  font-size: clamp(2.25rem, 15.5vw, 3.5rem);
                  font-weight: 800;
                  line-height: 1.28;
                  min-height: calc(82px * 1.28 + 1.25rem);
                  contain-intrinsic-size: calc(82px * 1.28 + 1.25rem);
                  color: #fff;
                  background: linear-gradient(to bottom, #fff, #5ba7ff);
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  padding-bottom: 1.25rem;
                  overflow-wrap: anywhere;
                }
                @media (max-width: 640px) {
                  .site-hero-fullscreen {
                    min-height: calc(100svh - var(--site-header-height));
                    contain-intrinsic-size: calc(100svh - var(--site-header-height));
                  }
                  .site-hero-title {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: clamp(2rem, 13.5vw, 3.25rem);
                    line-height: 1.12;
                    min-height: auto;
                    contain-intrinsic-size: auto;
                  }
                }
                @media (min-width: 768px) {
                  .site-hero-content {
                    transform: translateY(-2rem);
                    padding: 6rem 0;
                  }
                  .site-hero-title {
                    font-size: 82px;
                    line-height: 1.28;
                    min-height: calc(82px * 1.28 + 1.25rem);
                    contain-intrinsic-size: calc(82px * 1.28 + 1.25rem);
                  }
                }
                @media (min-width: 1280px) {
                  .site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"] {
                    display: grid;
                    grid-template-columns: 280px minmax(0, 1fr) 250px;
                    grid-auto-rows: minmax(0, auto);
                    min-height: 1620px;
                    contain: layout paint;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  }
                  .site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"],
                  .site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"] * {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                  }
                  body:has(.site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"]) .site-frame,
                  body:has(.site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"]) .site-frame * {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                  }
                  body:has(.site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"]) .site-frame > div {
                    min-height: 80px;
                  }
                  body:has(.site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"]) main.flex-1 {
                    min-height: 1620px;
                    contain: layout paint;
                  }
                  .site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"] > aside,
                  .site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"] > article {
                    contain: layout paint;
                    min-height: 720px;
                  }
                }
                .site-doc-header h1 {
                  content-visibility: auto;
                  contain-intrinsic-size: 40px 100%;
                }
              `,
            }}
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                [data-analytics-event="nav_start_click"] {
                  content-visibility: auto;
                  contain-intrinsic-size: 1px 1px;
                }
              `,
            }}
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
          id="ga4-idle-loader"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var loaded = false;
  function loadGtag() {
    if (loaded) return;
    loaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
    document.head.appendChild(script);
  }

  window.setTimeout(loadGtag, 12000);
  window.addEventListener('pointerdown', loadGtag, { once: true, passive: true });
  window.addEventListener('keydown', loadGtag, { once: true });
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
