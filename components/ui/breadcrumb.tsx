import Link from 'next/link'

export interface BreadcrumbItem {
  name: string
  url?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null

  return (
    <nav className="mb-6 flex items-center space-x-1 text-sm text-neutral-400" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <div key={`${item.name}-${index}`} className="flex items-center">
            {index > 0 && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-1 h-4 w-4 text-neutral-600"><path d="m9 18 6-6-6-6"/></svg>
            )}
            {item.url && !isLast ? (
              <Link href={item.url} className="hover:text-neutral-200 transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className={isLast ? "text-neutral-200 font-medium" : ""}>
                {item.name}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
