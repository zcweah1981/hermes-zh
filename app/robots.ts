import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site-config'

const SITEMAP_URL = `${SITE_URL}/sitemap.xml` // Sitemap entry advertised in robots.txt; Allow all crawlers.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    host: 'hermes-zh.com',
    sitemap: SITEMAP_URL,
  }
}
