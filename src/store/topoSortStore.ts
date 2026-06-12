import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type TopoNodeHL = 'default' | 'inQueue' | 'processing' | 'done'
export type TopoEdgeHL = 'default' | 'active' | 'removed'

export interface TopoNode {
  id: string
  label: string
  x: number
  y: number
  highlight: TopoNodeHL
  inDegree: number
}

export interface TopoEdge {
  id: string
  from: string
  to: string
  highlight: TopoEdgeHL
}

interface TopoSnap {
  nodes: Record<string, TopoNode>
  edges: Record<string, TopoEdge>
  queue: string[]
  result: string[]
  cycleDetected: boolean
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

// DAG: 7 nodes, 9 edges
// Edges: 1→3, 1→4, 2→4, 2→5, 3→6, 4→6, 4→7, 5→7, 6→7
function buildDefaultGraph(): { nodes: Record<string, TopoNode>; edges: Record<string, TopoEdge> } {
  const [id1, id2, id3, id4, id5, id6, id7] = Array.from({ length: 7 }, () => nanoid())

  const nodes: Record<string, TopoNode> = {
    [id1]: { id: id1, label: '1', x: 90,  y: 120, highlight: 'default', inDegree: 0 },
    [id2]: { id: id2, label: '2', x: 90,  y: 290, highlight: 'default', inDegree: 0 },
    [id3]: { id: id3, label: '3', x: 240, y: 60,  highlight: 'default', inDegree: 1 },
    [id4]: { id: id4, label: '4', x: 240, y: 210, highlight: 'default', inDegree: 2 },
    [id5]: { id: id5, label: '5', x: 240, y: 360, highlight: 'default', inDegree: 1 },
    [id6]: { id: id6, label: '6', x: 390, y: 130, highlight: 'default', inDegree: 2 },
    [id7]: { id: id7, label: '7', x: 490, y: 250, highlight: 'default', inDegree: 3 },
  }

  const mk = (from: string, to: string): TopoEdge => ({
    id: nanoid(), from, to, highlight: 'default',
  })

  const edgeList = [
    mk(id1, id3), mk(id1, id4),
    mk(id2, id4), mk(id2, id5),
    mk(id3, id6),
    mk(id4, id6), mk(id4, id7),
    mk(id5, id7),
    mk(id6, id7),
  ]

  const edges: Record<string, TopoEdge> = {}
  for (const e of edgeList) edges[e.id] = e
  return { nodes, edges }
}

function computeTopoSort(
  nodes: Record<string, TopoNode>,
  edges: Record<string, TopoEdge>,
): TopoSnap[] {
  const snaps: TopoSnap[] = []

  const inDeg: Record<string, number> = {}
  for (const id in nodes) inDeg[id] = nodes[id].inDegree

  // Adjacency list
  const adj: Record<string, string[]> = {}
  const edgeByFromTo: Record<string, string> = {} // "from,to" -> edgeId
  for (const id in nodes) adj[id] = []
  for (const eid in edges) {
    const e = edges[eid]
    adj[e.from].push(e.to)
    edgeByFromTo[`${e.from},${e.to}`] = eid
  }

  const result: string[] = []
  const removedEdges = new Set<string>()
  const doneNodes = new Set<string>()

  // Start with zero in-degree nodes
  const queue: string[] = Object.keys(nodes).filter(id => inDeg[id] === 0)

  function snap(processingId: string | null, activeEdges: Set<string>): TopoSnap {
    const nc: Record<string, TopoNode> = {}
    for (const id in nodes) {
      let hl: TopoNodeHL = 'default'
      if (doneNodes.has(id)) hl = 'done'
      else if (id === processingId) hl = 'processing'
      else if (queue.includes(id)) hl = 'inQueue'
      nc[id] = { ...nodes[id], highlight: hl, inDegree: inDeg[id] }
    }
    const ec: Record<string, TopoEdge> = {}
    for (const eid in edges) {
      let hl: TopoEdgeHL = 'default'
      if (removedEdges.has(eid)) hl = 'removed'
      else if (activeEdges.has(eid)) hl = 'active'
      ec[eid] = { ...edges[eid], highlight: hl }
    }
    const queueLabels = queue.map(id => nodes[id].label)
    const resultLabels = result.map(id => nodes[id].label)
    return { nodes: nc, edges: ec, queue: queueLabels, result: resultLabels, cycleDetected: false, done: false }
  }

  // Initial snap
  snaps.push(snap(null, new Set()))

  while (queue.length > 0) {
    const cur = queue.shift()!
    // Snap: processing current node
    snaps.push(snap(cur, new Set()))

    doneNodes.add(cur)
    result.push(cur)

    const activeEdges = new Set<string>()
    for (const neighbor of adj[cur]) {
      const eid = edgeByFromTo[`${cur},${neighbor}`]
      if (eid) {
        activeEdges.add(eid)
        inDeg[neighbor]--
        if (inDeg[neighbor] === 0) queue.push(neighbor)
      }
    }

    // Snap: removing edges from current node
    if (activeEdges.size > 0) {
      snaps.push(snap(cur, activeEdges))
      for (const eid of activeEdges) removedEdges.add(eid)
    }

    // Snap: after processing
    snaps.push(snap(null, new Set()))
  }

  const cycleDetected = result.length < Object.keys(nodes).length
  const resultLabels = result.map(id => nodes[id].label)

  // Final snap
  const nc: Record<string, TopoNode> = {}
  for (const id in nodes) {
    nc[id] = { ...nodes[id], highlight: doneNodes.has(id) ? 'done' : 'default', inDegree: inDeg[id] }
  }
  const ec: Record<string, TopoEdge> = {}
  for (const eid in edges) {
    ec[eid] = { ...edges[eid], highlight: removedEdges.has(eid) ? 'removed' : 'default' }
  }
  snaps.push({
    nodes: nc, edges: ec,
    queue: [],
    result: resultLabels,
    cycleDetected,
    done: true,
  })

  return snaps
}

const INITIAL = buildDefaultGraph()

interface TopoSortStore {
  nodes: Record<string, TopoNode>
  edges: Record<string, TopoEdge>
  queue: string[]
  result: string[]
  cycleDetected: boolean
  done: boolean
  isAnimating: boolean
  speed: AnimationSpeed

  setSpeed: (s: AnimationSpeed) => void
  run: () => void
  reset: () => void
  updateNodePosition: (id: string, x: number, y: number) => void
}

function scheduleSnaps(snaps: TopoSnap[], delay: number) {
  const gen = ++animGen
  useTopoSortStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useTopoSortStore.setState({
        nodes: snap.nodes,
        edges: snap.edges,
        queue: snap.queue,
        result: snap.result,
        cycleDetected: snap.cycleDetected,
        done: snap.done,
        isAnimating: i < snaps.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

export const useTopoSortStore = create<TopoSortStore>((set, get) => ({
  nodes: { ...INITIAL.nodes },
  edges: { ...INITIAL.edges },
  queue: [],
  result: [],
  cycleDetected: false,
  done: false,
  isAnimating: false,
  speed: 'normal',

  setSpeed: s => set({ speed: s }),

  run: () => {
    cancelAnim()
    const { nodes, edges, speed } = get()
    const rn: Record<string, TopoNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const re: Record<string, TopoEdge> = {}
    for (const id in edges) re[id] = { ...edges[id], highlight: 'default' }
    scheduleSnaps(computeTopoSort(rn, re), SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({ ...fresh, queue: [], result: [], cycleDetected: false, done: false, isAnimating: false })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),
}))
