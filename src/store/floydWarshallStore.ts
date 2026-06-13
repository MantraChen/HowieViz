import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type FWNodeHL = 'default' | 'intermediate' | 'source' | 'target'
export type FWEdgeHL = 'default' | 'active'

export interface FWNode {
  id: string
  label: string
  x: number
  y: number
  highlight: FWNodeHL
}

export interface FWEdge {
  id: string
  from: string
  to: string
  weight: number
  highlight: FWEdgeHL
}

export type FWCellHL = 'default' | 'active' | 'updated' | 'diagonal'

export interface FWSnap {
  nodes: Record<string, FWNode>
  edges: Record<string, FWEdge>
  dist: number[][]
  cellHL: FWCellHL[][]
  k: number
  i: number
  j: number
  nodeCount: number
  done: boolean
}

type Step = { time: string; text: string }

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 700, normal: 300, fast: 80 }

let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// 5 nodes, directed, non-negative, interesting paths
function buildDefaultGraph(): { nodes: Record<string, FWNode>; edges: Record<string, FWEdge>; nodeOrder: string[] } {
  const [id1, id2, id3, id4, id5] = Array.from({ length: 5 }, () => nanoid())

  const nodes: Record<string, FWNode> = {
    [id1]: { id: id1, label: '1', x: 150, y: 40,  highlight: 'default' },
    [id2]: { id: id2, label: '2', x: 255, y: 116, highlight: 'default' },
    [id3]: { id: id3, label: '3', x: 215, y: 239, highlight: 'default' },
    [id4]: { id: id4, label: '4', x: 85,  y: 239, highlight: 'default' },
    [id5]: { id: id5, label: '5', x: 45,  y: 116, highlight: 'default' },
  }

  const mk = (from: string, to: string, weight: number): FWEdge => ({
    id: nanoid(), from, to, weight, highlight: 'default',
  })

  const edgeList = [
    mk(id1, id2, 3),
    mk(id1, id5, 4),
    mk(id2, id3, 2),
    mk(id2, id5, 7),
    mk(id3, id1, 1),
    mk(id3, id4, 5),
    mk(id4, id2, 1),
    mk(id4, id5, 6),
    mk(id5, id4, 2),
  ]

  const edges: Record<string, FWEdge> = {}
  for (const e of edgeList) edges[e.id] = e
  const nodeOrder = [id1, id2, id3, id4, id5]
  return { nodes, edges, nodeOrder }
}

function computeFloydWarshall(
  nodes: Record<string, FWNode>,
  edges: Record<string, FWEdge>,
  nodeOrder: string[],
): FWSnap[] {
  const N = nodeOrder.length

  // Initialize dist matrix
  const dist: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (__, j) => (i === j ? 0 : Infinity)),
  )

  // Fill in direct edges
  for (const e of Object.values(edges)) {
    const ui = nodeOrder.indexOf(e.from)
    const vi = nodeOrder.indexOf(e.to)
    if (ui >= 0 && vi >= 0) dist[ui][vi] = Math.min(dist[ui][vi], e.weight)
  }

  const snaps: FWSnap[] = []

  function cloneDist(): number[][] {
    return dist.map(row => [...row])
  }

  function makeHL(k: number, i: number, j: number, updated: boolean): FWCellHL[][] {
    return Array.from({ length: N }, (_, ri) =>
      Array.from({ length: N }, (__, ci) => {
        if (ri === ci) return 'diagonal'
        if (ri === i && ci === j) return updated ? 'updated' : 'active'
        if (ri === k && ci === k) return 'active'
        return 'default'
      }),
    )
  }

  function makeNodeHL(k: number, i: number, j: number): Record<string, FWNode> {
    const nc: Record<string, FWNode> = {}
    for (let idx = 0; idx < N; idx++) {
      const id = nodeOrder[idx]
      let hl: FWNodeHL = 'default'
      if (idx === k) hl = 'intermediate'
      else if (idx === i) hl = 'source'
      else if (idx === j) hl = 'target'
      nc[id] = { ...nodes[id], highlight: hl }
    }
    return nc
  }

  // Initial snap
  snaps.push({
    nodes: Object.fromEntries(nodeOrder.map(id => [id, { ...nodes[id], highlight: 'default' as FWNodeHL }])),
    edges: { ...edges },
    dist: cloneDist(),
    cellHL: Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (__, j) => (i === j ? 'diagonal' : 'default') as FWCellHL),
    ),
    k: -1, i: -1, j: -1, nodeCount: N, done: false,
  })

  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j) continue

        // Snap: checking (i, j) with k as intermediate
        snaps.push({
          nodes: makeNodeHL(k, i, j),
          edges: { ...edges },
          dist: cloneDist(),
          cellHL: makeHL(k, i, j, false),
          k, i, j, nodeCount: N, done: false,
        })

        const newDist = dist[i][k] === Infinity || dist[k][j] === Infinity
          ? Infinity
          : dist[i][k] + dist[k][j]

        if (newDist < dist[i][j]) {
          dist[i][j] = newDist
          // Snap: updated
          snaps.push({
            nodes: makeNodeHL(k, i, j),
            edges: { ...edges },
            dist: cloneDist(),
            cellHL: makeHL(k, i, j, true),
            k, i, j, nodeCount: N, done: false,
          })
        }
      }
    }
  }

  // Final snap
  snaps.push({
    nodes: Object.fromEntries(nodeOrder.map(id => [id, { ...nodes[id], highlight: 'default' as FWNodeHL }])),
    edges: { ...edges },
    dist: cloneDist(),
    cellHL: Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (__, j) => (i === j ? 'diagonal' : 'default') as FWCellHL),
    ),
    k: N - 1, i: -1, j: -1, nodeCount: N, done: true,
  })

  return snaps
}

const INITIAL = buildDefaultGraph()

interface FloydWarshallStore {
  nodes: Record<string, FWNode>
  edges: Record<string, FWEdge>
  nodeOrder: string[]
  dist: number[][]
  cellHL: FWCellHL[][]
  k: number
  i: number
  j: number
  nodeCount: number
  done: boolean
  isAnimating: boolean
  speed: AnimationSpeed
  snaps: FWSnap[]
  snapIndex: number
  statusText: string
  currentLine: number
  steps: Step[]

  setSpeed: (s: AnimationSpeed) => void
  run: () => void
  reset: () => void
  updateNodePosition: (id: string, x: number, y: number) => void
  clearSteps: () => void
  prepareSnaps: () => void
  stepForward: () => void
  stepBack: () => void
  loadFromJSON: (json: string) => void
}

function scheduleSnaps(snaps: FWSnap[], delay: number) {
  const gen = ++animGen
  useFloydWarshallStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snaps.length - 1
      const text = snap.done
        ? 'All-pairs complete'
        : snap.k >= 0 && snap.i >= 0 && snap.j >= 0
        ? `Pass k=${snap.k + 1}, checking (${snap.i + 1},${snap.j + 1})`
        : 'Initialized'
      useFloydWarshallStore.setState(prev => ({
        nodes: snap.nodes,
        edges: snap.edges,
        dist: snap.dist,
        cellHL: snap.cellHL,
        k: snap.k,
        i: snap.i,
        j: snap.j,
        done: snap.done,
        isAnimating: !isLast,
        statusText: isLast ? 'All-pairs shortest paths complete' : text,
        steps: isLast ? prev.steps : [...prev.steps, { time: nowTime(), text }],
      }))
    }, i * delay)
    animTimers.push(t)
  })
}

const N = 5
const initDist: number[][] = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (__, j) => (i === j ? 0 : Infinity)),
)
const initCellHL: FWCellHL[][] = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (__, j) => (i === j ? 'diagonal' : 'default') as FWCellHL),
)

export const useFloydWarshallStore = create<FloydWarshallStore>((set, get) => ({
  nodes: { ...INITIAL.nodes },
  edges: { ...INITIAL.edges },
  nodeOrder: [...INITIAL.nodeOrder],
  dist: initDist,
  cellHL: initCellHL,
  k: -1,
  i: -1,
  j: -1,
  nodeCount: N,
  done: false,
  isAnimating: false,
  speed: 'normal',
  snaps: [],
  snapIndex: -1,
  statusText: 'Ready.',
  currentLine: 0,
  steps: [],

  setSpeed: s => set({ speed: s }),

  run: () => {
    cancelAnim()
    const { nodes, edges, nodeOrder, speed } = get()
    const rn: Record<string, FWNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const computed = computeFloydWarshall(rn, edges, nodeOrder)
    set({ snaps: computed, snapIndex: -1, steps: [], statusText: 'Running Floyd-Warshall…' })
    scheduleSnaps(computed, SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    const n = fresh.nodeOrder.length
    const emptyDist = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (__, j) => (i === j ? 0 : Infinity)),
    )
    const emptyHL = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (__, j) => (i === j ? 'diagonal' : 'default') as FWCellHL),
    )
    set({
      nodes: fresh.nodes,
      edges: fresh.edges,
      nodeOrder: fresh.nodeOrder,
      dist: emptyDist,
      cellHL: emptyHL,
      k: -1, i: -1, j: -1,
      nodeCount: n,
      done: false,
      isAnimating: false,
      snaps: [],
      snapIndex: -1,
      statusText: 'Ready.',
      steps: [],
    })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),

  clearSteps: () => set({ steps: [] }),

  prepareSnaps: () => {
    cancelAnim()
    const { nodes, edges, nodeOrder } = get()
    const rn: Record<string, FWNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const computed = computeFloydWarshall(rn, edges, nodeOrder)
    const first = computed[0]
    set({
      snaps: computed,
      snapIndex: 0,
      nodes: first.nodes,
      edges: first.edges,
      dist: first.dist,
      cellHL: first.cellHL,
      k: first.k,
      i: first.i,
      j: first.j,
      nodeCount: first.nodeCount,
      done: first.done,
      isAnimating: false,
      steps: [],
      statusText: `Step 1 / ${computed.length}`,
    })
  },

  stepForward: () => {
    const { snapIndex, snaps } = get()
    if (snapIndex >= snaps.length - 1) return
    const newIdx = snapIndex + 1
    const snap = snaps[newIdx]
    const text = snap.done
      ? 'All-pairs complete'
      : snap.k >= 0 && snap.i >= 0 && snap.j >= 0
      ? `k=${snap.k + 1} i=${snap.i + 1} j=${snap.j + 1}`
      : 'Initialized'
    set(prev => ({
      snapIndex: newIdx,
      nodes: snap.nodes,
      edges: snap.edges,
      dist: snap.dist,
      cellHL: snap.cellHL,
      k: snap.k,
      i: snap.i,
      j: snap.j,
      nodeCount: snap.nodeCount,
      done: snap.done,
      statusText: text,
      steps: [...prev.steps, { time: nowTime(), text }],
    }))
  },

  stepBack: () => {
    const { snapIndex, snaps } = get()
    if (snapIndex <= 0) return
    const newIdx = snapIndex - 1
    const snap = snaps[newIdx]
    set({
      snapIndex: newIdx,
      nodes: snap.nodes,
      edges: snap.edges,
      dist: snap.dist,
      cellHL: snap.cellHL,
      k: snap.k,
      i: snap.i,
      j: snap.j,
      nodeCount: snap.nodeCount,
      done: snap.done,
      statusText: `Step ${newIdx + 1} / ${snaps.length}`,
    })
  },

  loadFromJSON: (json: string) => {
    try {
      const data = JSON.parse(json)
      const nodeLabels: string[] = (data.nodes ?? []).map((n: unknown) => String(n))
      const edgeTuples: [string, string, number][] = (data.edges ?? []).map((e: unknown[]) => [String(e[0]), String(e[1]), Number(e[2] ?? 1)])
      cancelAnim()
      const newNodes: Record<string, FWNode> = {}
      const labelToId: Record<string, string> = {}
      const newNodeOrder: string[] = []
      nodeLabels.forEach((label, i) => {
        const id = nanoid()
        const angle = (2 * Math.PI * i) / nodeLabels.length
        const cx = 150, cy = 150, r = 120
        newNodes[id] = { id, label, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), highlight: 'default' }
        labelToId[label] = id
        newNodeOrder.push(id)
      })
      const newEdges: Record<string, FWEdge> = {}
      for (const [from, to, weight] of edgeTuples) {
        if (labelToId[from] && labelToId[to] && labelToId[from] !== labelToId[to]) {
          const edge: FWEdge = { id: nanoid(), from: labelToId[from], to: labelToId[to], weight, highlight: 'default' }
          newEdges[edge.id] = edge
        }
      }
      const n = newNodeOrder.length
      const emptyDist = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? 0 : Infinity)),
      )
      const emptyHL = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? 'diagonal' : 'default') as FWCellHL),
      )
      set({
        nodes: newNodes,
        edges: newEdges,
        nodeOrder: newNodeOrder,
        dist: emptyDist,
        cellHL: emptyHL,
        k: -1, i: -1, j: -1,
        nodeCount: n,
        done: false,
        isAnimating: false,
        snaps: [],
        snapIndex: -1,
        statusText: 'Graph loaded from JSON.',
        steps: [],
      })
    } catch {
      // ignore bad JSON
    }
  },
}))
