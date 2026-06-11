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

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 900, normal: 450, fast: 180 }

let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
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

  setSpeed: (s: AnimationSpeed) => void
  setStartNode: (v: string) => void
  runDijkstra: (startLabel: string) => void
  reset: () => void
  updateNodePosition: (id: string, x: number, y: number) => void
}

function scheduleSnaps(snaps: DijkSnap[], delay: number) {
  const gen = ++animGen
  useDijkstraStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useDijkstraStore.setState({
        nodes: snap.nodes,
        edges: snap.edges,
        distances: snap.distances,
        settled: snap.settled,
        currentNode: snap.current,
        isAnimating: i < snaps.length - 1,
      })
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
    scheduleSnaps(computeDijkstra(rn, re, startId), SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({ ...fresh, distances: {}, settled: [], currentNode: null, isAnimating: false, startNode: '1' })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),
}))
