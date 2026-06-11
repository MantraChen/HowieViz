import { motion, AnimatePresence } from 'framer-motion'
import { useHeapStore, type HeapNode } from '@/store/heapStore'
import { useState, useEffect } from 'react'

const SVG_WIDTH = 560
const NODE_RADIUS = 22
const LEVEL_HEIGHT = 74
const TOP_PADDING = 24

const FILL: Record<NonNullable<HeapNode['highlight']>, string> = {
  default:  '#1c1530',
  active:   '#9b6fd4',
  inserted: '#c9a0ff',
  deleted:  '#ff6b8a',
  swapping: '#9b6fd4',
}

const STROKE: Record<NonNullable<HeapNode['highlight']>, string> = {
  default:  '#744cae',
  active:   '#9b6fd4',
  inserted: '#c9a0ff',
  deleted:  '#ff6b8a',
  swapping: '#c9a0ff',
}

const TEXT_COLOR: Record<NonNullable<HeapNode['highlight']>, string> = {
  default:  '#f0eaf8',
  active:   '#ffffff',
  inserted: '#1a0f2e',
  deleted:  '#ffffff',
  swapping: '#ffffff',
}

function getNodePos(index: number): { x: number; y: number } {
  const level = Math.floor(Math.log2(index + 1))
  const levelStart = Math.pow(2, level) - 1
  const posInLevel = index - levelStart
  const totalInLevel = Math.pow(2, level)
  const x = (posInLevel + 0.5) / totalInLevel * SVG_WIDTH
  const y = level * LEVEL_HEIGHT + NODE_RADIUS + 10 + TOP_PADDING
  return { x, y }
}

export function HeapVisualizer() {
  const { heap } = useHeapStore()
  const [svgVisible, setSvgVisible] = useState(heap.length > 0)

  // Show SVG as soon as there are nodes; hide only after exit animations complete
  useEffect(() => {
    if (heap.length > 0) setSvgVisible(true)
  }, [heap.length])

  const positions = heap.map((_, i) => getNodePos(i))
  const maxLevel = heap.length > 0 ? Math.floor(Math.log2(heap.length)) : 0
  const svgHeight = Math.max(200, (maxLevel + 1) * LEVEL_HEIGHT + NODE_RADIUS * 2 + TOP_PADDING + 20)

  return (
    <div className="flex flex-col gap-5">
      {/* Tree SVG */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden relative">
        {!svgVisible ? (
          <div className="flex items-center justify-center h-24 text-[#3d2d5a] text-sm font-mono">
            heap is empty
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
            width="100%"
            style={{ display: 'block' }}
          >
            {/* Edges — drawn first so nodes render on top */}
            {heap.map((_, i) => {
              if (i === 0) return null
              const parent = Math.floor((i - 1) / 2)
              const { x: px, y: py } = positions[parent]
              const { x: cx, y: cy } = positions[i]
              return (
                <line
                  key={`edge-${i}`}
                  x1={px} y1={py}
                  x2={cx} y2={cy}
                  stroke="#2a1f3d"
                  strokeWidth={2}
                />
              )
            })}

            {/* MIN label above root */}
            {heap.length > 0 && (
              <text
                x={positions[0]?.x ?? SVG_WIDTH / 2}
                y={(positions[0]?.y ?? 30) - NODE_RADIUS - 5}
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fill="#c9a0ff"
                letterSpacing="0.1em"
              >
                MIN
              </text>
            )}

            {/* Node circles — use motion.circle for smooth cx/cy transitions */}
            <AnimatePresence onExitComplete={() => { if (heap.length === 0) setSvgVisible(false) }}>
              {heap.map((node, index) => {
                const { x, y } = positions[index]
                const hl = node.highlight
                return (
                  <g key={node.id}>
                    <motion.circle
                      animate={{
                        cx: x,
                        cy: y,
                        fill: FILL[hl],
                        stroke: STROKE[hl],
                      }}
                      initial={{ cx: x, cy: y, fill: FILL[hl], stroke: STROKE[hl] }}
                      exit={{ r: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      r={NODE_RADIUS}
                      strokeWidth={2}
                    />
                    <motion.text
                      animate={{ x, y, fill: TEXT_COLOR[hl] }}
                      initial={{ x, y }}
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

      {/* Array representation */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[10px] text-[#6b4d8a] font-mono uppercase tracking-wider">
            array repr
          </span>
          <span className="text-[10px] text-[#3d2d5a] font-mono">
            [{heap.map(n => n.value).join(', ')}]
          </span>
        </div>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <AnimatePresence mode="popLayout">
            {heap.map((node, i) => (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="flex flex-col items-center gap-0.5"
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded border-2 font-mono text-xs font-semibold transition-colors duration-300"
                  style={{
                    background: FILL[node.highlight],
                    borderColor: STROKE[node.highlight],
                    color: TEXT_COLOR[node.highlight],
                  }}
                >
                  {node.value}
                </div>
                <span className="text-[9px] text-[#3d2d5a] font-mono">{i}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {heap.length === 0 && (
            <span className="text-[#3d2d5a] text-xs font-mono">empty</span>
          )}
        </div>
      </div>

      <Legend />
    </div>
  )
}

const LEGEND: { key: HeapNode['highlight']; label: string }[] = [
  { key: 'default',  label: 'Default' },
  { key: 'swapping', label: 'Swapping' },
  { key: 'inserted', label: 'Inserted' },
  { key: 'active',   label: 'Active / Min' },
  { key: 'deleted',  label: 'Deleted' },
]

function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {LEGEND.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full border-2"
            style={{ background: FILL[key!], borderColor: STROKE[key!] }}
          />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
