import { useTrieStore, type TrieNode, type TrieNodeHL } from '@/store/trieStore'

const NODE_R = 18
const LEVEL_H = 66
const SVG_W = 640
const TOP_PAD = 24
const LEAF_W = NODE_R * 2 + 8

const FILL: Record<TrieNodeHL, string> = {
  default: '#1c1530',
  traversing: '#9b6fd4',
  found: '#c9a0ff',
  notFound: '#ff6b8a',
  inserted: '#c9a0ff',
  deleted: '#ff6b8a',
}
const STROKE: Record<TrieNodeHL, string> = {
  default: '#744cae',
  traversing: '#d4aaff',
  found: '#e8d5ff',
  notFound: '#ff8fa3',
  inserted: '#e8d5ff',
  deleted: '#ff8fa3',
}
const TEXT_COLOR: Record<TrieNodeHL, string> = {
  default: '#f0eaf8',
  traversing: '#ffffff',
  found: '#1a0f2e',
  notFound: '#ffffff',
  inserted: '#1a0f2e',
  deleted: '#ffffff',
}

function computeLayout(
  nodes: Record<string, TrieNode>,
  rootId: string,
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}

  function subtreeWidth(id: string): number {
    const node = nodes[id]
    if (!node) return 0
    const childIds = Object.values(node.children)
    if (childIds.length === 0) return LEAF_W
    return childIds.reduce((s, cid) => s + subtreeWidth(cid), 0)
  }

  function assign(id: string, x: number, depth: number) {
    const node = nodes[id]
    if (!node) return
    const w = subtreeWidth(id)
    positions[id] = { x: x + w / 2, y: TOP_PAD + depth * LEVEL_H }
    let cx = x
    for (const cid of Object.values(node.children)) {
      const cw = subtreeWidth(cid)
      assign(cid, cx, depth + 1)
      cx += cw
    }
  }

  const totalW = subtreeWidth(rootId)
  const startX = Math.max(0, (SVG_W - totalW) / 2)
  assign(rootId, startX, 0)
  return positions
}

function treeHeight(nodes: Record<string, TrieNode>, id: string): number {
  const node = nodes[id]
  if (!node) return 0
  const childIds = Object.values(node.children)
  if (childIds.length === 0) return 1
  return 1 + Math.max(...childIds.map(cid => treeHeight(nodes, cid)))
}

export function TrieVisualizer() {
  const { nodes, rootId, message } = useTrieStore()

  const positions = computeLayout(nodes, rootId)
  const height = treeHeight(nodes, rootId)
  const svgH = Math.max(120, height * LEVEL_H + TOP_PAD + NODE_R + 16)

  const allIds = Object.keys(nodes)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${svgH}`} width="100%" style={{ display: 'block' }}>
          {/* Edges */}
          {allIds.map(id => {
            const node = nodes[id]
            const pos = positions[id]
            if (!pos || !node) return null
            return Object.entries(node.children).map(([ch, childId]) => {
              const cpos = positions[childId]
              if (!cpos) return null
              return (
                <line
                  key={`${id}-${ch}`}
                  x1={pos.x} y1={pos.y}
                  x2={cpos.x} y2={cpos.y}
                  stroke="#2a1f3d"
                  strokeWidth={1.5}
                />
              )
            })
          })}

          {/* Nodes */}
          {allIds.map(id => {
            const node = nodes[id]
            const pos = positions[id]
            if (!pos || !node) return null
            const hl = node.highlight

            if (id === rootId) {
              return (
                <g key={id}>
                  <circle cx={pos.x} cy={pos.y} r={14} fill="#141020" stroke="#744cae" strokeWidth={1.5} />
                  <text x={pos.x} y={pos.y + 14 + 10} textAnchor="middle" dominantBaseline="central"
                    fontSize={10} fontWeight="500" fill="#a78bde"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    ROOT
                  </text>
                </g>
              )
            }

            return (
              <g key={id}>
                <circle
                  cx={pos.x} cy={pos.y} r={NODE_R}
                  fill={FILL[hl]}
                  stroke={STROKE[hl]}
                  strokeWidth={hl === 'traversing' ? 3 : 2}
                  style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                />
                {/* End-of-word indicator: filled inner dot */}
                {node.isEnd && (
                  <circle cx={pos.x} cy={pos.y} r={5}
                    fill={hl === 'default' ? '#744cae' : TEXT_COLOR[hl]}
                    style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                  />
                )}
                <text
                  x={pos.x}
                  y={node.isEnd ? pos.y - NODE_R * 0.35 : pos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={12} fontWeight="700" fontFamily="monospace"
                  fill={TEXT_COLOR[hl]}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.2s' }}
                >
                  {node.char}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {message && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-2.5">
          <span className="text-xs font-mono text-[#c9a0ff]">{message}</span>
        </div>
      )}

      <Legend />
    </div>
  )
}

function Legend() {
  const items: { fill: string; stroke: string; label: string }[] = [
    { fill: '#1c1530', stroke: '#744cae', label: 'Default' },
    { fill: '#9b6fd4', stroke: '#d4aaff', label: 'Traversing' },
    { fill: '#c9a0ff', stroke: '#e8d5ff', label: 'Found / Inserted' },
    { fill: '#ff6b8a', stroke: '#ff8fa3', label: 'Not Found / Deleted' },
  ]
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {items.map(({ fill, stroke, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2" style={{ background: fill, borderColor: stroke }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#744cae]" />
        <span className="text-xs text-[#6b4d8a]">End of word</span>
      </div>
    </div>
  )
}
