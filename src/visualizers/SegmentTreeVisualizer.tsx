import { useSTStore, type STNodeHL } from '@/store/segmentTreeStore'

const SVG_W = 580
const LEVEL_H = 80
const NODE_W = 58
const NODE_H = 32
const TOP_PAD = 20

const FILL: Record<STNodeHL, string> = {
  default: '#1c1530',
  building: '#9b6fd4',
  querying: '#744cae',
  updating: '#9b6fd4',
  result: '#c9a0ff',
}
const STROKE: Record<STNodeHL, string> = {
  default: '#744cae',
  building: '#d4aaff',
  querying: '#b892e8',
  updating: '#d4aaff',
  result: '#e8d5ff',
}
const TEXT_COLOR: Record<STNodeHL, string> = {
  default: '#f0eaf8',
  building: '#ffffff',
  querying: '#f0eaf8',
  updating: '#ffffff',
  result: '#1a0f2e',
}

function computePositions(nodes: Record<number, { l: number; r: number }>, n: number) {
  const positions: Record<number, { x: number; y: number }> = {}

  function assign(idx: number, l: number, r: number, lo: number, hi: number, depth: number) {
    if (!nodes[idx]) return
    const x = (lo + hi) / 2 * (SVG_W / n)
    const y = TOP_PAD + depth * LEVEL_H
    positions[idx] = { x, y }
    if (l < r) {
      const mid = (l + r) >> 1
      assign(2 * idx, l, mid, lo, (lo + hi) / 2, depth + 1)
      assign(2 * idx + 1, mid + 1, r, (lo + hi) / 2, hi, depth + 1)
    }
  }

  assign(1, 0, n - 1, 0, n, 0)
  return positions
}

function treeDepth(nodeIdx: number, nodes: Record<number, { l: number; r: number }>): number {
  const node = nodes[nodeIdx]
  if (!node || node.l === node.r) return 1
  return 1 + Math.max(
    treeDepth(2 * nodeIdx, nodes),
    treeDepth(2 * nodeIdx + 1, nodes),
  )
}

export function SegmentTreeVisualizer() {
  const { nodes, arr, message, resultSum } = useSTStore()
  const n = arr.length

  const positions = computePositions(nodes, n)
  const depth = nodes[1] ? treeDepth(1, nodes) : 1
  const svgH = Math.max(120, depth * LEVEL_H + TOP_PAD + NODE_H + 16)

  const nodeList = Object.values(nodes)

  return (
    <div className="flex flex-col gap-4">
      {/* Tree SVG */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${svgH}`} width="100%" style={{ display: 'block' }}>
          {/* Edges */}
          {nodeList.map(node => {
            const pos = positions[node.idx]
            if (!pos) return null
            return (
              <g key={`e-${node.idx}`}>
                {nodes[2 * node.idx] && positions[2 * node.idx] && (
                  <line x1={pos.x} y1={pos.y + NODE_H / 2}
                    x2={positions[2 * node.idx].x} y2={positions[2 * node.idx].y - NODE_H / 2}
                    stroke="#2a1f3d" strokeWidth={1.5} />
                )}
                {nodes[2 * node.idx + 1] && positions[2 * node.idx + 1] && (
                  <line x1={pos.x} y1={pos.y + NODE_H / 2}
                    x2={positions[2 * node.idx + 1].x} y2={positions[2 * node.idx + 1].y - NODE_H / 2}
                    stroke="#2a1f3d" strokeWidth={1.5} />
                )}
              </g>
            )
          })}

          {/* Nodes (rounded rects) */}
          {nodeList.map(node => {
            const pos = positions[node.idx]
            if (!pos) return null
            const hl = node.highlight
            const x = pos.x - NODE_W / 2
            const y = pos.y - NODE_H / 2
            return (
              <g key={node.idx} style={{ transition: 'all 0.25s' }}>
                <rect
                  x={x} y={y} width={NODE_W} height={NODE_H} rx={6}
                  fill={FILL[hl]}
                  stroke={STROKE[hl]}
                  strokeWidth={hl !== 'default' ? 2 : 1.5}
                  style={{ transition: 'fill 0.25s, stroke 0.25s' }}
                />
                {/* Range label */}
                <text
                  x={pos.x} y={y + 9}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={8} fontWeight="600"
                  fill={hl === 'result' ? '#1a0f2e' : '#6b4d8a'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  [{node.l},{node.r}]
                </text>
                {/* Sum label */}
                <text
                  x={pos.x} y={y + 22}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={12} fontWeight="700" fontFamily="monospace"
                  fill={TEXT_COLOR[hl]}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.25s' }}
                >
                  {node.sum}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Array display */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-3">
        <p className="text-xs font-medium text-[#a78bde] mb-2">Array</p>
        <div className="flex gap-1.5">
          {arr.map((v, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-9 h-9 flex items-center justify-center rounded-md border border-[#2a1f3d] bg-[#1c1530] text-sm font-mono font-bold text-[#f0eaf8]">
                {v}
              </div>
              <span className="text-xs font-mono text-[#3d2d5a] mt-0.5">{i}</span>
            </div>
          ))}
        </div>
      </div>

      {(message || resultSum !== null) && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-2.5 flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-[#c9a0ff]">{message}</span>
          {resultSum !== null && (
            <span className="text-xs font-mono font-bold text-[#c9a0ff] shrink-0">= {resultSum}</span>
          )}
        </div>
      )}

      <Legend />
    </div>
  )
}

function Legend() {
  const items: { hl: STNodeHL; label: string }[] = [
    { hl: 'default', label: 'Default' },
    { hl: 'querying', label: 'Visiting' },
    { hl: 'result', label: 'Contributes' },
    { hl: 'updating', label: 'Updating' },
  ]
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {items.map(({ hl, label }) => (
        <div key={hl} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded border" style={{ background: FILL[hl], borderColor: STROKE[hl] }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
