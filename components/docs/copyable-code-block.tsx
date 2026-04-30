'use client'

import { useState } from 'react'

export function CopyableCodeBlock({ children, code }: { children: React.ReactNode; code: string }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-2xl border border-white/10 bg-bg-code">
      <button
        type="button"
        onClick={copyCode}
        className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-text-secondary opacity-100 transition hover:border-border-strong hover:text-text-primary md:opacity-0 md:group-hover:opacity-100"
      >
        {copied ? '已复制' : '复制'}
      </button>
      <pre className="m-0 overflow-x-auto p-4 pr-20 text-sm leading-7 text-stone-200">
        {children}
      </pre>
    </div>
  )
}
