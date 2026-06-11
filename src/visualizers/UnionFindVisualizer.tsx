import { useUFStore, type UFNodeHL } from '@/store/unionFindStore'

const NODE_R = 22
const SVG_W = 560
const H_PER_LEVEL = 70
const TOP_PAD = 30

const NODE_FILL: Record<UFNodeHL, string> = {
  default: '#1c1530',
  path: '#9b6fd4',
  root: '#c9a0ff',
  merged: '#744cae',
}
const NODE_STROKE: Record<UFNodeHL, string> = {
  default: '#744cae',
  path: '#d4aaff',
  root: '#e8d5ff',
  merged: '#b892e8',
}
const TEXT_COLOR: Record<UFNodeHL, string> = {
  default: '#f0eaf8',
  path: '#ffffff',
  root: '#1a0f2e',
  merged: '#ffffff',
}

interface TreeNode {
  id: number
  children: TreeNode[]
}

function buildTrees(parent: number[]): TreeNode[] {
  const n = parent.length
  const children: number[][] = Array.from({ length: n }, () => [])
  const roots: number[] = []

  for (let i = 0; i < n; i++) {
    if (parent[i] === i) roots.push(i)
    else children[parent[i]].push(i)
  }

  function makeTree(id: number): TreeNode {
    return { id, children: children[id].map(makeTree) }
  }

  return roots.map(makeTree)
}

interface Pos { x: number; y: number }

function layoutForest(trees: TreeNode[]): Record<number, Pos> {
  const positions: Record<number, Pos> = {}
  const GAP = 12

  // First pass: compute subtree widths
  function subtreeWidth(node: TreeNode): number {
    if (node.children.length === 0) return NODE_R * 2 + GAP
    return node.children.reduce((sum, c) => sum + subtreeWidth(c), 0)
  }

  // Second pass: assign x based on subtree widths
  function assign(node: TreeNode, x: number, depth: number) {
    const w = subtreeWidth(node)
    positions[node.id] = { x: x + w / 2, y: TOP_PAD + depth * H_PER_LEVEL }
    let cx = x
    for (const child of node.children) {
      const cw = subtreeWidth(child)
      assign(child, cx, depth + 1)
      cx += cw
    }
  }

  // Compute total width for centering
  const totalW = trees.reduce((s, t) => s + subtreeWidth(t), 0)
  const startX = Math.max(0, (SVG_W - totalW) / 2)

  let cx = startX
  for (const tree of trees) {
    const w = subtreeWidth(tree)
    assign(tree, cx, 0)
    cx += w
  }

  return positions
}

function treeDepth(node: TreeNode): number {
  if (node.children.length === 0) return 1
  return 1 + Math.max(...node.children.map(treeDepth))
}

export function UnionFindVisualizer() {
  const { parent, rank, highlights, message, n } = useUFStore()

  const trees = buildTrees(parent)
  const positions = layoutForest(trees)
  const maxDepth = trees.length > 0 ? Math.max(...trees.map(treeDepth)) : 1
  const svgH = Math.max(120, maxDepth * H_PER_LEVEL + TOP_PAD + NODE_R + 20)

  return (
    <div className="flex flex-col gap-4">
      {/* Forest SVG */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${svgH}`} width="100%" style={{ display: 'block' }}>
          {/* Edges */}
          {Array.from({ length: n }, (_, i) => i).map(i => {
            if (parent[i] === i) return null
            const from = positions[parent[i]]
            const to = positions[i]
            if (!from || !to) return null
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="#2a1f3d"
                strokeWidth={2}
                style={{ transition: 'all 0.3s' }}
              />
            )
          })}

          {/* Nodes */}
          {Array.from({ length: n }, (_, i) => i).map(i => {
            const pos = positions[i]
            if (!pos) return null
            const hl = highlights[i]
            const isRoot = parent[i] === i
            return (
              <g key={i} style={{ transition: 'all 0.3s' }}>
                <circle
                  cx={pos.x} cy={pos.y} r={NODE_R}
                  fill={NODE_FILL[hl]}
                  stroke={NODE_STROKE[hl]}
                  strokeWidth={isRoot ? 3 : 2}
                  strokeDasharray={isRoot ? '0' : '0'}
                  style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                />
                {isRoot && (
                  <circle cx={pos.x} cy={pos.y} r={NODE_R + 4} fill="none" stroke={NODE_STROKE[hl]} strokeWidth={1} opacity={0.4} />
                )}
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={13} fontWeight="600" fontFamily="monospace"
                  fill={TEXT_COLOR[hl]}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.3s' }}
                >
                  {i}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Message */}
      {message && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-2.5">
          <span className="text-xs font-mono text-[#c9a0ff]">{message}</span>
        </div>
      )}

      {/* Arrays */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-3 space-y-3">
        <ArrayRow label="index" values={Array.from({ length: n }, (_, i) => i)} highlights={new Array(n).fill('default') as UFNodeHL[]} labelColor="#6b4d8a" />
        <ArrayRow label="parent" values={parent} highlights={highlights} />
        <ArrayRow label="rank  " values={rank} highlights={new Array(n).fill('default') as UFNodeHL[]} labelColor="#6b4d8a" />
      </div>

      <Legend />
    </div>
  )
}

function ArrayRow({ label, values, highlights, labelColor }: {
  label: string
  values: number[]
  highlights: UFNodeHL[]
  labelColor?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono w-14 text-right shrink-0" style={{ color: labelColor ?? '#a78bde' }}>
        {label}
      </span>
      <div className="flex gap-1">
        {values.map((v, i) => (
          <div
            key={i}
            className="w-8 h-8 flex items-center justify-center rounded border text-xs font-mono font-bold"
            style={{
              background: highlights[i] === 'default' ? '#1c1530' : NODE_FILL[highlights[i]],
              borderColor: highlights[i] === 'default' ? '#2a1f3d' : NODE_STROKE[highlights[i]],
              color: highlights[i] === 'default' ? '#f0eaf8' : TEXT_COLOR[highlights[i]],
              transition: 'all 0.3s',
            }}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}

function Legend() {
  const items = [
    { hl: 'default' as UFNodeHL, label: 'Default' },
    { hl: 'path' as UFNodeHL, label: 'On path' },
    { hl: 'root' as UFNodeHL, label: 'Root' },
    { hl: 'merged' as UFNodeHL, label: 'Merged' },
  ]
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {items.map(({ hl, label }) => (
        <div key={hl} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2" style={{ background: NODE_FILL[hl], borderColor: NODE_STROKE[hl] }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
