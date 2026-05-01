'use client'

import { useEffect } from 'react'

type AnalyticsDetail = {
  event: string
  label?: string
  destination?: string
  section?: string
}

function getAnalyticsDetail(element: HTMLElement): AnalyticsDetail | null {
  const event = element.dataset.analyticsEvent

  if (!event) {
    return null
  }

  return {
    event,
    label: element.dataset.analyticsLabel,
    destination: element.dataset.analyticsDestination,
    section: element.dataset.analyticsSection,
  }
}

export function AnalyticsEvents() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const analyticsTarget = target.closest('[data-analytics-event]')

      if (!(analyticsTarget instanceof HTMLElement)) {
        return
      }

      const detail = getAnalyticsDetail(analyticsTarget)

      if (!detail) {
        return
      }

      window.dispatchEvent(new CustomEvent('hermes:analytics', { detail }))
    }

    document.addEventListener('click', handleClick, { capture: true })

    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  return null
}
