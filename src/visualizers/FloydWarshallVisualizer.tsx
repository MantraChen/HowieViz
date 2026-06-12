import { useRef, useState } from 'react'
import { useFloydWarshallStore, type FWNodeHL, type FWCellHL } from '@/store/floydWarshallStore'

const SVG_W = 300
const SVG_H = 300
const NODE_R = 20

const NODE_FILL: Record<FWNodeHL, string> = {
  default: '#1c1530',
  intermediate: '#9b6fd4',
  source: '#3d2d5a',
  target: '#3d2d5a',
}
const NODE_STROKE: Record<FWNodeHL, string> = {
  default: '#744cae',
  intermediate: '#d4aaff',
  source: '#c9a0ff',
  target: '#c9a0ff',
}
const TEXT_COLOR: Record<FWNodeHL, string> = {
  default: '#f0eaf8',
  intermediate: '#ffffff',
  source: '#e8d5ff',
  target: '#e8d5ff',
}
const CELL_STYLE: Record<FWCellHL, { bg: string; border: string; text: string }> = {
  default:  { bg: '#1a1428', border: '#2a1f3d', text: '#a78bde' },
  active:   { bg: '#9b6fd4', border: '#d4aaff', text: '#ffffff' },
  updated:  { bg: '#c9a0ff', border: '#e8d5ff', text: '#1a0f2e' },
  diagonal: { bg: '#110d1e', border: '#1e1630', text: '#3d2d5a' },
}

function edgePoints(fx: number, fy: number, tx: number, ty: number, r: number) {
  const dx = tx - fx
  const dy = ty - fy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return { x1: fx, y1: fy, x2: tx, y2: ty }
  const ux = dx / len
  const uy = dy / len
  return {
    x1: fx + ux * r,
    y1: fy + uy * r,
    x2: tx - ux * (r + 5),
    y2: ty - uy * (r + 5),
  }
}

export function FloydWarshallVisualizer() {
  const { nodes, edges, nodeOrder, dist, cellHL, k, i, j, nodeCount, done, isAnimating, updateNodePosition } =
    useFloydWarshallStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)

  const nodeList = Object.values(nodes)
  const edgeList = Object.values(edges)
  const labels = nodeOrder.map(id => nodes[id]?.label ?? '')

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

  const kLabel = k >= 0 && k < nodeCount ? labels[k] : '—'
  const iLabel = i >= 0 && i < nodeCount ? labels[i] : '—'
  const jLabel = j >= 0 && j < nodeCount ? labels[j] : '—'

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      <div className="flex items-center gap-3 px-1 text-xs font-mono">
        {k >= 0 && (
          <>
            <span className="text-[#a78bde]">k=<span style={{ color: '#9b6fd4', fontWeight: 700 }}>{kLabel}</span></span>
            {i >= 0 && <span className="text-[#a78bde]">i=<span style={{ color: '#c9a0ff' }}>{iLabel}</span></span>}
            {j >= 0 && <span className="text-[#a78bde]">j=<span style={{ color: '#c9a0ff' }}>{jLabel}</span></span>}
          </>
        )}
        {done && <span className="text-[#c9a0ff] font-semibold">All-pairs shortest paths computed</span>}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Graph */}
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
            <defs>
              <marker id="arrow-fw-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#2a1f3d" />
              </marker>
              <marker id="arrow-fw-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#9b6fd4" />
              </marker>
            </defs>

            {edgeList.map(edge => {
              const from = nodes[edge.from]
              const to = nodes[edge.to]
              if (!from || !to) return null
              const { x1, y1, x2, y2 } = edgePoints(from.x, from.y, to.x, to.y, NODE_R)
              const isActive = edge.highlight === 'active'
              const color = isActive ? '#9b6fd4' : '#2a1f3d'
              const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.12
              const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.12
              return (
                <g key={edge.id}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    markerEnd={isActive ? 'url(#arrow-fw-active)' : 'url(#arrow-fw-default)'}
                    style={{ transition: 'stroke 0.2s' }}
                  />
                  <text
                    x={mx} y={my}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={9} fontWeight="700"
                    fill={isActive ? '#c9a0ff' : '#6b4d8a'}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
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
                  fontSize={12} fontWeight="600" fontFamily="monospace"
                  fill={TEXT_COLOR[node.highlight]}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.2s' }}
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Matrix */}
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-3 flex-1 overflow-auto">
          <div className="text-xs font-semibold text-[#a78bde] mb-2">Distance Matrix</div>
          {nodeCount > 0 && (
            <table className="border-separate" style={{ borderSpacing: 2 }}>
              <thead>
                <tr>
                  <th className="w-6 h-6" />
                  {labels.map((lbl, ci) => (
                    <th key={ci} className="w-10 h-6 text-center">
                      <span className="text-xs font-mono font-bold" style={{ color: ci === k ? '#9b6fd4' : '#6b4d8a' }}>
                        {lbl}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dist.map((row, ri) => (
                  <tr key={ri}>
                    <td className="text-center">
                      <span className="text-xs font-mono font-bold" style={{ color: ri === k ? '#9b6fd4' : '#6b4d8a' }}>
                        {labels[ri]}
                      </span>
                    </td>
                    {row.map((val, ci) => {
                      const hl = cellHL[ri]?.[ci] ?? 'default'
                      const style = CELL_STYLE[hl]
                      return (
                        <td key={ci}>
                          <div
                            className="w-10 h-8 flex items-center justify-center rounded text-xs font-mono font-bold border"
                            style={{
                              background: style.bg,
                              borderColor: style.border,
                              color: style.text,
                              transition: 'all 0.2s',
                            }}
                          >
                            {val === Infinity ? '∞' : val}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
        { bg: '#9b6fd4', border: '#d4aaff', label: 'Intermediate k' },
        { bg: '#c9a0ff', border: '#e8d5ff', label: 'Updated cell' },
        { bg: '#3d2d5a', border: '#c9a0ff', label: 'Source / target' },
      ].map(({ bg, border, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border" style={{ background: bg, borderColor: border }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
