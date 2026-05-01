import Link from 'next/link'

const recoveryLinks = [
  { href: '/', label: '返回首页', description: '回到 Hermes Agent 中文站总入口。' },
  { href: '/docs/start', label: '从这开始', description: '按顺序完成快速上手和第一次互动。' },
  { href: '/docs/docs-overview', label: '文档总览', description: '查看全部文档主线与模块入口。' },
  { href: '/docs/solutions', label: '现成方案', description: '按内容、办公、开发场景选择可用方案。' },
  { href: '/packs', label: 'Packs', description: '浏览可安装、可下载的 Hermes Agent 方案包。' },
  { href: '/docs/issues', label: '问题排查', description: '按症状定位安装、模型、网关与工具问题。' },
]

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030812] px-6 py-16 text-white">
      <section className="mx-auto flex max-w-site-marketing flex-col gap-8">
        <div className="site-panel-docs p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-primary">404 / Not Found</p>
          <h1 className="mt-4 text-3xl font-black lg:text-5xl">页面没有找到</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary">
            这个地址可能已经移动、改名，或不是 Hermes Agent 中文站的正式入口。你可以从下面这些稳定路径继续浏览。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/docs/start" className="site-cta-primary px-5 py-3">
              从这开始
            </Link>
            <Link href="/docs/docs-overview" className="site-cta-secondary px-5 py-3">
              查看文档总览
            </Link>
          </div>
        </div>

        <nav aria-label="404 页面回流入口" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recoveryLinks.map((item) => (
            <Link key={item.href} href={item.href} className="site-card-interactive p-5">
              <span className="text-base font-bold text-white">{item.label}</span>
              <span className="mt-2 block text-sm leading-6 text-text-secondary">{item.description}</span>
            </Link>
          ))}
        </nav>
      </section>
    </main>
  )
}
