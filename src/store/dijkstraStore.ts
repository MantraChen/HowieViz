import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type DijkNodeHL = 'default' | 'current' | 'settled'
export type DijkEdgeHL = 'default' | 'relaxed'

export interface DijkNode {
  id: string
  label: string
  x: number
  y: number
  highlight: DijkNodeHL
}

export interface DijkEdge {
  id: string
  from: string
  to: string
  weight: number
  highlight: DijkEdgeHL
}

interface DijkSnap {
  nodes: Record<string, DijkNode>
  edges: Record<string, DijkEdge>
  distances: Record<string, number>
  settled: string[]
  current: string | null
}

type Step = { time: string; text: string }

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 900, normal: 450, fast: 180 }

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

function buildDefaultGraph(): { nodes: Record<string, DijkNode>; edges: Record<string, DijkEdge> } {
  const [id1, id2, id3, id4, id5, id6] = Array.from({ length: 6 }, () => nanoid())

  const nodes: Record<string, DijkNode> = {
    [id1]: { id: id1, label: '1', x: 280, y: 60,  highlight: 'default' },
    [id2]: { id: id2, label: '2', x: 110, y: 170, highlight: 'default' },
    [id3]: { id: id3, label: '3', x: 450, y: 170, highlight: 'default' },
    [id4]: { id: id4, label: '4', x: 185, y: 300, highlight: 'default' },
    [id5]: { id: id5, label: '5', x: 375, y: 300, highlight: 'default' },
    [id6]: { id: id6, label: '6', x: 280, y: 380, highlight: 'default' },
  }

  const mk = (from: string, to: string, weight: number): DijkEdge => ({
    id: nanoid(), from, to, weight, highlight: 'default',
  })

  const edgeList = [
    mk(id1, id2, 4), mk(id1, id3, 2),
    mk(id2, id3, 1), mk(id2, id4, 5),
    mk(id3, id5, 10), mk(id3, id4, 8),
    mk(id4, id6, 2),
    mk(id5, id4, 2), mk(id5, id6, 3),
  ]

  const edges: Record<string, DijkEdge> = {}
  for (const e of edgeList) edges[e.id] = e
  return { nodes, edges }
}

function findNodeByLabel(nodes: Record<string, DijkNode>, label: string): string | null {
  for (const id in nodes) if (nodes[id].label === label) return id
  return null
}

function computeDijkstra(
  nodes: Record<string, DijkNode>,
  edges: Record<string, DijkEdge>,
  startId: string,
): DijkSnap[] {
  const dist: Record<string, number> = {}
  for (const id in nodes) dist[id] = Infinity
  dist[startId] = 0

  const settled = new Set<string>()
  const settledOrder: string[] = []

  const adj: Record<string, { to: string; eid: string; w: number }[]> = {}
  for (const id in nodes) adj[id] = []
  for (const eid in edges) {
    const e = edges[eid]
    adj[e.from].push({ to: e.to, eid, w: e.weight })
  }

  const snaps: DijkSnap[] = []

  function snap(curId: string | null, relaxed: Set<string>): DijkSnap {
    const nc: Record<string, DijkNode> = {}
    for (const id in nodes) {
      let hl: DijkNodeHL = settled.has(id) ? 'settled' : 'default'
      if (id === curId) hl = 'current'
      nc[id] = { ...nodes[id], highlight: hl }
    }
    const ec: Record<string, DijkEdge> = {}
    for (const eid in edges) {
      ec[eid] = { ...edges[eid], highlight: relaxed.has(eid) ? 'relaxed' : 'default' }
    }
    const dists: Record<string, number> = {}
    for (const id in nodes) dists[nodes[id].label] = dist[id]
    return {
      nodes: nc, edges: ec,
      distances: dists,
      settled: settledOrder.map(id => nodes[id].label),
      current: curId ? nodes[curId].label : null,
    }
  }

  snaps.push(snap(startId, new Set()))

  while (true) {
    let minId: string | null = null
    let minD = Infinity
    for (const id in nodes) {
      if (!settled.has(id) && dist[id] < minD) { minD = dist[id]; minId = id }
    }
    if (minId === null) break

    settled.add(minId)
    settledOrder.push(minId)

    const relaxed = new Set<string>()
    for (const { to, eid, w } of adj[minId]) {
      if (!settled.has(to) && dist[minId] + w < dist[to]) {
        dist[to] = dist[minId] + w
        relaxed.add(eid)
      }
    }
    snaps.push(snap(minId, relaxed))
  }

  // Final snap: all settled
  const nc: Record<string, DijkNode> = {}
  for (const id in nodes) nc[id] = { ...nodes[id], highlight: 'settled' }
  const dists: Record<string, number> = {}
  for (const id in nodes) dists[nodes[id].label] = dist[id]
  snaps.push({
    nodes: nc,
    edges: Object.fromEntries(Object.entries(edges).map(([k, v]) => [k, { ...v, highlight: 'default' as DijkEdgeHL }])),
    distances: dists,
    settled: settledOrder.map(id => nodes[id].label),
    current: null,
  })

  return snaps
}

const INITIAL = buildDefaultGraph()

interface DijkstraStore {
  nodes: Record<string, DijkNode>
  edges: Record<string, DijkEdge>
  distances: Record<string, number>
  settled: string[]
  currentNode: string | null
  isAnimating: boolean
  speed: AnimationSpeed
  startNode: string
  snaps: DijkSnap[]
  snapIndex: number
  statusText: string
  currentLine: number
  steps: Step[]

  setSpeed: (s: AnimationSpeed) => void
  setStartNode: (v: string) => void
  runDijkstra: (startLabel: string) => void
  reset: () => void
  updateNodePosition: (id: string, x: number, y: number) => void
  clearSteps: () => void
  prepareSnaps: (startLabel: string) => void
  stepForward: () => void
  stepBack: () => void
  loadFromJSON: (json: string) => void
}

function scheduleSnaps(snaps: DijkSnap[], delay: number) {
  const gen = ++animGen
  useDijkstraStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snaps.length - 1
      const text = snap.current ? `Settled node ${snap.current}` : 'Algorithm complete'
      useDijkstraStore.setState(prev => ({
        nodes: snap.nodes,
        edges: snap.edges,
        distances: snap.distances,
        settled: snap.settled,
        currentNode: snap.current,
        isAnimating: !isLast,
        statusText: isLast ? `Done — settled ${snap.settled.length} nodes` : text,
        steps: isLast ? prev.steps : [...prev.steps, { time: nowTime(), text }],
      }))
    }, i * delay)
    animTimers.push(t)
  })
}

export const useDijkstraStore = create<DijkstraStore>((set, get) => ({
  nodes: { ...INITIAL.nodes },
  edges: { ...INITIAL.edges },
  distances: {},
  settled: [],
  currentNode: null,
  isAnimating: false,
  speed: 'normal',
  startNode: '1',
  snaps: [],
  snapIndex: -1,
  statusText: 'Ready.',
  currentLine: 0,
  steps: [],

  setSpeed: s => set({ speed: s }),
  setStartNode: v => set({ startNode: v }),

  runDijkstra: (startLabel: string) => {
    cancelAnim()
    const { nodes, edges, speed } = get()
    const startId = findNodeByLabel(nodes, startLabel)
    if (!startId) return
    const rn: Record<string, DijkNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const re: Record<string, DijkEdge> = {}
    for (const id in edges) re[id] = { ...edges[id], highlight: 'default' }
    const computed = computeDijkstra(rn, re, startId)
    set({ snaps: computed, snapIndex: -1, steps: [], statusText: 'Running Dijkstra…' })
    scheduleSnaps(computed, SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({ ...fresh, distances: {}, settled: [], currentNode: null, isAnimating: false, startNode: '1', snaps: [], snapIndex: -1, statusText: 'Ready.', steps: [] })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),

  clearSteps: () => set({ steps: [] }),

  prepareSnaps: (startLabel: string) => {
    cancelAnim()
    const { nodes, edges } = get()
    const startId = findNodeByLabel(nodes, startLabel)
    if (!startId) return
    const rn: Record<string, DijkNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const re: Record<string, DijkEdge> = {}
    for (const id in edges) re[id] = { ...edges[id], highlight: 'default' }
    const computed = computeDijkstra(rn, re, startId)
    const first = computed[0]
    set({
      snaps: computed,
      snapIndex: 0,
      nodes: first.nodes,
      edges: first.edges,
      distances: first.distances,
      settled: first.settled,
      currentNode: first.current,
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
    const text = snap.current ? `Settled node ${snap.current}` : 'Algorithm complete'
    set(prev => ({
      snapIndex: newIdx,
      nodes: snap.nodes,
      edges: snap.edges,
      distances: snap.distances,
      settled: snap.settled,
      currentNode: snap.current,
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
      distances: snap.distances,
      settled: snap.settled,
      currentNode: snap.current,
      statusText: `Step ${newIdx + 1} / ${snaps.length}`,
    })
  },

  loadFromJSON: (json: string) => {
    try {
      const data = JSON.parse(json)
      const nodeLabels: string[] = (data.nodes ?? []).map((n: unknown) => String(n))
      const edgeTuples: [string, string, number][] = (data.edges ?? []).map((e: unknown[]) => [String(e[0]), String(e[1]), Number(e[2] ?? 1)])
      cancelAnim()
      const newNodes: Record<string, DijkNode> = {}
      const labelToId: Record<string, string> = {}
      nodeLabels.forEach((label, i) => {
        const id = nanoid()
        const angle = (2 * Math.PI * i) / nodeLabels.length
        const cx = 270, cy = 220, r = 150
        newNodes[id] = { id, label, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), highlight: 'default' }
        labelToId[label] = id
      })
      const newEdges: Record<string, DijkEdge> = {}
      for (const [from, to, weight] of edgeTuples) {
        if (labelToId[from] && labelToId[to] && labelToId[from] !== labelToId[to]) {
          const edge: DijkEdge = { id: nanoid(), from: labelToId[from], to: labelToId[to], weight, highlight: 'default' }
          newEdges[edge.id] = edge
        }
      }
      set({ nodes: newNodes, edges: newEdges, distances: {}, settled: [], currentNode: null, isAnimating: false, snaps: [], snapIndex: -1, statusText: 'Graph loaded from JSON.' })
    } catch {
      // ignore bad JSON
    }
  },
}))
