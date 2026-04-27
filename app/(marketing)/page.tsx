import Link from 'next/link'

import { Hero } from '@/components/marketing/hero'
import { SectionCard } from '@/components/ui/section-card'

const modules = [
  {
    href: '/start',
    title: '从这开始',
    description: '给第一次接触 Hermes 的用户一条最短学习主线。',
  },
  {
    href: '/solutions',
    title: '现成方案',
    description: '沉淀可直接上手的场景化方案与入口。',
  },
  {
    href: '/china',
    title: '国内落地',
    description: '围绕国产模型、常用平台与网络环境给出明确路径。',
  },
  {
    href: '/packs',
    title: 'Packs',
    description: '统一承接 pack 列表、安装、下载与关联文档。',
  },
]

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-20">
        <SectionCard
          eyebrow="MVP scope"
          title="统一设计系统下的 Landing + Docs 双模式"
          description="当前首页以营销分流为主，后续文档页和 packs 页将共享 token、卡片、导航和元数据生产逻辑。"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-1 hover:bg-white/[0.04]"
              >
                <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{module.description}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  )
}
