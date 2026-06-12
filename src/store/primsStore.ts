import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type PrimNodeHL = 'default' | 'start' | 'inMST'
export type PrimEdgeHL = 'default' | 'mst' | 'frontier' | 'rejected'

export interface PrimNode {
  id: string
  label: string
  x: number
  y: number
  highlight: PrimNodeHL
}

export interface PrimEdge {
  id: string
  from: string
  to: string
  weight: number
  highlight: PrimEdgeHL
}

interface PrimSnap {
  nodes: Record<string, PrimNode>
  edges: Record<string, PrimEdge>
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

// 6 nodes, undirected weighted graph
function buildDefaultGraph(): { nodes: Record<string, PrimNode>; edges: Record<string, PrimEdge> } {
  const [id1, id2, id3, id4, id5, id6] = Array.from({ length: 6 }, () => nanoid())

  const nodes: Record<string, PrimNode> = {
    [id1]: { id: id1, label: '1', x: 270, y: 55,  highlight: 'default' },
    [id2]: { id: id2, label: '2', x: 100, y: 165, highlight: 'default' },
    [id3]: { id: id3, label: '3', x: 440, y: 165, highlight: 'default' },
    [id4]: { id: id4, label: '4', x: 160, y: 295, highlight: 'default' },
    [id5]: { id: id5, label: '5', x: 380, y: 295, highlight: 'default' },
    [id6]: { id: id6, label: '6', x: 270, y: 380, highlight: 'default' },
  }

  const mk = (from: string, to: string, weight: number): PrimEdge => ({
    id: nanoid(), from, to, weight, highlight: 'default',
  })

  const edgeList = [
    mk(id1, id2, 4), mk(id1, id3, 3),
    mk(id2, id3, 5), mk(id2, id4, 2),
    mk(id3, id5, 6), mk(id3, id6, 9),
    mk(id4, id5, 1), mk(id4, id6, 8),
    mk(id5, id6, 7),
  ]

  const edges: Record<string, PrimEdge> = {}
  for (const e of edgeList) edges[e.id] = e
  return { nodes, edges }
}

function findNodeByLabel(nodes: Record<string, PrimNode>, label: string): string | null {
  for (const id in nodes) if (nodes[id].label === label) return id
  return null
}

function computePrims(
  nodes: Record<string, PrimNode>,
  edges: Record<string, PrimEdge>,
  startId: string,
): PrimSnap[] {
  const nodeIds = Object.keys(nodes)
  const snaps: PrimSnap[] = []

  // Build adjacency: for undirected, both directions
  const adj: Record<string, { to: string; eid: string; w: number }[]> = {}
  for (const id of nodeIds) adj[id] = []
  for (const eid in edges) {
    const e = edges[eid]
    adj[e.from].push({ to: e.to, eid, w: e.weight })
    adj[e.to].push({ to: e.from, eid, w: e.weight })
  }

  const inMST = new Set<string>()
  const mstEdges = new Set<string>()
  let mstWeight = 0

  function snap(candidateEdges: Set<string>): PrimSnap {
    const nc: Record<string, PrimNode> = {}
    for (const id of nodeIds) {
      let hl: PrimNodeHL = 'default'
      if (id === startId) hl = inMST.has(id) ? 'inMST' : 'start'
      else if (inMST.has(id)) hl = 'inMST'
      nc[id] = { ...nodes[id], highlight: hl }
    }
    const ec: Record<string, PrimEdge> = {}
    for (const eid in edges) {
      let hl: PrimEdgeHL = 'default'
      if (mstEdges.has(eid)) hl = 'mst'
      else if (candidateEdges.has(eid)) hl = 'frontier'
      ec[eid] = { ...edges[eid], highlight: hl }
    }
    return { nodes: nc, edges: ec, mstWeight, mstEdgeCount: mstEdges.size, done: false }
  }

  inMST.add(startId)

  // Get initial frontier
  const candidates = new Set<string>()
  for (const { eid } of adj[startId]) {
    const e = edges[eid]
    const other = e.from === startId ? e.to : e.from
    if (!inMST.has(other)) candidates.add(eid)
  }

  snaps.push(snap(candidates))

  while (inMST.size < nodeIds.length && candidates.size > 0) {
    // Find minimum frontier edge
    let minEid: string | null = null
    let minW = Infinity
    for (const eid of candidates) {
      const e = edges[eid]
      const other = inMST.has(e.from) ? e.to : e.from
      if (!inMST.has(other) && e.weight < minW) {
        minW = e.weight
        minEid = eid
      }
    }
    if (!minEid) break

    const pickedEdge = edges[minEid]
    const newNode = inMST.has(pickedEdge.from) ? pickedEdge.to : pickedEdge.from

    mstEdges.add(minEid)
    inMST.add(newNode)
    mstWeight += pickedEdge.weight
    candidates.delete(minEid)

    // Remove frontier edges that now connect two MST nodes
    for (const eid of [...candidates]) {
      const e = edges[eid]
      if (inMST.has(e.from) && inMST.has(e.to)) candidates.delete(eid)
    }

    // Add new frontier edges from newNode
    for (const { eid } of adj[newNode]) {
      const e = edges[eid]
      const other = e.from === newNode ? e.to : e.from
      if (!inMST.has(other) && !mstEdges.has(eid)) candidates.add(eid)
    }

    snaps.push(snap(candidates))
  }

  // Final snap
  const nc: Record<string, PrimNode> = {}
  for (const id of nodeIds) {
    nc[id] = { ...nodes[id], highlight: id === startId ? 'inMST' : inMST.has(id) ? 'inMST' : 'default' }
  }
  const ec: Record<string, PrimEdge> = {}
  for (const eid in edges) {
    ec[eid] = { ...edges[eid], highlight: mstEdges.has(eid) ? 'mst' : 'default' }
  }
  snaps.push({ nodes: nc, edges: ec, mstWeight, mstEdgeCount: mstEdges.size, done: true })

  return snaps
}

const INITIAL = buildDefaultGraph()

interface PrimsStore {
  nodes: Record<string, PrimNode>
  edges: Record<string, PrimEdge>
  mstWeight: number
  mstEdgeCount: number
  done: boolean
  isAnimating: boolean
  speed: AnimationSpeed
  startNode: string

  setSpeed: (s: AnimationSpeed) => void
  setStartNode: (v: string) => void
  run: () => void
  reset: () => void
  updateNodePosition: (id: string, x: number, y: number) => void
}

function scheduleSnaps(snaps: PrimSnap[], delay: number) {
  const gen = ++animGen
  usePrimsStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      usePrimsStore.setState({
        nodes: snap.nodes,
        edges: snap.edges,
        mstWeight: snap.mstWeight,
        mstEdgeCount: snap.mstEdgeCount,
        done: snap.done,
        isAnimating: i < snaps.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

export const usePrimsStore = create<PrimsStore>((set, get) => ({
  nodes: { ...INITIAL.nodes },
  edges: { ...INITIAL.edges },
  mstWeight: 0,
  mstEdgeCount: 0,
  done: false,
  isAnimating: false,
  speed: 'normal',
  startNode: '1',

  setSpeed: s => set({ speed: s }),
  setStartNode: v => set({ startNode: v }),

  run: () => {
    cancelAnim()
    const { nodes, edges, speed, startNode } = get()
    const startId = findNodeByLabel(nodes, startNode)
    if (!startId) return
    const rn: Record<string, PrimNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const re: Record<string, PrimEdge> = {}
    for (const id in edges) re[id] = { ...edges[id], highlight: 'default' }
    scheduleSnaps(computePrims(rn, re, startId), SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({ ...fresh, mstWeight: 0, mstEdgeCount: 0, done: false, isAnimating: false, startNode: '1' })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),
}))
