import { motion, AnimatePresence } from 'framer-motion'
import { useBSTStore, type BSTNode, type NodeMap } from '@/store/bstStore'
import { useState, useEffect } from 'react'

const SVG_WIDTH = 600
const NODE_RADIUS = 22
const LEVEL_HEIGHT = 76
const TOP_PADDING = 20

const FILL: Record<BSTNode['highlight'], string> = {
  default:   '#1c1530',
  traversing:'#9b6fd4',
  found:     '#c9a0ff',
  notFound:  '#ff6b8a',
  inserted:  '#c9a0ff',
  deleted:   '#ff6b8a',
}

const STROKE: Record<BSTNode['highlight'], string> = {
  default:   '#744cae',
  traversing:'#9b6fd4',
  found:     '#c9a0ff',
  notFound:  '#ff6b8a',
  inserted:  '#c9a0ff',
  deleted:   '#ff6b8a',
}

const TEXT_COLOR: Record<BSTNode['highlight'], string> = {
  default:   '#f0eaf8',
  traversing:'#ffffff',
  found:     '#1a0f2e',
  notFound:  '#ffffff',
  inserted:  '#1a0f2e',
  deleted:   '#ffffff',
}

function computePositions(nodes: NodeMap, rootId: string | null): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  const xIndices: Record<string, number> = {}
  let counter = 0

  function inorder(id: string | null) {
    if (id === null) return
    inorder(nodes[id].left)
    xIndices[id] = counter++
    inorder(nodes[id].right)
  }

  function assign(id: string | null, depth: number) {
    if (id === null) return
    const total = counter
    const x = total === 1 ? SVG_WIDTH / 2 : (xIndices[id] + 0.5) / total * SVG_WIDTH
    const y = depth * LEVEL_HEIGHT + NODE_RADIUS + TOP_PADDING
    positions[id] = { x, y }
    assign(nodes[id].left, depth + 1)
    assign(nodes[id].right, depth + 1)
  }

  inorder(rootId)
  assign(rootId, 0)
  return positions
}

function treeHeight(nodes: NodeMap, id: string | null): number {
  if (id === null) return 0
  return 1 + Math.max(treeHeight(nodes, nodes[id].left), treeHeight(nodes, nodes[id].right))
}

export function BSTVisualizer() {
  const { nodes, rootId } = useBSTStore()
  const [svgVisible, setSvgVisible] = useState(rootId !== null)
  const isEmpty = rootId === null && Object.keys(nodes).length === 0

  useEffect(() => {
    if (rootId !== null) setSvgVisible(true)
  }, [rootId])

  const positions = computePositions(nodes, rootId)
  const height = treeHeight(nodes, rootId)
  const svgHeight = Math.max(140, height * LEVEL_HEIGHT + NODE_RADIUS * 2 + TOP_PADDING + 10)

  const nodeIds = Object.keys(nodes)

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden">
        {!svgVisible ? (
          <div className="flex items-center justify-center h-24 text-[#3d2d5a] text-sm font-mono">
            tree is empty
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
            width="100%"
            style={{ display: 'block' }}
          >
            {/* Edges */}
            {nodeIds.map(id => {
              const node = nodes[id]
              const pos = positions[id]
              if (!pos) return null
              return (
                <g key={`edges-${id}`}>
                  {node.left && positions[node.left] && (
                    <line
                      x1={pos.x} y1={pos.y}
                      x2={positions[node.left].x} y2={positions[node.left].y}
                      stroke="#2a1f3d" strokeWidth={2}
                    />
                  )}
                  {node.right && positions[node.right] && (
                    <line
                      x1={pos.x} y1={pos.y}
                      x2={positions[node.right].x} y2={positions[node.right].y}
                      stroke="#2a1f3d" strokeWidth={2}
                    />
                  )}
                </g>
              )
            })}

            {/* BST label above root */}
            {rootId && positions[rootId] && (
              <text
                x={positions[rootId].x}
                y={positions[rootId].y - NODE_RADIUS - 5}
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fill="#c9a0ff"
                letterSpacing="0.1em"
              >
                BST
              </text>
            )}

            {/* Nodes */}
            <AnimatePresence onExitComplete={() => { if (isEmpty) setSvgVisible(false) }}>
              {nodeIds.map(id => {
                const node = nodes[id]
                const pos = positions[id]
                if (!pos) return null
                const hl = node.highlight
                return (
                  <g key={id}>
                    <motion.circle
                      animate={{ cx: pos.x, cy: pos.y, fill: FILL[hl], stroke: STROKE[hl] }}
                      initial={{ cx: pos.x, cy: pos.y, fill: FILL[hl], stroke: STROKE[hl] }}
                      exit={{ r: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      r={NODE_RADIUS}
                      strokeWidth={2}
                    />
                    <motion.text
                      animate={{ x: pos.x, y: pos.y, fill: TEXT_COLOR[hl] }}
                      initial={{ x: pos.x, y: pos.y }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={13}
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

const LEGEND: { key: BSTNode['highlight']; label: string }[] = [
  { key: 'default',    label: 'Default' },
  { key: 'traversing', label: 'Traversing' },
  { key: 'inserted',   label: 'Inserted / Found' },
  { key: 'notFound',   label: 'Not Found / Deleted' },
]

function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {LEGEND.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full border-2"
            style={{ background: FILL[key], borderColor: STROKE[key] }}
          />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
