import Link from 'next/link'

export function SearchDialog() {
  return (
    <Link
      href="/search"
      data-search-trigger="true"
      className="flex items-center justify-center rounded-lg p-2 text-[#6484a9] hover:bg-white/[0.04] hover:text-[#eaf6ff] lg:w-48 xl:w-56 lg:justify-start lg:gap-2 lg:border lg:border-[#132c4a] lg:bg-[#07111F] lg:px-4 lg:py-2 lg:shadow-sm"
      aria-label="搜索内容"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 lg:h-4 lg:w-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <span className="hidden text-sm font-medium lg:inline-block">搜索...</span>
    </Link>
  )
}
