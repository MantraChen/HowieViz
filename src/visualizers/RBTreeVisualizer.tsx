import { motion, AnimatePresence } from 'framer-motion'
import { useRBTreeStore, type RBNode, type RBNodeMap } from '@/store/rbTreeStore'
import { useState, useEffect } from 'react'

const SVG_WIDTH = 700
const NODE_RADIUS = 20
const LEVEL_HEIGHT = 72
const TOP_PADDING = 28
const NIL_SIZE = 8

const NODE_FILL: Record<string, string> = {
  red: '#ff6b8a',
  black: '#1c1530',
}
const NODE_STROKE: Record<string, string> = {
  red: '#ff6b8a',
  black: '#744cae',
}

const HL_OVERLAY: Record<RBNode['highlight'], string | null> = {
  default: null,
  traversing: '#9b6fd4',
  found: '#c9a0ff',
  notFound: '#ff6b8a',
  inserted: '#c9a0ff',
  deleted: '#ff6b8a',
  rotating: '#ffd700',
  recoloring: '#ff9f43',
}

function computePositions(nodes: RBNodeMap, rootId: string | null, nilId: string): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  const xIndices: Record<string, number> = {}
  let counter = 0

  function inorder(id: string | null) {
    if (id === null || id === nilId) return
    inorder(nodes[id].left)
    xIndices[id] = counter++
    inorder(nodes[id].right)
  }

  function assign(id: string | null, depth: number) {
    if (id === null || id === nilId) return
    const total = counter
    const x = total <= 1 ? SVG_WIDTH / 2 : (xIndices[id] + 0.5) / total * SVG_WIDTH
    const y = depth * LEVEL_HEIGHT + NODE_RADIUS + TOP_PADDING
    positions[id] = { x, y }
    assign(nodes[id].left, depth + 1)
    assign(nodes[id].right, depth + 1)
  }

  inorder(rootId)
  assign(rootId, 0)
  return positions
}

function treeDepth(nodes: RBNodeMap, id: string | null, nilId: string): number {
  if (id === null || id === nilId) return 0
  return 1 + Math.max(treeDepth(nodes, nodes[id].left, nilId), treeDepth(nodes, nodes[id].right, nilId))
}

export function RBTreeVisualizer() {
  const { nodes, rootId, nilId, rotationLabel } = useRBTreeStore()
  const [svgVisible, setSvgVisible] = useState(rootId !== null)
  const isEmpty = rootId === null

  useEffect(() => {
    if (rootId !== null) setSvgVisible(true)
  }, [rootId])

  const positions = computePositions(nodes, rootId, nilId)
  const depth = treeDepth(nodes, rootId, nilId)
  const svgHeight = Math.max(140, depth * LEVEL_HEIGHT + NODE_RADIUS * 2 + TOP_PADDING + 20)

  const realNodeIds = Object.keys(nodes).filter(id => !nodes[id].isNil)

  return (
    <div className="flex flex-col gap-4">
      {rotationLabel && (
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-[#ffd700]/15 border border-[#ffd700]/40 text-xs font-mono font-semibold text-[#ffd700]">
            {rotationLabel}
          </span>
        </div>
      )}

      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden">
        {!svgVisible ? (
          <div className="flex items-center justify-center h-24 text-[#3d2d5a] text-sm font-mono">tree is empty</div>
        ) : (
          <svg viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} width="100%" style={{ display: 'block' }}>
            {/* Edges */}
            {realNodeIds.map(id => {
              const node = nodes[id]
              const pos = positions[id]
              if (!pos) return null
              return (
                <g key={`e-${id}`}>
                  {node.left && !nodes[node.left]?.isNil && positions[node.left] && (
                    <line x1={pos.x} y1={pos.y} x2={positions[node.left].x} y2={positions[node.left].y}
                      stroke="#2a1f3d" strokeWidth={2} />
                  )}
                  {node.right && !nodes[node.right]?.isNil && positions[node.right] && (
                    <line x1={pos.x} y1={pos.y} x2={positions[node.right].x} y2={positions[node.right].y}
                      stroke="#2a1f3d" strokeWidth={2} />
                  )}
                  {/* NIL children */}
                  {node.left && nodes[node.left]?.isNil && pos && (
                    <rect
                      x={pos.x - 32 - NIL_SIZE / 2}
                      y={pos.y + LEVEL_HEIGHT / 2 - NIL_SIZE / 2}
                      width={NIL_SIZE}
                      height={NIL_SIZE}
                      fill="#1c1530"
                      stroke="#744cae"
                      strokeWidth={1}
                      rx={1}
                    />
                  )}
                  {node.right && nodes[node.right]?.isNil && pos && (
                    <rect
                      x={pos.x + 32 - NIL_SIZE / 2}
                      y={pos.y + LEVEL_HEIGHT / 2 - NIL_SIZE / 2}
                      width={NIL_SIZE}
                      height={NIL_SIZE}
                      fill="#1c1530"
                      stroke="#744cae"
                      strokeWidth={1}
                      rx={1}
                    />
                  )}
                </g>
              )
            })}

            {/* Root label */}
            {rootId && positions[rootId] && (
              <text x={positions[rootId].x} y={positions[rootId].y - NODE_RADIUS - 6}
                textAnchor="middle" fontSize={9} fontWeight="bold" fill="#c9a0ff" letterSpacing="0.1em">
                RB
              </text>
            )}

            {/* Nodes */}
            <AnimatePresence onExitComplete={() => { if (isEmpty) setSvgVisible(false) }}>
              {realNodeIds.map(id => {
                const node = nodes[id]
                const pos = positions[id]
                if (!pos) return null
                const hl = node.highlight
                const overlay = HL_OVERLAY[hl]
                const fill = overlay ?? NODE_FILL[node.color]
                const stroke = overlay ?? NODE_STROKE[node.color]
                const textColor = node.color === 'red' ? '#1a0f2e' : '#f0eaf8'

                return (
                  <g key={id}>
                    <motion.circle
                      animate={{ cx: pos.x, cy: pos.y, fill, stroke }}
                      initial={{ cx: pos.x, cy: pos.y, fill, stroke }}
                      exit={{ r: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      r={NODE_RADIUS}
                      strokeWidth={2}
                    />
                    <motion.text
                      animate={{ x: pos.x, y: pos.y, fill: overlay ? '#1a0f2e' : textColor }}
                      initial={{ x: pos.x, y: pos.y }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight="600"
                      fontFamily="monospace"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.value}
                    </motion.text>
                  </g>
                )
              })}
            </AnimatePresence>
          </svg>
        )}
      </div>

      <Legend />
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-[#6b4d8a]">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ background: '#ff6b8a', border: '2px solid #ff6b8a' }} />
        <span>Red node</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ background: '#1c1530', border: '2px solid #744cae' }} />
        <span>Black node</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5" style={{ background: '#1c1530', border: '1.5px solid #744cae' }} />
        <span>NIL leaf</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ background: '#ffd700' }} />
        <span>Rotating</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ background: '#ff9f43' }} />
        <span>Recoloring</span>
      </div>
    </div>
  )
}
