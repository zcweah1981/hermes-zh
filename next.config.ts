import type { NextConfig } from 'next'

const LEGACY_REDIRECTS = [
  { source: '/docs/quickstart', destination: '/docs/start' },
  { source: '/docs/model-provider', destination: '/docs/china' },
  { source: '/docs/starter', destination: '/packs' },
  { source: '/docs/examples', destination: '/docs/solutions' },
  { source: '/docs/faq', destination: '/docs/issues' },
  { source: '/docs/00-文档总览', destination: '/docs/docs-overview' },
  { source: '/docs/00-%E6%96%87%E6%A1%A3%E6%80%BB%E8%A7%88', destination: '/docs/docs-overview' },
  { source: '/docs/01-从这开始', destination: '/docs/start' },
  { source: '/docs/01-%E4%BB%8E%E8%BF%99%E5%BC%80%E5%A7%8B', destination: '/docs/start' },
  { source: '/docs/02-现成方案', destination: '/docs/solutions' },
  { source: '/docs/02-%E7%8E%B0%E6%88%90%E6%96%B9%E6%A1%88', destination: '/docs/solutions' },
  { source: '/docs/03-国内落地', destination: '/docs/china' },
  { source: '/docs/03-%E5%9B%BD%E5%86%85%E8%90%BD%E5%9C%B0', destination: '/docs/china' },
  { source: '/docs/04-从OpenClaw过来', destination: '/docs/openclaw' },
  { source: '/docs/04-%E4%BB%8EOpenClaw%E8%BF%87%E6%9D%A5', destination: '/docs/openclaw' },
  { source: '/docs/05-遇到问题', destination: '/docs/issues' },
  { source: '/docs/05-%E9%81%87%E5%88%B0%E9%97%AE%E9%A2%98', destination: '/docs/issues' },
  { source: '/docs/06-reference', destination: '/docs/reference' },
  { source: '/docs/packs', destination: '/packs' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return LEGACY_REDIRECTS.map((redirect) => ({
      ...redirect,
      permanent: true,
    }))
  },
}

export default nextConfig
