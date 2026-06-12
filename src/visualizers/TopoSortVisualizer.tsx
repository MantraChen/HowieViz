import { useRef, useState } from 'react'
import { useTopoSortStore, type TopoNodeHL, type TopoEdgeHL } from '@/store/topoSortStore'

const SVG_W = 560
const SVG_H = 430
const NODE_R = 22

const NODE_FILL: Record<TopoNodeHL, string> = {
  default:    '#1c1530',
  inQueue:    '#3d2d5a',
  processing: '#9b6fd4',
  done:       '#c9a0ff',
}
const NODE_STROKE: Record<TopoNodeHL, string> = {
  default:    '#744cae',
  inQueue:    '#9b6fd4',
  processing: '#d4aaff',
  done:       '#e8d5ff',
}
const TEXT_COLOR: Record<TopoNodeHL, string> = {
  default:    '#f0eaf8',
  inQueue:    '#e8d5ff',
  processing: '#ffffff',
  done:       '#1a0f2e',
}
const EDGE_COLOR: Record<TopoEdgeHL, string> = {
  default: '#2a1f3d',
  active:  '#c9a0ff',
  removed: '#1a1428',
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

export function TopoSortVisualizer() {
  const {
    nodes, edges, queue, result, cycleDetected, done, isAnimating, updateNodePosition,
  } = useTopoSortStore()
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
            {(['default', 'active', 'removed'] as TopoEdgeHL[]).map(hl => (
              <marker
                key={hl}
                id={`arrow-topo-${hl}`}
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
            return (
              <g key={edge.id}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={edge.highlight === 'active' ? 2.5 : 1.5}
                  strokeOpacity={edge.highlight === 'removed' ? 0.3 : 1}
                  markerEnd={`url(#arrow-topo-${edge.highlight})`}
                  style={{ transition: 'stroke 0.2s, opacity 0.3s' }}
                />
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
              {/* In-degree badge */}
              <circle
                cx={node.x + NODE_R - 2} cy={node.y - NODE_R + 2} r={9}
                fill="#0f0b17"
                stroke={node.inDegree === 0 ? '#c9a0ff' : '#2a1f3d'}
                strokeWidth={1.5}
              />
              <text
                x={node.x + NODE_R - 2} y={node.y - NODE_R + 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize={8} fontWeight="700" fontFamily="monospace"
                fill={node.inDegree === 0 ? '#c9a0ff' : '#6b4d8a'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.inDegree}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Queue & Result */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-3">
          <div className="text-xs font-semibold text-[#a78bde] mb-2">Queue (in-degree = 0)</div>
          {queue.length === 0
            ? <span className="text-xs text-[#3d2d5a]">{done ? 'empty' : 'not started'}</span>
            : (
              <div className="flex gap-1 flex-wrap">
                {queue.map((label, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded text-xs font-mono font-bold"
                    style={{ background: '#3d2d5a', color: '#c9a0ff' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
        </div>

        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-3">
          <div className="text-xs font-semibold text-[#a78bde] mb-2">Topological Order</div>
          {cycleDetected
            ? <span className="text-xs font-bold" style={{ color: '#ff6b8a' }}>Cycle detected — no topological order</span>
            : result.length === 0
            ? <span className="text-xs text-[#3d2d5a]">not started</span>
            : (
              <div className="flex gap-1 items-center flex-wrap">
                {result.map((label, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span
                      className="px-2 py-1 rounded text-xs font-mono font-bold"
                      style={{ background: '#c9a0ff22', color: '#c9a0ff' }}
                    >
                      {label}
                    </span>
                    {i < result.length - 1 && (
                      <span className="text-xs text-[#6b4d8a]">→</span>
                    )}
                  </span>
                ))}
              </div>
            )}
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
        { fill: '#1c1530', stroke: '#744cae', label: 'Default' },
        { fill: '#3d2d5a', stroke: '#9b6fd4', label: 'In queue' },
        { fill: '#9b6fd4', stroke: '#d4aaff', label: 'Processing' },
        { fill: '#c9a0ff', stroke: '#e8d5ff', label: 'Done' },
      ].map(({ fill, stroke, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2" style={{ background: fill, borderColor: stroke }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold font-mono border"
          style={{ background: '#0f0b17', borderColor: '#c9a0ff', color: '#c9a0ff' }}
        >
          0
        </div>
        <span className="text-xs text-[#6b4d8a]">In-degree badge</span>
      </div>
    </div>
  )
}
