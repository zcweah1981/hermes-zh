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
        className="flex items-center justify-center rounded-lg p-2 text-[#6484a9] hover:bg-white/[0.04] hover:text-[#eaf6ff] lg:w-48 xl:w-56 lg:justify-start lg:gap-2 lg:border lg:border-[#132c4a] lg:bg-[#07111F] lg:px-4 lg:py-2 lg:shadow-sm"
        aria-label="搜索内容"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 lg:h-4 lg:w-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span className="hidden text-sm font-medium lg:inline-block">搜索...</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-full max-w-[600px] overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl flex flex-col">
            
            {/* 1. Search Input Field (Top Section) */}
            <div className="flex items-center px-3 py-2 border-b border-[#30363d] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#8b949e] mr-3 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                className="flex-1 h-8 bg-transparent text-sm text-[#e6edf3] outline-none placeholder:text-[#8b949e]"
                placeholder="搜索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="rounded-sm p-0.5 text-[#8b949e] hover:bg-[#30363d] hover:text-[#e6edf3] ml-2 shrink-0 flex items-center justify-center bg-[#21262d] border border-[#30363d]"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[60vh]">
              {/* 2. Search Suggestions (Second Section) - Only show when there is a query */}
              {query.trim().length > 0 && (
                <div className="py-2 border-b border-[#30363d]">
                  <div className="flex items-center px-4 py-2 hover:bg-[#161b22] cursor-pointer group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#8b949e] mr-3 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span className="text-sm font-semibold text-[#e6edf3] flex-1">{query}</span>
                    <span className="text-xs text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity">搜索全站指南</span>
                  </div>
                  
                  {isPending ? (
                    <div className="px-4 py-2 text-xs text-[#8b949e]">搜索中...</div>
                  ) : results.length > 0 ? (
                    results.map((item, i) => {
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
                          className="flex items-center px-4 py-2 hover:bg-[#161b22] cursor-pointer group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#8b949e] mr-3 shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          <div className="flex items-center text-sm">
                            <span className="text-[#8b949e] mr-1">匹配:</span>
                            <span className="bg-[#1f242c] text-[#58a6ff] rounded px-1 font-mono text-[13px] mr-2">{item.title}</span>
                            <span className="text-[#e6edf3] font-semibold">{query}</span>
                          </div>
                          <span className="ml-auto text-xs text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity">跳转至内容</span>
                        </Link>
                      )
                    })
                  ) : query.trim().length >= 2 ? (
                    <div className="px-4 py-2 text-xs text-[#8b949e]">无匹配结果</div>
                  ) : null}
                </div>
              )}

              {/* Empty state / Prompt state */}
              {query.trim().length === 0 && (
                <div className="py-6 px-4 text-center text-sm text-[#8b949e]">
                  输入关键字开始搜索
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}
