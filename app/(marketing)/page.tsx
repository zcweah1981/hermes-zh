import Link from 'next/link'

import { Hero } from '@/components/marketing/hero'
import { SectionCard } from '@/components/ui/section-card'

const modules = [
  {
    href: '/docs/start',
    title: '从这开始',
    description: '给第一次接触 Hermes 的用户一条最短学习主线。',
  },
  {
    href: '/docs/solutions',
    title: '现成方案',
    description: '沉淀可直接上手的场景化方案与入口。',
  },
  {
    href: '/docs/china',
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
      <div className="mx-auto flex max-w-site-marketing flex-col gap-8 px-6 pb-20">
        <SectionCard
          eyebrow="精选入口"
          title="按你的目标直接进入成熟内容"
          description="如果你已经知道自己要解决什么，可以从这里直接进入对应文档或 Packs。"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="site-section-card site-section-card-interactive p-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">入口</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{module.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{module.description}</p>
                <p className="mt-5 text-sm font-medium text-text-secondary">立即查看 →</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  )
}
