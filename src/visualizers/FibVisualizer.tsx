import { useFibStore, type FibNode } from '@/store/fibStore'

const H_GAP = 44
const V_GAP = 72
const NODE_R = 18
const CANVAS_PAD = 20

const FILL: Record<FibNode['highlight'], string> = {
  default: '#1c1530',
  computing: '#9b6fd4',
  memo: '#c9a0ff',
  resolved: '#1e1a30',
}
const STROKE: Record<FibNode['highlight'], string> = {
  default: '#744cae',
  computing: '#c9a0ff',
  memo: '#c9a0ff',
  resolved: '#5a3d8a',
}
const TEXT_COLOR: Record<FibNode['highlight'], string> = {
  default: '#f0eaf8',
  computing: '#fff',
  memo: '#1a0f2e',
  resolved: '#b892e8',
}

export function FibVisualizer() {
  const { nodes, rootId, memo } = useFibStore()

  if (!rootId || Object.keys(nodes).length === 0) {
    return (
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] flex items-center justify-center h-32 text-[#3d2d5a] text-sm font-mono">
        Enter n and press Compute
      </div>
    )
  }

  // Compute positions from xIndex and depth
  const nodeArr = Object.values(nodes)
  const maxX = Math.max(...nodeArr.map(n => n.xIndex))
  const maxDepth = Math.max(...nodeArr.map(n => n.depth))
  const svgWidth = Math.max(300, (maxX + 1) * H_GAP + CANVAS_PAD * 2)
  const svgHeight = (maxDepth + 1) * V_GAP + NODE_R * 2 + CANVAS_PAD

  function nodeX(n: FibNode) {
    return CANVAS_PAD + n.xIndex * H_GAP + H_GAP / 2
  }
  function nodeY(n: FibNode) {
    return CANVAS_PAD + n.depth * V_GAP + NODE_R
  }

  // Build edges
  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = []
  for (const node of nodeArr) {
    if (node.parentId && nodes[node.parentId]) {
      const parent = nodes[node.parentId]
      edges.push({
        x1: nodeX(parent),
        y1: nodeY(parent),
        x2: nodeX(node),
        y2: nodeY(node),
        key: node.id,
      })
    }
  }

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex-1 min-w-0 rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-auto">
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block', minWidth: svgWidth }}>
          {edges.map(e => (
            <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#2a1f3d" strokeWidth={1.5} />
          ))}
          {nodeArr.map(node => {
            const x = nodeX(node)
            const y = nodeY(node)
            const hl = node.highlight
            return (
              <g key={node.id}>
                <circle cx={x} cy={y} r={NODE_R} fill={FILL[hl]} stroke={STROKE[hl]} strokeWidth={1.5} />
                <text x={x} y={y - 3} textAnchor="middle" dominantBaseline="central"
                  fontSize={9} fontWeight="700" fontFamily="monospace" fill={TEXT_COLOR[hl]}
                  style={{ userSelect: 'none' }}>
                  f({node.n})
                </text>
                {node.result !== null && (
                  <text x={x} y={y + 7} textAnchor="middle" dominantBaseline="central"
                    fontSize={9} fontFamily="monospace" fill={hl === 'memo' ? '#1a0f2e' : '#c9a0ff'}
                    style={{ userSelect: 'none' }}>
                    ={node.result}
                  </text>
                )}
                {node.isMemoHit && (
                  <text x={x + NODE_R + 3} y={y - 4} textAnchor="start" fontSize={7} fill="#c9a0ff"
                    fontWeight="bold" style={{ userSelect: 'none' }}>
                    ★
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Memo table */}
      <div className="w-36 flex-shrink-0">
        <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-3">
          <p className="text-xs text-[#a78bde] font-semibold mb-2">Memo Table</p>
          <div className="space-y-1">
            {Object.entries(memo).sort(([a], [b]) => Number(a) - Number(b)).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs font-mono">
                <span className="text-[#6b4d8a]">fib({k})</span>
                <span className="text-[#c9a0ff] font-bold">{v}</span>
              </div>
            ))}
            {Object.keys(memo).length === 0 && (
              <p className="text-[#3d2d5a] text-xs">empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
