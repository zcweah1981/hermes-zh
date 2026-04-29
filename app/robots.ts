import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    host: 'hermes-zh.com',
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
