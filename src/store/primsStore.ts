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
  snaps: PrimSnap[]
  snapIndex: number
  statusText: string
  currentLine: number
  steps: Step[]

  setSpeed: (s: AnimationSpeed) => void
  setStartNode: (v: string) => void
  run: () => void
  reset: () => void
  updateNodePosition: (id: string, x: number, y: number) => void
  clearSteps: () => void
  prepareSnaps: (startLabel: string) => void
  stepForward: () => void
  stepBack: () => void
  loadFromJSON: (json: string) => void
}

function scheduleSnaps(snaps: PrimSnap[], delay: number) {
  const gen = ++animGen
  usePrimsStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snaps.length - 1
      const text = snap.done
        ? `MST complete — total weight ${snap.mstWeight}`
        : `MST has ${snap.mstEdgeCount} edge(s), weight ${snap.mstWeight}`
      usePrimsStore.setState(prev => ({
        nodes: snap.nodes,
        edges: snap.edges,
        mstWeight: snap.mstWeight,
        mstEdgeCount: snap.mstEdgeCount,
        done: snap.done,
        isAnimating: !isLast,
        statusText: isLast ? `MST complete — total weight ${snap.mstWeight}` : text,
        steps: isLast ? prev.steps : [...prev.steps, { time: nowTime(), text }],
      }))
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
  snaps: [],
  snapIndex: -1,
  statusText: 'Ready.',
  currentLine: 0,
  steps: [],

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
    const computed = computePrims(rn, re, startId)
    set({ snaps: computed, snapIndex: -1, steps: [], statusText: "Running Prim's…" })
    scheduleSnaps(computed, SPEED_DELAY[speed])
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({ ...fresh, mstWeight: 0, mstEdgeCount: 0, done: false, isAnimating: false, startNode: '1', snaps: [], snapIndex: -1, statusText: 'Ready.', steps: [] })
  },

  updateNodePosition: (id, x, y) =>
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } })),

  clearSteps: () => set({ steps: [] }),

  prepareSnaps: (startLabel: string) => {
    cancelAnim()
    const { nodes, edges } = get()
    const startId = findNodeByLabel(nodes, startLabel)
    if (!startId) return
    const rn: Record<string, PrimNode> = {}
    for (const id in nodes) rn[id] = { ...nodes[id], highlight: 'default' }
    const re: Record<string, PrimEdge> = {}
    for (const id in edges) re[id] = { ...edges[id], highlight: 'default' }
    const computed = computePrims(rn, re, startId)
    const first = computed[0]
    set({
      snaps: computed,
      snapIndex: 0,
      nodes: first.nodes,
      edges: first.edges,
      mstWeight: first.mstWeight,
      mstEdgeCount: first.mstEdgeCount,
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
      ? `MST complete — total weight ${snap.mstWeight}`
      : `MST has ${snap.mstEdgeCount} edge(s), weight ${snap.mstWeight}`
    set(prev => ({
      snapIndex: newIdx,
      nodes: snap.nodes,
      edges: snap.edges,
      mstWeight: snap.mstWeight,
      mstEdgeCount: snap.mstEdgeCount,
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
      mstWeight: snap.mstWeight,
      mstEdgeCount: snap.mstEdgeCount,
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
      const newNodes: Record<string, PrimNode> = {}
      const labelToId: Record<string, string> = {}
      nodeLabels.forEach((label, i) => {
        const id = nanoid()
        const angle = (2 * Math.PI * i) / nodeLabels.length
        const cx = 270, cy = 220, r = 160
        newNodes[id] = { id, label, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), highlight: 'default' }
        labelToId[label] = id
      })
      const newEdges: Record<string, PrimEdge> = {}
      for (const [from, to, weight] of edgeTuples) {
        if (labelToId[from] && labelToId[to] && labelToId[from] !== labelToId[to]) {
          const edge: PrimEdge = { id: nanoid(), from: labelToId[from], to: labelToId[to], weight, highlight: 'default' }
          newEdges[edge.id] = edge
        }
      }
      set({ nodes: newNodes, edges: newEdges, mstWeight: 0, mstEdgeCount: 0, done: false, isAnimating: false, snaps: [], snapIndex: -1, statusText: 'Graph loaded from JSON.', steps: [] })
    } catch {
      // ignore bad JSON
    }
  },
}))
