'use client'

import { useEffect, useState } from 'react'

type Point = { x: number; y: number }
type ConnectorLine = {
  id: 'top-left' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-right'
  target: 'left-top' | 'right-top' | 'left-middle' | 'right-middle' | 'left-bottom' | 'right-bottom'
  d: string
  dot: Point
}

type ConnectorSpec = {
  id: ConnectorLine['id']
  target: ConnectorLine['target']
  start: 'top' | 'middle' | 'bottom'
}

const connectorSpecs: ConnectorSpec[] = [
  { id: 'top-left', target: 'left-top', start: 'top' },
  { id: 'top-right', target: 'right-top', start: 'top' },
  { id: 'middle-left', target: 'left-middle', start: 'middle' },
  { id: 'middle-right', target: 'right-middle', start: 'middle' },
  { id: 'bottom-left', target: 'left-bottom', start: 'bottom' },
  { id: 'bottom-right', target: 'right-bottom', start: 'bottom' },
]

function mirrorPointX(point: Point, axisX: number): Point {
  return { x: axisX + (axisX - point.x), y: point.y }
}

function getCoreAnchors(rect: DOMRect, scopeRect: DOMRect) {
  const left = rect.left - scopeRect.left
  const top = rect.top - scopeRect.top
  const cx = left + rect.width / 2
  const cy = top + rect.height / 2
  const radius = Math.min(rect.width, rect.height) / 2
  const axisX = cx

  const leftStarts = {
    top: { x: cx - radius * 0.72, y: cy - radius * 0.55 },
    middle: { x: cx - radius, y: cy },
    bottom: { x: cx - radius * 0.72, y: cy + radius * 0.55 },
  }

  const rightStarts = {
    top: mirrorPointX(leftStarts.top, axisX),
    middle: mirrorPointX(leftStarts.middle, axisX),
    bottom: mirrorPointX(leftStarts.bottom, axisX),
  }

  return { leftStarts, rightStarts, axisX }
}

function getTargetPoint(target: ConnectorLine['target'], rect: DOMRect, scopeRect: DOMRect): Point {
  const isLeftTarget = target.startsWith('left-')
  const x = isLeftTarget ? rect.right - scopeRect.left : rect.left - scopeRect.left
  let y = rect.top - scopeRect.top + rect.height / 2

  if (target === 'left-top') y -= rect.height * 0.06
  if (target === 'left-bottom') y -= rect.height * 0.04

  return { x, y }
}

function createConnectorPath(start: Point, end: Point) {
  const distance = Math.abs(end.x - start.x)
  const dx = Math.max(48, distance * 0.46)
  const direction = end.x > start.x ? 1 : -1
  const c1x = start.x + dx * direction
  const c2x = end.x - dx * direction

  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${c1x.toFixed(1)} ${start.y.toFixed(1)} ${c2x.toFixed(1)} ${end.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`
}

function getStartPoint(spec: ConnectorSpec, anchors: ReturnType<typeof getCoreAnchors>) {
  return spec.target.startsWith('right-') ? anchors.rightStarts[spec.start] : anchors.leftStarts[spec.start]
}

function buildConnectorLines(scope: HTMLElement): { lines: ConnectorLine[]; width: number; height: number } | null {
  const scopeRect = scope.getBoundingClientRect()
  const core = scope.querySelector<HTMLElement>('[data-connector-node="core"]')
  if (!core || scopeRect.width <= 0 || scopeRect.height <= 0) return null

  const coreAnchors = getCoreAnchors(core.getBoundingClientRect(), scopeRect)
  const lines: ConnectorLine[] = []

  for (const spec of connectorSpecs) {
    const target = scope.querySelector<HTMLElement>(`[data-connector-node="${spec.target}"]`)
    if (!target) return null

    const start = getStartPoint(spec, coreAnchors)
    const dot = getTargetPoint(spec.target, target.getBoundingClientRect(), scopeRect)
    lines.push({ id: spec.id, target: spec.target, d: createConnectorPath(start, dot), dot })
  }

  return { lines, width: scopeRect.width, height: scopeRect.height }
}

export function CapabilityConnectorLayer() {
  const [state, setState] = useState<{ lines: ConnectorLine[]; width: number; height: number } | null>(null)

  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('[data-connector-scope="capability-infographic"]')
    if (!scope) return undefined

    let frame = 0
    const measure = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const nextState = buildConnectorLines(scope)
        if (nextState) setState(nextState)
      })
    }

    const observedNodes = [
      scope,
      ...Array.from(scope.querySelectorAll<HTMLElement>('[data-connector-node]')),
    ]
    const resizeObserver = new ResizeObserver(measure)
    observedNodes.forEach((node) => resizeObserver.observe(node))
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => undefined)
    measure()

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
      resizeObserver.disconnect()
    }
  }, [])

  if (!state) return null

  return (
    <svg
      className="site-capability-connectors"
      data-connector-layer="dom-anchor"
      viewBox={`0 0 ${state.width} ${state.height}`}
      aria-hidden="true"
    >
      {state.lines.map((line) => (
        <path key={line.id} data-connector-line={line.id} data-target={line.target} d={line.d} />
      ))}
      {state.lines.map((line) => (
        <circle key={`${line.id}-dot`} data-connector-dot={line.target} cx={line.dot.x} cy={line.dot.y} r="3.5" />
      ))}
    </svg>
  )
}
