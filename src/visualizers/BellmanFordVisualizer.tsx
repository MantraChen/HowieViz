import { useRef, useState } from 'react'
import { useBellmanFordStore, type BFNodeHL, type BFEdgeHL } from '@/store/bellmanFordStore'

const SVG_W = 560
const SVG_H = 430
const NODE_R = 22

const NODE_FILL: Record<BFNodeHL, string> = {
  default: '#1c1530',
  current: '#9b6fd4',
  updated: '#c9a0ff',
}
const NODE_STROKE: Record<BFNodeHL, string> = {
  default: '#744cae',
  current: '#d4aaff',
  updated: '#e8d5ff',
}
const TEXT_COLOR: Record<BFNodeHL, string> = {
  default: '#f0eaf8',
  current: '#ffffff',
  updated: '#1a0f2e',
}
const EDGE_COLOR: Record<BFEdgeHL, string> = {
  default: '#2a1f3d',
  checking: '#8b5fa8',
  relaxed: '#c9a0ff',
  negative: '#ff6b8a',
}

function edgePoints(fx: number, fy: number, tx: number, ty: number) {
  const dx = tx - fx
  const dy = ty - fy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return { x1: fx, y1: fy, x2: tx, y2: ty }
  const ux = dx / len
  const uy = dy / len
  return {
    x1: fx + ux * NODE_R,
    y1: fy + uy * NODE_R,
    x2: tx - ux * (NODE_R + 6),
    y2: ty - uy * (NODE_R + 6),
  }
}

export function BellmanFordVisualizer() {
  const {
    nodes, edges, distances, iteration, totalIterations,
    negativeCycle, done, isAnimating, updateNodePosition,
  } = useBellmanFordStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)

  const nodeList = Object.values(nodes)
  const edgeList = Object.values(edges)

  function getSVGPoint(e: React.MouseEvent) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (SVG_W / rect.width),
      y: (e.clientY - rect.top) * (SVG_H / rect.height),
    }
  }

  function onNodeDown(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (isAnimating) return
    const pt = getSVGPoint(e)
    setDragging({ id, ox: pt.x - nodes[id].x, oy: pt.y - nodes[id].y })
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragging) return
    const pt = getSVGPoint(e)
    updateNodePosition(
      dragging.id,
      Math.max(NODE_R, Math.min(SVG_W - NODE_R, pt.x - dragging.ox)),
      Math.max(NODE_R, Math.min(SVG_H - NODE_R, pt.y - dragging.oy)),
    )
  }

  const allLabels = Object.values(nodes)
    .map(n => n.label)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const iterLabel = iteration === 0
    ? 'Not started'
    : `Iteration ${Math.min(iteration, totalIterations)} of ${totalIterations}`

  return (
    <div className="flex flex-col gap-4">
      {/* Iteration counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono text-[#a78bde]">{iterLabel}</span>
        {negativeCycle && (
          <span className="text-xs font-bold" style={{ color: '#ff6b8a' }}>
            Negative cycle detected!
          </span>
        )}
        {done && !negativeCycle && (
          <span className="text-xs text-[#c9a0ff] font-semibold">Complete</span>
        )}
      </div>

      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block', cursor: dragging ? 'grabbing' : 'default' }}
          onMouseMove={onMouseMove}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          <defs>
            {(['default', 'checking', 'relaxed', 'negative'] as BFEdgeHL[]).map(hl => (
              <marker
                key={hl}
                id={`arrow-bf-${hl}`}
                markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"
              >
                <path d="M 0 0 L 7 3.5 L 0 7 z" fill={EDGE_COLOR[hl]} />
              </marker>
            ))}
          </defs>

          {edgeList.map(edge => {
            const from = nodes[edge.from]
            const to = nodes[edge.to]
            if (!from || !to) return null
            const { x1, y1, x2, y2 } = edgePoints(from.x, from.y, to.x, to.y)
            const color = EDGE_COLOR[edge.highlight]
            const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.12
            const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.12
            return (
              <g key={edge.id}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={edge.highlight !== 'default' ? 2.5 : 1.5}
                  markerEnd={`url(#arrow-bf-${edge.highlight})`}
                  style={{ transition: 'stroke 0.2s' }}
                />
                <text
                  x={mx} y={my}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={10} fontWeight="700"
                  fill={edge.highlight !== 'default' ? color : '#6b4d8a'}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.2s' }}
                >
                  {edge.weight}
                </text>
              </g>
            )
          })}

          {nodeList.map(node => (
            <g
              key={node.id}
              onMouseDown={e => onNodeDown(e, node.id)}
              style={{ cursor: isAnimating ? 'default' : 'grab' }}
            >
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={NODE_FILL[node.highlight]}
                stroke={NODE_STROKE[node.highlight]}
                strokeWidth={node.highlight !== 'default' ? 3 : 2}
                style={{ transition: 'fill 0.2s, stroke 0.2s' }}
              />
              <text
                x={node.x} y={node.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight="600" fontFamily="monospace"
                fill={TEXT_COLOR[node.highlight]}
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.2s' }}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Distance table */}
      {allLabels.length > 0 && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-3">
          <span className="text-xs font-semibold text-[#a78bde]">Distances from start</span>
          <div className="flex gap-2 flex-wrap mt-2">
            {allLabels.map(label => {
              const d = distances[label]
              const isUpdated = Object.values(nodes).find(n => n.label === label)?.highlight === 'updated'
              return (
                <div
                  key={label}
                  className="flex flex-col items-center px-3 py-1.5 rounded-md border"
                  style={{
                    background: isUpdated ? '#9b6fd4' : '#1c1530',
                    borderColor: isUpdated ? '#d4aaff' : '#2a1f3d',
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="text-xs font-semibold font-mono" style={{ color: isUpdated ? '#fff' : '#f0eaf8' }}>
                    {label}
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: isUpdated ? '#fff' : '#6b4d8a' }}>
                    {d === undefined || d === Infinity ? '∞' : d}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Legend />
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 flex-wrap">
      {[
        { fill: '#1c1530', stroke: '#744cae', label: 'Unvisited' },
        { fill: '#9b6fd4', stroke: '#d4aaff', label: 'Checking' },
        { fill: '#c9a0ff', stroke: '#e8d5ff', label: 'Updated' },
      ].map(({ fill, stroke, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2" style={{ background: fill, borderColor: stroke }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-0.5 rounded" style={{ background: '#ff6b8a' }} />
        <span className="text-xs text-[#6b4d8a]">Negative cycle</span>
      </div>
    </div>
  )
}
