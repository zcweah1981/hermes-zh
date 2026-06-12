'use client'

import { useEffect, useState } from 'react'

type Point = { x: number; y: number }
type ConnectorLineId = 'top-left' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-right'
type ConnectorTarget = 'left-top' | 'right-top' | 'left-middle' | 'right-middle' | 'left-bottom' | 'right-bottom'
type ConnectorLine = {
  id: ConnectorLineId
  target: ConnectorTarget
  d: string
  dot: Point
}

type ConnectorGeometry = {
  id: ConnectorLineId
  target: ConnectorTarget
  start: Point
  c1: Point
  c2: Point
  end: Point
  dot: Point
}

type ConnectorSpec = {
  id: ConnectorLineId
  target: ConnectorTarget
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

const connectorPairs = [
  {
    start: 'top',
    left: { id: 'top-left', target: 'left-top' },
    right: { id: 'top-right', target: 'right-top' },
  },
  {
    start: 'middle',
    left: { id: 'middle-left', target: 'left-middle' },
    right: { id: 'middle-right', target: 'right-middle' },
  },
  {
    start: 'bottom',
    left: { id: 'bottom-left', target: 'left-bottom' },
    right: { id: 'bottom-right', target: 'right-bottom' },
  },
] satisfies Array<{
  start: ConnectorSpec['start']
  left: { id: ConnectorLineId; target: ConnectorTarget }
  right: { id: ConnectorLineId; target: ConnectorTarget }
}>

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

function getTargetPoint(target: ConnectorTarget, rect: DOMRect, scopeRect: DOMRect): Point {
  const isLeftTarget = target.startsWith('left-')
  const x = isLeftTarget ? rect.right - scopeRect.left : rect.left - scopeRect.left
  let y = rect.top - scopeRect.top + rect.height / 2

  if (target === 'left-top') y -= rect.height * 0.06
  if (target === 'left-bottom') y -= rect.height * 0.04

  return { x, y }
}

function createConnectorGeometry(id: ConnectorLineId, target: ConnectorTarget, start: Point, end: Point): ConnectorGeometry {
  const distance = Math.abs(end.x - start.x)
  const dx = Math.max(48, distance * 0.46)
  const direction = end.x > start.x ? 1 : -1
  const c1 = { x: start.x + dx * direction, y: start.y }
  const c2 = { x: end.x - dx * direction, y: end.y }

  return { id, target, start, c1, c2, end, dot: end }
}

function serializeConnectorPath(line: ConnectorGeometry) {
  return `M ${line.start.x.toFixed(1)} ${line.start.y.toFixed(1)} C ${line.c1.x.toFixed(1)} ${line.c1.y.toFixed(1)} ${line.c2.x.toFixed(1)} ${line.c2.y.toFixed(1)} ${line.end.x.toFixed(1)} ${line.end.y.toFixed(1)}`
}

function toConnectorLine(line: ConnectorGeometry): ConnectorLine {
  return { id: line.id, target: line.target, d: serializeConnectorPath(line), dot: line.dot }
}

function mirrorLeftLineToRight(
  leftLine: ConnectorGeometry,
  axisX: number,
  id: ConnectorLineId,
  target: ConnectorTarget,
): ConnectorGeometry {
  return {
    id,
    target,
    start: mirrorPointX(leftLine.start, axisX),
    c1: mirrorPointX(leftLine.c1, axisX),
    c2: mirrorPointX(leftLine.c2, axisX),
    end: mirrorPointX(leftLine.end, axisX),
    dot: mirrorPointX(leftLine.dot, axisX),
  }
}

function getStartPoint(spec: ConnectorSpec, anchors: ReturnType<typeof getCoreAnchors>) {
  return spec.target.startsWith('right-') ? anchors.rightStarts[spec.start] : anchors.leftStarts[spec.start]
}

function buildConnectorLines(scope: HTMLElement): { lines: ConnectorLine[]; width: number; height: number } | null {
  const scopeRect = scope.getBoundingClientRect()
  const core = scope.querySelector<HTMLElement>('[data-connector-node="core"]')
  if (!core || scopeRect.width <= 0 || scopeRect.height <= 0) return null

  const coreAnchors = getCoreAnchors(core.getBoundingClientRect(), scopeRect)
  for (const spec of connectorSpecs) {
    if (!scope.querySelector<HTMLElement>(`[data-connector-node="${spec.target}"]`)) return null
  }

  const lines: ConnectorLine[] = []

  for (const pair of connectorPairs) {
    const leftTarget = scope.querySelector<HTMLElement>(`[data-connector-node="${pair.left.target}"]`)
    if (!leftTarget) return null

    const leftSpec: ConnectorSpec = { ...pair.left, start: pair.start }
    const leftStart = getStartPoint(leftSpec, coreAnchors)
    const leftEnd = getTargetPoint(pair.left.target, leftTarget.getBoundingClientRect(), scopeRect)
    const leftLine = createConnectorGeometry(pair.left.id, pair.left.target, leftStart, leftEnd)
    const rightLine = mirrorLeftLineToRight(leftLine, coreAnchors.axisX, pair.right.id, pair.right.target)

    lines.push(toConnectorLine(leftLine), toConnectorLine(rightLine))
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
