import { useRef, useState } from 'react'
import { usePrimsStore, type PrimNodeHL, type PrimEdgeHL } from '@/store/primsStore'

const SVG_W = 560
const SVG_H = 430
const NODE_R = 22

const NODE_FILL: Record<PrimNodeHL, string> = {
  default: '#1c1530',
  start:   '#9b6fd4',
  inMST:   '#c9a0ff',
}
const NODE_STROKE: Record<PrimNodeHL, string> = {
  default: '#744cae',
  start:   '#d4aaff',
  inMST:   '#e8d5ff',
}
const TEXT_COLOR: Record<PrimNodeHL, string> = {
  default: '#f0eaf8',
  start:   '#ffffff',
  inMST:   '#1a0f2e',
}

function midpoint(fx: number, fy: number, tx: number, ty: number) {
  return { mx: (fx + tx) / 2, my: (fy + ty) / 2 }
}

export function PrimsVisualizer() {
  const { nodes, edges, mstWeight, mstEdgeCount, done, isAnimating, updateNodePosition } = usePrimsStore()
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

  function edgeColor(hl: PrimEdgeHL): string {
    switch (hl) {
      case 'mst':      return '#c9a0ff'
      case 'frontier': return '#744cae'
      default:         return '#2a1f3d'
    }
  }

  function edgeWidth(hl: PrimEdgeHL): number {
    switch (hl) {
      case 'mst':      return 3
      case 'frontier': return 1.5
      default:         return 1.5
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* MST weight display */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#6b4d8a]">
          MST edges: <span className="text-[#c9a0ff] font-bold">{mstEdgeCount}</span>
        </span>
        <span className="text-xs text-[#a78bde]">
          Total weight: <span className="text-[#c9a0ff] font-bold font-mono">{mstWeight}</span>
        </span>
        {done && <span className="text-xs text-[#c9a0ff] font-semibold">MST complete</span>}
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
          {edgeList.map(edge => {
            const from = nodes[edge.from]
            const to = nodes[edge.to]
            if (!from || !to) return null
            const hl = edge.highlight as PrimEdgeHL
            const color = edgeColor(hl)
            const width = edgeWidth(hl)
            const { mx, my } = midpoint(from.x, from.y, to.x, to.y)
            const isFrontier = hl === 'frontier'
            return (
              <g key={edge.id}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={isFrontier ? '6 4' : undefined}
                  strokeOpacity={hl === 'default' ? 0.4 : 1}
                  style={{ transition: 'stroke 0.25s, stroke-opacity 0.25s' }}
                />
                <text
                  x={mx} y={my - 7}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={10} fontWeight="700"
                  fill={hl === 'mst' ? '#c9a0ff' : hl === 'frontier' ? '#9b6fd4' : '#3d2d5a'}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.25s' }}
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
                style={{ transition: 'fill 0.25s, stroke 0.25s' }}
              />
              <text
                x={node.x} y={node.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight="600" fontFamily="monospace"
                fill={TEXT_COLOR[node.highlight]}
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.25s' }}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <Legend />
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 flex-wrap">
      {[
        { fill: '#1c1530', stroke: '#744cae', label: 'Default' },
        { fill: '#9b6fd4', stroke: '#d4aaff', label: 'Start node' },
        { fill: '#c9a0ff', stroke: '#e8d5ff', label: 'In MST' },
      ].map(({ fill, stroke, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2" style={{ background: fill, borderColor: stroke }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-0.5 rounded" style={{ background: '#c9a0ff' }} />
        <span className="text-xs text-[#6b4d8a]">MST edge</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#744cae" strokeWidth="1.5" strokeDasharray="5 3" /></svg>
        <span className="text-xs text-[#6b4d8a]">Frontier</span>
      </div>
    </div>
  )
}
