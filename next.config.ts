import type { NextConfig } from 'next'

const LEGACY_REDIRECTS = [
  { source: '/quick-start.html', destination: '/docs/start' },
  { source: '/models.html', destination: '/docs/china/models' },
  { source: '/team-flow.html', destination: '/docs/solutions' },
  { source: '/docs/quick-start', destination: '/docs/start' },
  { source: '/docs/team-flow', destination: '/docs/solutions' },
  { source: '/docs/china/models.html', destination: '/docs/china/models' },
  { source: '/docs/quickstart', destination: '/docs/start' },
  { source: '/docs/model-provider', destination: '/docs/china' },
  { source: '/docs/starter', destination: '/packs' },
  { source: '/docs/examples', destination: '/docs/solutions' },
  { source: '/docs/faq', destination: '/docs/issues' },
  { source: '/docs/00-文档总览', destination: '/docs/docs-overview' },
  { source: '/docs/00-%E6%96%87%E6%A1%A3%E6%80%BB%E8%A7%88', destination: '/docs/docs-overview' },
  { source: '/docs/01-从这开始', destination: '/docs/start' },
  { source: '/docs/01-%E4%BB%8E%E8%BF%99%E5%BC%80%E5%A7%8B', destination: '/docs/start' },
  { source: '/docs/06-reference/:path*', destination: '/docs/reference/:path*' },
  { source: '/docs/06-reference', destination: '/docs/reference' },
  { source: '/docs/05-遇到问题/:path*', destination: '/docs/issues/:path*' },
  { source: '/docs/05-遇到问题', destination: '/docs/issues' },
  { source: '/docs/05-%E9%81%87%E5%88%B0%E9%97%AE%E9%A2%98/:path*', destination: '/docs/issues/:path*' },
  { source: '/docs/05-%E9%81%87%E5%88%B0%E9%97%AE%E9%A2%98', destination: '/docs/issues' },
  { source: '/docs/04-从OpenClaw过来/:path*', destination: '/docs/openclaw/:path*' },
  { source: '/docs/04-从OpenClaw过来', destination: '/docs/openclaw' },
  { source: '/docs/04-%E4%BB%8EOpenClaw%E8%BF%87%E6%9D%A5/:path*', destination: '/docs/openclaw/:path*' },
  { source: '/docs/04-%E4%BB%8EOpenClaw%E8%BF%87%E6%9D%A5', destination: '/docs/openclaw' },
  { source: '/docs/03-国内落地/:path*', destination: '/docs/china/:path*' },
  { source: '/docs/03-国内落地', destination: '/docs/china' },
  { source: '/docs/03-%E5%9B%BD%E5%86%85%E8%90%BD%E5%9C%B0/:path*', destination: '/docs/china/:path*' },
  { source: '/docs/03-%E5%9B%BD%E5%86%85%E8%90%BD%E5%9C%B0', destination: '/docs/china' },
  { source: '/docs/02-现成方案/:path*', destination: '/docs/solutions/:path*' },
  { source: '/docs/02-现成方案', destination: '/docs/solutions' },
  { source: '/docs/02-%E7%8E%B0%E6%88%90%E6%96%B9%E6%A1%88/:path*', destination: '/docs/solutions/:path*' },
  { source: '/docs/02-%E7%8E%B0%E6%88%90%E6%96%B9%E6%A1%88', destination: '/docs/solutions' },
  { source: '/docs/01-从这开始/:path*', destination: '/docs/start/:path*' },
  { source: '/docs/01-从这开始', destination: '/docs/start' },
  { source: '/docs/01-%E4%BB%8E%E8%BF%99%E5%BC%80%E5%A7%8B/:path*', destination: '/docs/start/:path*' },
  { source: '/docs/01-%E4%BB%8E%E8%BF%99%E5%BC%80%E5%A7%8B', destination: '/docs/start' },
  { source: '/docs/00-文档总览', destination: '/docs/docs-overview' },
  { source: '/docs/00-%E6%96%87%E6%A1%A3%E6%80%BB%E8%A7%88', destination: '/docs/docs-overview' },
  { source: '/docs/packs', destination: '/packs' },
  { source: '/solutions/:slug*', destination: '/docs/solutions/:slug*' },
  { source: '/officialsite', destination: '/' },
  { source: '/examples', destination: '/docs/solutions' },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((redirect) => ({
      ...redirect,
      permanent: true,
    }))
  },
}

export default nextConfig
