import { useRef, useState } from 'react'
import { useKruskalsStore, type KruskalNodeHL, type KruskalEdgeHL } from '@/store/kruskalsStore'

const SVG_W = 380
const SVG_H = 430
const NODE_R = 22

const NODE_FILL: Record<KruskalNodeHL, string> = {
  default: '#1c1530',
  active:  '#9b6fd4',
}
const NODE_STROKE: Record<KruskalNodeHL, string> = {
  default: '#744cae',
  active:  '#d4aaff',
}
const TEXT_COLOR: Record<KruskalNodeHL, string> = {
  default: '#f0eaf8',
  active:  '#ffffff',
}

function edgeColor(hl: KruskalEdgeHL): string {
  switch (hl) {
    case 'current':  return '#9b6fd4'
    case 'accepted': return '#c9a0ff'
    case 'rejected': return '#ff6b8a'
    default:         return '#2a1f3d'
  }
}

function edgeWidth(hl: KruskalEdgeHL): number {
  switch (hl) {
    case 'accepted': return 3
    case 'current':  return 2.5
    case 'rejected': return 2
    default:         return 1.5
  }
}

export function KruskalsVisualizer() {
  const { nodes, edges, sortedEdges, mstWeight, mstEdgeCount, done, isAnimating, updateNodePosition } =
    useKruskalsStore()
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#6b4d8a]">
          MST edges: <span className="text-[#c9a0ff] font-bold">{mstEdgeCount}</span>
        </span>
        <span className="text-xs text-[#a78bde]">
          Total weight: <span className="text-[#c9a0ff] font-bold font-mono">{mstWeight}</span>
        </span>
        {done && <span className="text-xs text-[#c9a0ff] font-semibold">MST complete</span>}
      </div>

      <div className="flex gap-4">
        {/* Graph SVG */}
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden flex-shrink-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W}
            style={{ display: 'block', cursor: dragging ? 'grabbing' : 'default', maxWidth: '100%' }}
            onMouseMove={onMouseMove}
            onMouseUp={() => setDragging(null)}
            onMouseLeave={() => setDragging(null)}
          >
            {edgeList.map(edge => {
              const from = nodes[edge.from]
              const to = nodes[edge.to]
              if (!from || !to) return null
              const hl = edge.highlight as KruskalEdgeHL
              const color = edgeColor(hl)
              const width = edgeWidth(hl)
              const mx = (from.x + to.x) / 2
              const my = (from.y + to.y) / 2
              return (
                <g key={edge.id}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={color}
                    strokeWidth={width}
                    strokeOpacity={hl === 'default' ? 0.4 : 1}
                    style={{ transition: 'stroke 0.2s, stroke-opacity 0.2s' }}
                  />
                  <text
                    x={mx} y={my - 7}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={10} fontWeight="700"
                    fill={hl === 'accepted' ? '#c9a0ff' : hl === 'current' ? '#9b6fd4' : hl === 'rejected' ? '#ff6b8a' : '#3d2d5a'}
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
                  strokeWidth={node.highlight === 'active' ? 3 : 2}
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

        {/* Sorted edge list */}
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-3 flex-1 min-w-0">
          <div className="text-xs font-semibold text-[#a78bde] mb-2">Edges (sorted by weight)</div>
          <div className="space-y-1 overflow-y-auto max-h-[400px]">
            {sortedEdges.length === 0
              ? <span className="text-xs text-[#3d2d5a]">press Run to start</span>
              : sortedEdges.map((item, idx) => {
                const bgColor = item.status === 'accepted'
                  ? '#c9a0ff18'
                  : item.status === 'rejected'
                  ? '#ff6b8a18'
                  : item.status === 'current'
                  ? '#9b6fd418'
                  : 'transparent'
                const borderColor = item.status === 'accepted'
                  ? '#c9a0ff44'
                  : item.status === 'rejected'
                  ? '#ff6b8a44'
                  : item.status === 'current'
                  ? '#9b6fd444'
                  : '#2a1f3d'
                const textColor = item.status === 'accepted'
                  ? '#c9a0ff'
                  : item.status === 'rejected'
                  ? '#ff6b8a'
                  : item.status === 'current'
                  ? '#d4aaff'
                  : '#6b4d8a'
                const badge = item.status === 'accepted'
                  ? '✓'
                  : item.status === 'rejected'
                  ? '✗'
                  : item.status === 'current'
                  ? '→'
                  : `${idx + 1}`
                return (
                  <div
                    key={item.eid}
                    className="flex items-center gap-2 px-2 py-1.5 rounded border text-xs"
                    style={{
                      background: bgColor,
                      borderColor,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span className="w-5 text-center font-bold font-mono" style={{ color: textColor }}>
                      {badge}
                    </span>
                    <span className="font-mono" style={{ color: textColor }}>
                      {item.fromLabel}–{item.toLabel}
                    </span>
                    <span className="ml-auto font-mono font-bold" style={{ color: textColor }}>
                      {item.weight}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      <Legend />
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 flex-wrap">
      {[
        { color: '#c9a0ff', label: 'Accepted (MST)' },
        { color: '#ff6b8a', label: 'Rejected (cycle)' },
        { color: '#9b6fd4', label: 'Considering' },
        { color: '#2a1f3d', label: 'Pending' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 rounded" style={{ background: color }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
