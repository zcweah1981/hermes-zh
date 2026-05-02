"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"

type SearchResult = {
  type: string
  slug: string
  title: string
  text?: string
  id?: string
}

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      return
    }
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setResults(data)
        }
      } catch (err) {
        console.error(err)
      }
    })
  }, [query])

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span className="hidden sm:inline-block">搜索内容...</span>
        <span className="inline-block sm:hidden">搜索</span>
        <kbd className="ml-auto hidden rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-500 sm:inline-block">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <div className="flex items-center border-b border-neutral-800 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-neutral-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                className="flex h-14 w-full bg-transparent px-4 py-3 text-base text-neutral-200 outline-none placeholder:text-neutral-500"
                placeholder="搜索问题、方案或文档..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button onClick={() => setOpen(false)} className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
               {isPending ? (
                 <div className="p-4 text-center text-sm text-neutral-500">搜索中...</div>
               ) : results.length > 0 ? (
                 <div className="flex flex-col gap-1">
                   {results.map((item, i) => {
                     let href = item.slug
                     if (item.type === 'page') {
                        href = `/docs/${item.slug.replace(/\.md$/, '')}`
                     } else if (item.type === 'heading' || item.type === 'content') {
                        href = `/docs/${item.slug.replace(/\.md$/, '')}${item.id ? '#' + item.id : ''}`
                     } else if (item.type === 'pack') {
                        href = `/packs/${item.slug}`
                     } else {
                        href = `/${item.slug}`
                     }
                     href = href.replace(/([^:])\/{2,}/g, '$1/')

                     return (
                       <Link 
                         key={`${item.slug}-${item.id || ''}-${i}`}
                         href={href}
                         onClick={() => setOpen(false)}
                         className="flex flex-col rounded-lg p-3 hover:bg-neutral-800/50"
                       >
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-medium uppercase text-brand-primary">{item.type}</span>
                           <span className="text-sm font-medium text-neutral-200">{item.title}</span>
                         </div>
                         {item.text && (
                           <div className="mt-1 line-clamp-2 text-sm text-neutral-400">
                             {item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text}
                           </div>
                         )}
                       </Link>
                     )
                   })}
                 </div>
               ) : query.trim().length >= 2 ? (
                 <div className="p-4 text-center text-sm text-neutral-500">无匹配结果</div>
               ) : (
                 <div className="p-4 text-center text-sm text-neutral-500">输入至少2个字符开始搜索</div>
               )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
