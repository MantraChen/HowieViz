import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type BFNodeHL = 'default' | 'current' | 'updated'
export type BFEdgeHL = 'default' | 'checking' | 'relaxed' | 'negative'

export interface BFNode {
  id: string
  label: string
  x: number
  y: number
  highlight: BFNodeHL
}

export interface BFEdge {
  id: string
  from: string
  to: string
  weight: number
  highlight: BFEdgeHL
}

interface BFSnap {
  nodes: Record<string, BFNode>
  edges: Record<string, BFEdge>
  distances: Record<string, number>
  iteration: number
  totalIterations: number
  negativeCycle: boolean
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

function buildDefaultGraph(): { nodes: Record<string, BFNode>; edges: Record<string, BFEdge> } {
  const [id1, id2, id3, id4, id5] = Array.from({ length: 5 }, () => nanoid())

  const nodes: Record<string, BFNode> = {
    [id1]: { id: id1, label: '1', x: 280, y: 60,  highlight: 'default' },
    [id2]: { id: id2, label: '2', x: 100, y: 190, highlight: 'default' },
    [id3]: { id: id3, label: '3', x: 460, y: 190, highlight: 'default' },
    [id4]: { id: id4, label: '4', x: 160, y: 340, highlight: 'default' },
    [id5]: { id: id5, label: '5', x: 400, y: 340, highlight: 'default' },
  }

  const mk = (from: string, to: string, weight: number): BFEdge => ({
    id: nanoid(), from, to, weight, highlight: 'default',
  })

  const edgeList = [
    mk(id1, id2, 6),
    mk(id1, id3, 7),
    mk(id2, id4, -4),
    mk(id2, id5, 5),
    mk(id3, id5, -3),
    mk(id4, id1, 2),
    mk(id5, id4, 3),
  ]

  const edges: Record<string, BFEdge> = {}
  for (const e of edgeList) edges[e.id] = e
  return { nodes, edges }
}

function findNodeByLabel(nodes: Record<string, BFNode>, label: string): string | null {
  for (const id in nodes) if (nodes[id].label === label) return id
  return null
}

function computeBellmanFord(
  nodes: Record<string, BFNode>,
  edges: Record<string, BFEdge>,
  startId: string,
): BFSnap[] {
  const nodeIds = Object.keys(nodes)
  const V = nodeIds.length
  const totalIterations = V - 1

  const dist: Record<string, number> = {}
  for (const id of nodeIds) dist[id] = Infinity
  dist[startId] = 0

  const edgeList = Object.values(edges)

  const snaps: BFSnap[] = []

  function makeSnap(
    iteration: number,
    highlightEdgeId: string | null,
    edgeHL: BFEdgeHL,
    updatedNodeId: string | null,
    negativeCycle = false,
    done = false,
  ): BFSnap {
    const nc: Record<string, BFNode> = {}
    for (const id of nodeIds) {
      let hl: BFNodeHL = 'default'
      if (id === updatedNodeId) hl = 'updated'
      nc[id] = { ...nodes[id], highlight: hl }
    }
    const ec: Record<string, BFEdge> = {}
    for (const e of edgeList) {
      ec[e.id] = { ...e, highlight: e.id === highlightEdgeId ? edgeHL : 'default' }
    }
    const dists: Record<string, number> = {}
    for (const id of nodeIds) dists[nodes[id].label] = dist[id]
    return { nodes: nc, edges: ec, distances: dists, iteration, totalIterations, negativeCycle, done }
  }

  // Initial snap
  snaps.push(makeSnap(0, null, 'default', null))

  for (let iter = 1; iter <= totalIterations; iter++) {
    for (const edge of edgeList) {
      // Snap: checking this edge
      snaps.push(makeSnap(iter, edge.id, 'checking', null))

      if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
        dist[edge.to] = dist[edge.from] + edge.weight
        // Snap: relaxed
        snaps.push(makeSnap(iter, edge.id, 'relaxed', edge.to))
      }
    }
  }

  // Negative cycle check
  let negativeCycle = false
  for (const edge of edgeList) {
    if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
      negativeCycle = true
      snaps.push(makeSnap(totalIterations + 1, edge.id, 'negative', null, true))
      break
    }
  }

  // Final snap
  const nc: Record<string, BFNode> = {}
  for (const id of nodeIds) nc[id] = { ...nodes[id], highlight: 'default' }
  const ec: Record<string, BFEdge> = {}
  for (const e of edgeList) ec[e.id] = { ...e, highlight: 'default' }
  const dists: Record<string, number> = {}
  for (const id of nodeIds) dists[nodes[id].label] = dist[id]
  snaps.push({ nodes: nc, edges: ec, distances: dists, iteration: totalIterations, totalIterations, negativeCycle, done: true })

  return snaps
}

const INITIAL = buildDefaultGraph()

interface BellmanFordStore {
  nodes: Record<string, BFNode>
  edges: Record<string, BFEdge>
  distances: Record<string, number>
  iteration: number
  totalIterations: number
  negativeCycle: boolean
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

function scheduleSnaps(snaps: BFSnap[], delay: number) {
  const gen = ++animGen
  useBellmanFordStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useBellmanFordStore.setState({
        nodes: snap.nodes,
        edges: snap.edges,
        distances: snap.distances,
        iteration: snap.iteration,
        totalIterations: snap.totalIterations,
        negativeCycle: snap.negativeCycle,
        done: snap.done,
        isAnimating: i < snaps.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

export const useBellmanFordStore = create<BellmanFordStore>((set, get) => ({
  nodes: { ...INITIAL.nodes },
  edges: { ...INITIAL.edges },
  distances: {},
  iteration: 0,
  totalIterations: 4,
  negativeCycle: false,
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
    const rn: Record<string, BFNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const re: Record<string, BFEdge> = {}
    for (const id in edges) re[id] = { ...edges[id], highlight: 'default' }
    scheduleSnaps(computeBellmanFord(rn, re, startId), SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({ ...fresh, distances: {}, iteration: 0, totalIterations: 4, negativeCycle: false, done: false, isAnimating: false, startNode: '1' })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),
}))
