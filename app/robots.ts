import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site-config'

const SITEMAP_URL = `${SITE_URL}/sitemap.xml`

/**
 * Custom robots configuration to fix Lighthouse "invalid directive" errors
 * while maintaining AI crawler restrictions and standard SEO compliance.
 *
 * NOTE: Cloudflare's "Content-Signal" and "Managed robots.txt" often inject
 * non-standard directives that cause Lighthouse SEO audits to fail.
 * This implementation explicitly covers major AI bots to achieve the same goal
 * via standard 'User-agent' + 'Disallow' syntax.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 1. General SEO: Allow all standard search engines
      {
        userAgent: '*',
        allow: '/',
      },
      // 2. AI & LLM Crawlers: Explicitly block training/scraping bots
      // This achieves the same goal as Cloudflare's 'ai-train=no' via standard REP
      {
        userAgent: [
          'GPTBot',             // OpenAI
          'ClaudeBot',          // Anthropic
          'Google-Extended',    // Google Gemini/Vertex training
          'Amazonbot',          // Amazon
          'Applebot-Extended',  // Apple
          'CCBot',              // Common Crawl
          'Bytespider',         // ByteDance (Lark/TikTok)
          'meta-externalagent', // Meta
          'cohere-ai',          // Cohere
          'Diffbot',
          'Omgilibot',
          'PerplexityBot',
          'YouBot',
        ],
        disallow: '/',
      },
    ],
    host: 'hermes-zh.com',
    sitemap: SITEMAP_URL,
  }
}
