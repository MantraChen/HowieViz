import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type KruskalNodeHL = 'default' | 'active'
export type KruskalEdgeHL = 'default' | 'current' | 'accepted' | 'rejected'

export interface KruskalNode {
  id: string
  label: string
  x: number
  y: number
  highlight: KruskalNodeHL
}

export interface KruskalEdge {
  id: string
  from: string
  to: string
  weight: number
  highlight: KruskalEdgeHL
}

export interface SortedEdgeItem {
  eid: string
  fromLabel: string
  toLabel: string
  weight: number
  status: 'pending' | 'current' | 'accepted' | 'rejected'
}

interface KruskalSnap {
  nodes: Record<string, KruskalNode>
  edges: Record<string, KruskalEdge>
  sortedEdges: SortedEdgeItem[]
  dsuParent: Record<string, string>
  dsuRank: Record<string, number>
  mstWeight: number
  mstEdgeCount: number
  done: boolean
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 900, normal: 450, fast: 180 }

let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

// Same 6-node undirected weighted graph as Prim's
function buildDefaultGraph(): { nodes: Record<string, KruskalNode>; edges: Record<string, KruskalEdge> } {
  const [id1, id2, id3, id4, id5, id6] = Array.from({ length: 6 }, () => nanoid())

  const nodes: Record<string, KruskalNode> = {
    [id1]: { id: id1, label: '1', x: 190, y: 55,  highlight: 'default' },
    [id2]: { id: id2, label: '2', x: 60,  y: 165, highlight: 'default' },
    [id3]: { id: id3, label: '3', x: 320, y: 165, highlight: 'default' },
    [id4]: { id: id4, label: '4', x: 95,  y: 305, highlight: 'default' },
    [id5]: { id: id5, label: '5', x: 285, y: 305, highlight: 'default' },
    [id6]: { id: id6, label: '6', x: 190, y: 390, highlight: 'default' },
  }

  const mk = (from: string, to: string, weight: number): KruskalEdge => ({
    id: nanoid(), from, to, weight, highlight: 'default',
  })

  const edgeList = [
    mk(id1, id2, 4), mk(id1, id3, 3),
    mk(id2, id3, 5), mk(id2, id4, 2),
    mk(id3, id5, 6), mk(id3, id6, 9),
    mk(id4, id5, 1), mk(id4, id6, 8),
    mk(id5, id6, 7),
  ]

  const edges: Record<string, KruskalEdge> = {}
  for (const e of edgeList) edges[e.id] = e
  return { nodes, edges }
}

// DSU (Union-Find) helpers
function find(parent: Record<string, string>, x: string): string {
  if (parent[x] !== x) parent[x] = find(parent, parent[x])
  return parent[x]
}

function union(parent: Record<string, string>, rank: Record<string, number>, a: string, b: string): boolean {
  const ra = find(parent, a)
  const rb = find(parent, b)
  if (ra === rb) return false
  if (rank[ra] < rank[rb]) { parent[ra] = rb }
  else if (rank[ra] > rank[rb]) { parent[rb] = ra }
  else { parent[rb] = ra; rank[ra]++ }
  return true
}

function computeKruskals(
  nodes: Record<string, KruskalNode>,
  edges: Record<string, KruskalEdge>,
): KruskalSnap[] {
  const nodeIds = Object.keys(nodes)
  const snaps: KruskalSnap[] = []

  // Sort edges by weight
  const sorted = Object.values(edges).sort((a, b) => a.weight - b.weight)

  // DSU
  const parent: Record<string, string> = {}
  const rank: Record<string, number> = {}
  for (const id of nodeIds) { parent[id] = id; rank[id] = 0 }

  const accepted = new Set<string>()
  const rejected = new Set<string>()
  let mstWeight = 0
  let processedCount = 0

  function makeSortedEdges(currentIdx: number): SortedEdgeItem[] {
    return sorted.map((e, i) => ({
      eid: e.id,
      fromLabel: nodes[e.from].label,
      toLabel: nodes[e.to].label,
      weight: e.weight,
      status: accepted.has(e.id)
        ? 'accepted'
        : rejected.has(e.id)
        ? 'rejected'
        : i === currentIdx
        ? 'current'
        : 'pending',
    }))
  }

  function cloneParent(): Record<string, string> { return { ...parent } }
  function cloneRank(): Record<string, number> { return { ...rank } }

  function snap(
    currentEid: string | null,
    nodeHL: Record<string, KruskalNodeHL>,
  ): KruskalSnap {
    const nc: Record<string, KruskalNode> = {}
    for (const id of nodeIds) nc[id] = { ...nodes[id], highlight: nodeHL[id] ?? 'default' }

    const ec: Record<string, KruskalEdge> = {}
    for (const eid in edges) {
      let hl: KruskalEdgeHL = 'default'
      if (accepted.has(eid)) hl = 'accepted'
      else if (rejected.has(eid)) hl = 'rejected'
      else if (eid === currentEid) hl = 'current'
      ec[eid] = { ...edges[eid], highlight: hl }
    }

    const idx = currentEid ? sorted.findIndex(e => e.id === currentEid) : processedCount
    return {
      nodes: nc,
      edges: ec,
      sortedEdges: makeSortedEdges(idx),
      dsuParent: cloneParent(),
      dsuRank: cloneRank(),
      mstWeight,
      mstEdgeCount: accepted.size,
      done: false,
    }
  }

  // Initial snap
  snaps.push(snap(null, {}))

  for (const edge of sorted) {
    const fromNodeHL: Record<string, KruskalNodeHL> = { [edge.from]: 'active', [edge.to]: 'active' }

    // Snap: considering this edge
    snaps.push(snap(edge.id, fromNodeHL))

    const merged = union(parent, rank, edge.from, edge.to)
    if (merged) {
      accepted.add(edge.id)
      mstWeight += edge.weight
    } else {
      rejected.add(edge.id)
    }
    processedCount++

    // Snap: after decision
    snaps.push(snap(null, {}))
  }

  // Final snap
  const nc: Record<string, KruskalNode> = {}
  for (const id of nodeIds) nc[id] = { ...nodes[id], highlight: 'default' }
  const ec: Record<string, KruskalEdge> = {}
  for (const eid in edges) {
    ec[eid] = { ...edges[eid], highlight: accepted.has(eid) ? 'accepted' : rejected.has(eid) ? 'rejected' : 'default' }
  }
  snaps.push({
    nodes: nc,
    edges: ec,
    sortedEdges: makeSortedEdges(-1),
    dsuParent: cloneParent(),
    dsuRank: cloneRank(),
    mstWeight,
    mstEdgeCount: accepted.size,
    done: true,
  })

  return snaps
}

const INITIAL = buildDefaultGraph()

interface KruskalsStore {
  nodes: Record<string, KruskalNode>
  edges: Record<string, KruskalEdge>
  sortedEdges: SortedEdgeItem[]
  dsuParent: Record<string, string>
  dsuRank: Record<string, number>
  mstWeight: number
  mstEdgeCount: number
  done: boolean
  isAnimating: boolean
  speed: AnimationSpeed
  currentLine: number

  setSpeed: (s: AnimationSpeed) => void
  run: () => void
  reset: () => void
  updateNodePosition: (id: string, x: number, y: number) => void
}

function scheduleSnaps(snaps: KruskalSnap[], delay: number) {
  const gen = ++animGen
  useKruskalsStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useKruskalsStore.setState({
        nodes: snap.nodes,
        edges: snap.edges,
        sortedEdges: snap.sortedEdges,
        dsuParent: snap.dsuParent,
        dsuRank: snap.dsuRank,
        mstWeight: snap.mstWeight,
        mstEdgeCount: snap.mstEdgeCount,
        done: snap.done,
        isAnimating: i < snaps.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

export const useKruskalsStore = create<KruskalsStore>((set, get) => ({
  nodes: { ...INITIAL.nodes },
  edges: { ...INITIAL.edges },
  sortedEdges: [],
  dsuParent: {},
  dsuRank: {},
  mstWeight: 0,
  mstEdgeCount: 0,
  done: false,
  isAnimating: false,
  speed: 'normal',
  currentLine: 0,

  setSpeed: s => set({ speed: s }),

  run: () => {
    cancelAnim()
    const { nodes, edges, speed } = get()
    const rn: Record<string, KruskalNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const re: Record<string, KruskalEdge> = {}
    for (const id in edges) re[id] = { ...edges[id], highlight: 'default' }
    scheduleSnaps(computeKruskals(rn, re), SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({ ...fresh, sortedEdges: [], dsuParent: {}, dsuRank: {}, mstWeight: 0, mstEdgeCount: 0, done: false, isAnimating: false })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),
}))
