'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const CapabilityConnectorLayer = dynamic(
  () => import('@/components/marketing/capability-connectors').then((mod) => mod.CapabilityConnectorLayer),
  { ssr: false },
)

type LazyCapabilityConnectorLayerProps = {
  deferUntilIdle?: boolean
}

export function LazyCapabilityConnectorLayer({ deferUntilIdle = false }: LazyCapabilityConnectorLayerProps) {
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (shouldLoad) return undefined

    const sentinel = sentinelRef.current
    if (!sentinel || !('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return undefined
    }

    let idleHandle: number | null = null
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null

    const loadConnectorLayer = () => setShouldLoad(true)
    const scheduleConnectorLayer = () => {
      if (!deferUntilIdle) {
        loadConnectorLayer()
        return
      }

      if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(loadConnectorLayer, { timeout: 1600 })
        return
      }

      timeoutHandle = setTimeout(loadConnectorLayer, 1600)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          scheduleConnectorLayer()
          observer.disconnect()
        }
      },
      { rootMargin: deferUntilIdle ? '0px' : '600px 0px' },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      if (idleHandle !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle)
      if (timeoutHandle !== null) clearTimeout(timeoutHandle)
    }
  }, [deferUntilIdle, shouldLoad])

  return (
    <>
      <span ref={sentinelRef} aria-hidden="true" className="sr-only" />
      {shouldLoad ? <CapabilityConnectorLayer /> : null}
    </>
  )
}
