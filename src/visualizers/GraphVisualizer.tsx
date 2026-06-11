import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGraphStore, type NodeHighlight, type EdgeHighlight } from '@/store/graphStore'

const SVG_W = 560
const SVG_H = 360
const NODE_R = 22

const NODE_FILL: Record<NodeHighlight, string> = {
  default: '#1c1530',
  current: '#9b6fd4',
  visited: '#c9a0ff',
}
const NODE_STROKE: Record<NodeHighlight, string> = {
  default: '#744cae',
  current: '#d4aaff',
  visited: '#e8d5ff',
}
const TEXT_COLOR: Record<NodeHighlight, string> = {
  default: '#f0eaf8',
  current: '#ffffff',
  visited: '#1a0f2e',
}
const EDGE_COLOR: Record<EdgeHighlight, string> = {
  default: '#2a1f3d',
  active: '#9b6fd4',
}
const EDGE_WIDTH: Record<EdgeHighlight, number> = {
  default: 1.5,
  active: 2.5,
}

export function GraphVisualizer() {
  const { nodes, edges, traversalOrder, traversalType, isAnimating, updateNodePosition } = useGraphStore()

  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)

  const nodeList = Object.values(nodes)
  const edgeList = Object.values(edges)
  const isEmpty = nodeList.length === 0

  function getSVGPoint(e: React.MouseEvent) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (SVG_W / rect.width),
      y: (e.clientY - rect.top) * (SVG_H / rect.height),
    }
  }

  function onNodeMouseDown(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation()
    if (isAnimating) return
    const pt = getSVGPoint(e)
    const node = nodes[nodeId]
    setDragging({ id: nodeId, offsetX: pt.x - node.x, offsetY: pt.y - node.y })
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragging) return
    const pt = getSVGPoint(e)
    updateNodePosition(
      dragging.id,
      Math.max(NODE_R, Math.min(SVG_W - NODE_R, pt.x - dragging.offsetX)),
      Math.max(NODE_R, Math.min(SVG_H - NODE_R, pt.y - dragging.offsetY)),
    )
  }

  function onMouseUp() {
    setDragging(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden">
        {isEmpty ? (
          <div className="flex items-center justify-center h-24 text-[#3d2d5a] text-sm font-mono">
            graph is empty
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width="100%"
            style={{ display: 'block', cursor: dragging ? 'grabbing' : 'default' }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Edges */}
            {edgeList.map(edge => {
              const from = nodes[edge.from]
              const to = nodes[edge.to]
              if (!from || !to) return null
              return (
                <motion.line
                  key={edge.id}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  animate={{
                    stroke: EDGE_COLOR[edge.highlight],
                    strokeWidth: EDGE_WIDTH[edge.highlight],
                  }}
                  transition={{ duration: 0.25 }}
                  strokeLinecap="round"
                />
              )
            })}

            {/* Nodes */}
            {nodeList.map(node => (
              <g
                key={node.id}
                onMouseDown={e => onNodeMouseDown(e, node.id)}
                style={{ cursor: isAnimating ? 'default' : 'grab' }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R}
                  animate={{
                    fill: NODE_FILL[node.highlight],
                    stroke: NODE_STROKE[node.highlight],
                    strokeWidth: node.highlight === 'current' ? 3 : 2,
                  }}
                  transition={{ duration: 0.25 }}
                />
                <motion.text
                  x={node.x}
                  y={node.y}
                  animate={{ fill: TEXT_COLOR[node.highlight] }}
                  transition={{ duration: 0.25 }}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight="600"
                  fontFamily="monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.label}
                </motion.text>
                {node.visitOrder !== null && (
                  <text
                    x={node.x + NODE_R - 1}
                    y={node.y - NODE_R + 3}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={8}
                    fontWeight="700"
                    fill="#c9a0ff"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.visitOrder}
                  </text>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>

      {traversalOrder.length > 0 && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-3">
          <span className="text-xs font-semibold text-[#a78bde] mr-1">{traversalType} Order:</span>
          <span className="text-xs font-mono text-[#c9a0ff]">{traversalOrder.join(' → ')}</span>
        </div>
      )}

      <Legend />
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 flex-wrap">
      {(
        [
          { hl: 'default' as NodeHighlight, label: 'Unvisited' },
          { hl: 'current' as NodeHighlight, label: 'Current' },
          { hl: 'visited' as NodeHighlight, label: 'Visited' },
        ] as const
      ).map(({ hl, label }) => (
        <div key={hl} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full border-2"
            style={{ background: NODE_FILL[hl], borderColor: NODE_STROKE[hl] }}
          />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-0.5 rounded" style={{ background: EDGE_COLOR.active }} />
        <span className="text-xs text-[#6b4d8a]">Tree edge</span>
      </div>
    </div>
  )
}
