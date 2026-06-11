import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type NodeHighlight = 'default' | 'current' | 'visited'
export type EdgeHighlight = 'default' | 'active'

export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  highlight: NodeHighlight
  visitOrder: number | null
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  highlight: EdgeHighlight
}

interface Snap {
  nodes: Record<string, GraphNode>
  edges: Record<string, GraphEdge>
  traversalOrder: string[]
}

const SPEED_DELAY: Record<AnimationSpeed, number> = {
  slow: 800,
  normal: 400,
  fast: 150,
}

const MAX_NODES = 12

let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

function buildDefaultGraph(): { nodes: Record<string, GraphNode>; edges: Record<string, GraphEdge> } {
  const [id1, id2, id3, id4, id5, id6] = Array.from({ length: 6 }, () => nanoid())

  const nodes: Record<string, GraphNode> = {
    [id1]: { id: id1, label: '1', x: 280, y: 65,  highlight: 'default', visitOrder: null },
    [id2]: { id: id2, label: '2', x: 140, y: 175, highlight: 'default', visitOrder: null },
    [id3]: { id: id3, label: '3', x: 420, y: 175, highlight: 'default', visitOrder: null },
    [id4]: { id: id4, label: '4', x: 85,  y: 295, highlight: 'default', visitOrder: null },
    [id5]: { id: id5, label: '5', x: 280, y: 295, highlight: 'default', visitOrder: null },
    [id6]: { id: id6, label: '6', x: 475, y: 295, highlight: 'default', visitOrder: null },
  }

  const mkEdge = (from: string, to: string): GraphEdge => ({ id: nanoid(), from, to, highlight: 'default' })
  const edgeList = [
    mkEdge(id1, id2), mkEdge(id1, id3),
    mkEdge(id2, id4), mkEdge(id2, id5),
    mkEdge(id3, id5), mkEdge(id3, id6),
    mkEdge(id5, id6),
  ]
  const edges: Record<string, GraphEdge> = {}
  for (const e of edgeList) edges[e.id] = e

  return { nodes, edges }
}

function resetHighlights(
  nodes: Record<string, GraphNode>,
  edges: Record<string, GraphEdge>,
): { nodes: Record<string, GraphNode>; edges: Record<string, GraphEdge> } {
  const n: Record<string, GraphNode> = {}
  for (const id in nodes) n[id] = { ...nodes[id], highlight: 'default', visitOrder: null }
  const e: Record<string, GraphEdge> = {}
  for (const id in edges) e[id] = { ...edges[id], highlight: 'default' }
  return { nodes: n, edges: e }
}

function buildAdjList(
  nodes: Record<string, GraphNode>,
  edges: Record<string, GraphEdge>,
): Record<string, { neighborId: string; edgeId: string }[]> {
  const adj: Record<string, { neighborId: string; edgeId: string }[]> = {}
  for (const id in nodes) adj[id] = []
  for (const edgeId in edges) {
    const e = edges[edgeId]
    adj[e.from]?.push({ neighborId: e.to, edgeId })
    adj[e.to]?.push({ neighborId: e.from, edgeId })
  }
  return adj
}

function findNodeByLabel(nodes: Record<string, GraphNode>, label: string): string | null {
  for (const id in nodes) if (nodes[id].label === label) return id
  return null
}

function sortedNeighbors(
  adj: Record<string, { neighborId: string; edgeId: string }[]>,
  nodeId: string,
  nodes: Record<string, GraphNode>,
) {
  return (adj[nodeId] || []).slice().sort((a, b) =>
    nodes[a.neighborId].label.localeCompare(nodes[b.neighborId].label, undefined, { numeric: true }),
  )
}

function buildTraversalSnapshots(
  nodes: Record<string, GraphNode>,
  edges: Record<string, GraphEdge>,
  order: { nodeId: string; order: number }[],
  treeEdgeIds: Set<string>,
): Snap[] {
  const snapshots: Snap[] = []
  const processedIds = new Set<string>()

  for (let i = 0; i < order.length; i++) {
    const curId = order[i].nodeId
    processedIds.add(curId)

    const nodesCopy: Record<string, GraphNode> = {}
    for (const id in nodes) {
      const entry = order.find(b => b.nodeId === id)
      nodesCopy[id] = {
        ...nodes[id],
        highlight: id === curId ? 'current' : processedIds.has(id) ? 'visited' : 'default',
        visitOrder: processedIds.has(id) ? (entry?.order ?? null) : null,
      }
    }
    const edgesCopy: Record<string, GraphEdge> = {}
    for (const id in edges) edgesCopy[id] = { ...edges[id], highlight: treeEdgeIds.has(id) ? 'active' : 'default' }

    snapshots.push({
      nodes: nodesCopy,
      edges: edgesCopy,
      traversalOrder: order.slice(0, i + 1).map(b => nodes[b.nodeId].label),
    })
  }

  // Final: set last 'current' to 'visited'
  const finalNodes: Record<string, GraphNode> = {}
  for (const id in nodes) {
    const entry = order.find(b => b.nodeId === id)
    finalNodes[id] = { ...nodes[id], highlight: entry ? 'visited' : 'default', visitOrder: entry?.order ?? null }
  }
  const finalEdges: Record<string, GraphEdge> = {}
  for (const id in edges) finalEdges[id] = { ...edges[id], highlight: treeEdgeIds.has(id) ? 'active' : 'default' }
  snapshots.push({ nodes: finalNodes, edges: finalEdges, traversalOrder: order.map(b => nodes[b.nodeId].label) })

  return snapshots
}

function computeBFS(
  nodes: Record<string, GraphNode>,
  edges: Record<string, GraphEdge>,
  startId: string,
): Snap[] {
  const adj = buildAdjList(nodes, edges)
  const visitedSet = new Set<string>()
  const treeEdgeIds = new Set<string>()
  const order: { nodeId: string; order: number }[] = []

  const queue = [startId]
  visitedSet.add(startId)

  while (queue.length > 0) {
    const cur = queue.shift()!
    order.push({ nodeId: cur, order: order.length + 1 })
    for (const { neighborId, edgeId } of sortedNeighbors(adj, cur, nodes)) {
      if (!visitedSet.has(neighborId)) {
        visitedSet.add(neighborId)
        queue.push(neighborId)
        treeEdgeIds.add(edgeId)
      }
    }
  }

  return buildTraversalSnapshots(nodes, edges, order, treeEdgeIds)
}

function computeDFS(
  nodes: Record<string, GraphNode>,
  edges: Record<string, GraphEdge>,
  startId: string,
): Snap[] {
  const adj = buildAdjList(nodes, edges)
  const visitedSet = new Set<string>()
  const treeEdgeIds = new Set<string>()
  const order: { nodeId: string; order: number }[] = []

  function dfs(nodeId: string) {
    visitedSet.add(nodeId)
    order.push({ nodeId, order: order.length + 1 })
    for (const { neighborId, edgeId } of sortedNeighbors(adj, nodeId, nodes)) {
      if (!visitedSet.has(neighborId)) {
        treeEdgeIds.add(edgeId)
        dfs(neighborId)
      }
    }
  }

  dfs(startId)
  return buildTraversalSnapshots(nodes, edges, order, treeEdgeIds)
}

const INITIAL = buildDefaultGraph()

interface GraphStore {
  nodes: Record<string, GraphNode>
  edges: Record<string, GraphEdge>
  traversalOrder: string[]
  traversalType: 'BFS' | 'DFS' | null
  isAnimating: boolean
  speed: AnimationSpeed
  startNode: string
  addNodeInput: string
  fromNodeInput: string
  toNodeInput: string
  removeNodeInput: string

  setSpeed: (s: AnimationSpeed) => void
  setStartNode: (v: string) => void
  setAddNodeInput: (v: string) => void
  setFromNodeInput: (v: string) => void
  setToNodeInput: (v: string) => void
  setRemoveNodeInput: (v: string) => void

  addNode: (label: string) => void
  addEdge: (fromLabel: string, toLabel: string) => void
  removeNode: (label: string) => void

  runBFS: (startLabel: string) => void
  runDFS: (startLabel: string) => void

  clear: () => void
  reset: () => void

  updateNodePosition: (id: string, x: number, y: number) => void
}

function scheduleSnapshots(snapshots: Snap[], delay: number) {
  const gen = ++animGen
  useGraphStore.setState({ isAnimating: true })
  snapshots.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useGraphStore.setState({
        nodes: snap.nodes,
        edges: snap.edges,
        traversalOrder: snap.traversalOrder,
        isAnimating: i < snapshots.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: { ...INITIAL.nodes },
  edges: { ...INITIAL.edges },
  traversalOrder: [],
  traversalType: null,
  isAnimating: false,
  speed: 'normal',
  startNode: '1',
  addNodeInput: '',
  fromNodeInput: '',
  toNodeInput: '',
  removeNodeInput: '',

  setSpeed: s => set({ speed: s }),
  setStartNode: v => set({ startNode: v }),
  setAddNodeInput: v => set({ addNodeInput: v }),
  setFromNodeInput: v => set({ fromNodeInput: v }),
  setToNodeInput: v => set({ toNodeInput: v }),
  setRemoveNodeInput: v => set({ removeNodeInput: v }),

  addNode: (label: string) => {
    const { nodes } = get()
    if (Object.keys(nodes).length >= MAX_NODES) return
    if (findNodeByLabel(nodes, label) !== null) return
    const x = 60 + Math.random() * 440
    const y = 60 + Math.random() * 260
    const node: GraphNode = { id: nanoid(), label, x, y, highlight: 'default', visitOrder: null }
    set(s => ({ nodes: { ...s.nodes, [node.id]: node }, traversalOrder: [], traversalType: null }))
  },

  addEdge: (fromLabel: string, toLabel: string) => {
    const { nodes, edges } = get()
    const fromId = findNodeByLabel(nodes, fromLabel)
    const toId = findNodeByLabel(nodes, toLabel)
    if (!fromId || !toId || fromId === toId) return
    for (const id in edges) {
      const e = edges[id]
      if ((e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)) return
    }
    const edge: GraphEdge = { id: nanoid(), from: fromId, to: toId, highlight: 'default' }
    set(s => ({ edges: { ...s.edges, [edge.id]: edge }, traversalOrder: [], traversalType: null }))
  },

  removeNode: (label: string) => {
    cancelAnim()
    const { nodes, edges } = get()
    const nodeId = findNodeByLabel(nodes, label)
    if (!nodeId) return
    const newNodes = { ...nodes }
    delete newNodes[nodeId]
    const newEdges: Record<string, GraphEdge> = {}
    for (const id in edges) {
      if (edges[id].from !== nodeId && edges[id].to !== nodeId) newEdges[id] = edges[id]
    }
    set({ nodes: newNodes, edges: newEdges, traversalOrder: [], traversalType: null, isAnimating: false })
  },

  runBFS: (startLabel: string) => {
    cancelAnim()
    const { nodes, edges, speed } = get()
    const startId = findNodeByLabel(nodes, startLabel)
    if (!startId) return
    const { nodes: n, edges: e } = resetHighlights(nodes, edges)
    const snapshots = computeBFS(n, e, startId)
    set({ traversalType: 'BFS' })
    scheduleSnapshots(snapshots, SPEED_DELAY[speed])
  },

  runDFS: (startLabel: string) => {
    cancelAnim()
    const { nodes, edges, speed } = get()
    const startId = findNodeByLabel(nodes, startLabel)
    if (!startId) return
    const { nodes: n, edges: e } = resetHighlights(nodes, edges)
    const snapshots = computeDFS(n, e, startId)
    set({ traversalType: 'DFS' })
    scheduleSnapshots(snapshots, SPEED_DELAY[speed])
  },

  clear: () => {
    cancelAnim()
    set({ nodes: {}, edges: {}, traversalOrder: [], traversalType: null, isAnimating: false })
  },

  reset: () => {
    cancelAnim()
    const fresh = buildDefaultGraph()
    set({
      nodes: fresh.nodes,
      edges: fresh.edges,
      traversalOrder: [],
      traversalType: null,
      isAnimating: false,
      startNode: '1',
    })
  },

  updateNodePosition: (id: string, x: number, y: number) => {
    set(s => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], x, y } } }))
  },
}))
