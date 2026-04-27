import Link from 'next/link'

const navItems = [
  { href: '/start', label: '从这开始' },
  { href: '/solutions', label: '现成方案' },
  { href: '/china', label: '国内落地' },
  { href: '/reference', label: 'Reference' },
  { href: '/packs', label: 'Packs' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white shadow-glow">
            H
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Hermes Agent 中文站</p>
            <p className="text-xs text-muted">Landing + Docs 统一骨架</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
