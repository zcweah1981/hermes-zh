'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const CapabilityConnectorLayer = dynamic(
  () => import('@/components/marketing/capability-connectors').then((mod) => mod.CapabilityConnectorLayer),
  { ssr: false },
)

export function LazyCapabilityConnectorLayer() {
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (shouldLoad) return undefined

    const sentinel = sentinelRef.current
    if (!sentinel || !('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <>
      <span ref={sentinelRef} aria-hidden="true" className="sr-only" />
      {shouldLoad ? <CapabilityConnectorLayer /> : null}
    </>
  )
}
