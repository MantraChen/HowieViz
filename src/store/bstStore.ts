import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type BSTHighlight = 'default' | 'traversing' | 'found' | 'notFound' | 'inserted' | 'deleted'

export interface BSTNode {
  id: string
  value: number
  left: string | null
  right: string | null
  highlight: BSTHighlight
}

export type NodeMap = Record<string, BSTNode>

interface Snap {
  nodes: NodeMap
  rootId: string | null
}

const SPEED_DELAY: Record<AnimationSpeed, number> = {
  slow: 700,
  normal: 350,
  fast: 130,
}

const MAX_SIZE = 64

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

function cloneNodes(nodes: NodeMap, hl: BSTHighlight = 'default'): NodeMap {
  const out: NodeMap = {}
  for (const id in nodes) out[id] = { ...nodes[id], highlight: hl }
  return out
}

function insertRaw(nodes: NodeMap, rootId: string | null, value: number): { nodes: NodeMap; rootId: string | null } {
  const newNode: BSTNode = { id: nanoid(), value, left: null, right: null, highlight: 'default' }
  const n = { ...nodes, [newNode.id]: newNode }
  if (rootId === null) return { nodes: n, rootId: newNode.id }
  let cur = rootId
  while (true) {
    const node = n[cur]
    if (value === node.value) { delete n[newNode.id]; return { nodes: n, rootId } }
    if (value < node.value) {
      if (node.left === null) { n[cur] = { ...node, left: newNode.id }; break }
      cur = node.left
    } else {
      if (node.right === null) { n[cur] = { ...node, right: newNode.id }; break }
      cur = node.right
    }
  }
  return { nodes: n, rootId }
}

function deleteRec(
  nodes: NodeMap,
  nodeId: string | null,
  value: number,
): { nodeId: string | null; nodes: NodeMap } {
  if (nodeId === null) return { nodeId: null, nodes }
  const n = { ...nodes }
  const node = n[nodeId]
  if (value < node.value) {
    const r = deleteRec(n, node.left, value)
    r.nodes[nodeId] = { ...node, left: r.nodeId }
    return { nodeId, nodes: r.nodes }
  } else if (value > node.value) {
    const r = deleteRec(n, node.right, value)
    r.nodes[nodeId] = { ...node, right: r.nodeId }
    return { nodeId, nodes: r.nodes }
  } else {
    if (node.left === null && node.right === null) {
      delete n[nodeId]
      return { nodeId: null, nodes: n }
    } else if (node.left === null) {
      delete n[nodeId]
      return { nodeId: node.right, nodes: n }
    } else if (node.right === null) {
      delete n[nodeId]
      return { nodeId: node.left, nodes: n }
    } else {
      let succId = node.right!
      while (n[succId].left !== null) succId = n[succId].left!
      const succVal = n[succId].value
      const r = deleteRec(n, node.right, succVal)
      r.nodes[nodeId] = { ...node, value: succVal, right: r.nodeId, highlight: 'default' }
      return { nodeId, nodes: r.nodes }
    }
  }
}

function countNodes(nodes: NodeMap, id: string | null): number {
  if (id === null) return 0
  const n = nodes[id]
  return 1 + countNodes(nodes, n.left) + countNodes(nodes, n.right)
}

function buildInitialTree(): { nodes: NodeMap; rootId: string | null } {
  let nodes: NodeMap = {}
  let rootId: string | null = null
  for (const v of [8, 4, 12, 2, 6, 10, 14]) {
    const r = insertRaw(nodes, rootId, v)
    nodes = r.nodes
    rootId = r.rootId
  }
  return { nodes, rootId }
}

const INITIAL = buildInitialTree()

function scheduleSnapshots(snapshots: Snap[], delay: number, finalStatus: string) {
  const gen = ++animGen
  useBSTStore.setState({ isAnimating: true })
  snapshots.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snapshots.length - 1
      useBSTStore.setState({
        nodes: snap.nodes,
        rootId: snap.rootId,
        isAnimating: !isLast,
        ...(isLast ? { statusText: finalStatus } : {}),
      })
    }, i * delay)
    animTimers.push(t)
  })
}

interface BSTStore {
  nodes: NodeMap
  rootId: string | null
  speed: AnimationSpeed
  inputValue: string
  isAnimating: boolean
  statusText: string
  currentLine: number
  steps: { time: string; text: string }[]
  setInputValue: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  insert: (value: number) => void
  deleteBST: (value: number) => void
  search: (value: number) => void
  clear: () => void
  reset: () => void
  clearSteps: () => void
  loadFromCSV: (csv: string) => void
}

export const useBSTStore = create<BSTStore>((set, get) => ({
  nodes: cloneNodes(INITIAL.nodes),
  rootId: INITIAL.rootId,
  speed: 'normal',
  inputValue: '',
  isAnimating: false,
  statusText: 'Ready — use controls to interact.',
  currentLine: 0,
  steps: [],

  setInputValue: v => set({ inputValue: v }),
  setSpeed: s => set({ speed: s }),
  clearSteps: () => set({ steps: [] }),

  clear: () => {
    cancelAnim()
    const { nodes, rootId } = get()
    if (rootId === null) return
    const gen = ++animGen
    set({ isAnimating: true, nodes: cloneNodes(nodes, 'deleted') })
    const t = setTimeout(() => {
      if (animGen !== gen) return
      set({ nodes: {}, rootId: null, isAnimating: false, statusText: 'Tree cleared.' })
    }, 650)
    animTimers.push(t)
  },

  reset: () => {
    cancelAnim()
    const { nodes: cur } = get()
    const gen = ++animGen
    if (Object.keys(cur).length === 0) {
      const fresh = buildInitialTree()
      set({ nodes: fresh.nodes, rootId: fresh.rootId, isAnimating: false, statusText: 'Tree reset to default.' })
      return
    }
    set({ isAnimating: true, nodes: cloneNodes(cur, 'deleted') })
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const fresh = buildInitialTree()
      set({ nodes: fresh.nodes, rootId: fresh.rootId, isAnimating: false, statusText: 'Tree reset to default.' })
    }, 650)
    animTimers.push(t)
  },

  search: (value: number) => {
    cancelAnim()
    const { nodes, rootId, speed, steps } = get()
    if (rootId === null) return
    const delay = SPEED_DELAY[speed]
    const snapshots: Snap[] = []
    const visited: string[] = []
    let cur: string | null = rootId
    let foundNode = false

    while (cur !== null) {
      const curId: string = cur
      visited.push(curId)
      const snap = cloneNodes(nodes)
      for (const id of visited) snap[id] = { ...snap[id], highlight: 'traversing' }
      snapshots.push({ nodes: snap, rootId })

      const node: BSTNode = nodes[curId]
      if (value === node.value) {
        const foundSnap = cloneNodes(nodes)
        for (const id of visited.slice(0, -1)) foundSnap[id] = { ...foundSnap[id], highlight: 'traversing' }
        foundSnap[curId] = { ...foundSnap[curId], highlight: 'found' }
        snapshots.push({ nodes: foundSnap, rootId })
        foundNode = true
        break
      } else if (value < node.value) {
        cur = node.left
      } else {
        cur = node.right
      }
    }

    if (cur === null && visited.length > 0) {
      const notFoundSnap = cloneNodes(nodes)
      const lastId = visited[visited.length - 1]
      for (const id of visited.slice(0, -1)) notFoundSnap[id] = { ...notFoundSnap[id], highlight: 'traversing' }
      notFoundSnap[lastId] = { ...notFoundSnap[lastId], highlight: 'notFound' }
      snapshots.push({ nodes: notFoundSnap, rootId })
    }

    snapshots.push({ nodes: cloneNodes(nodes), rootId })

    const finalStatus = foundNode ? `Found ${value}` : `${value} not found`
    const stepText = foundNode ? `Search: Found ${value} in tree` : `Search: ${value} not found`
    set({ steps: [...steps, { time: nowTime(), text: stepText }] })
    scheduleSnapshots(snapshots, delay, finalStatus)
  },

  insert: (value: number) => {
    cancelAnim()
    const { nodes, rootId, speed, steps } = get()
    if (countNodes(nodes, rootId) >= MAX_SIZE) return
    const delay = SPEED_DELAY[speed]
    const snapshots: Snap[] = []

    const path: string[] = []
    let cur: string | null = rootId
    let parentId: string | null = null
    let goLeft = false

    while (cur !== null) {
      const node = nodes[cur]
      if (value === node.value) return
      path.push(cur)
      parentId = cur
      if (value < node.value) { goLeft = true; cur = node.left }
      else { goLeft = false; cur = node.right }
    }

    for (let i = 0; i < path.length; i++) {
      const snap = cloneNodes(nodes)
      for (let j = 0; j <= i; j++) snap[path[j]] = { ...snap[path[j]], highlight: 'traversing' }
      snapshots.push({ nodes: snap, rootId })
    }

    const newNode: BSTNode = { id: nanoid(), value, left: null, right: null, highlight: 'inserted' }
    const newNodes = { ...nodes, [newNode.id]: newNode }
    let newRootId = rootId

    if (parentId === null) {
      newRootId = newNode.id
    } else {
      const parent = { ...newNodes[parentId] }
      if (goLeft) parent.left = newNode.id
      else parent.right = newNode.id
      newNodes[parentId] = parent
    }

    const insertedSnap = cloneNodes(newNodes)
    insertedSnap[newNode.id] = { ...insertedSnap[newNode.id], highlight: 'inserted' }
    snapshots.push({ nodes: insertedSnap, rootId: newRootId })
    snapshots.push({ nodes: cloneNodes(newNodes), rootId: newRootId })

    set({ steps: [...steps, { time: nowTime(), text: `Insert: ${value} added to tree` }] })
    scheduleSnapshots(snapshots, delay, `Inserted ${value}`)
  },

  deleteBST: (value: number) => {
    cancelAnim()
    const { nodes, rootId, speed, steps } = get()
    if (rootId === null) return
    const delay = SPEED_DELAY[speed]
    const snapshots: Snap[] = []

    const visited: string[] = []
    let cur: string | null = rootId
    let found = false

    while (cur !== null) {
      const curId: string = cur
      visited.push(curId)
      const snap = cloneNodes(nodes)
      for (const id of visited) snap[id] = { ...snap[id], highlight: 'traversing' }
      snapshots.push({ nodes: snap, rootId })

      const node: BSTNode = nodes[curId]
      if (value === node.value) { found = true; break }
      else if (value < node.value) cur = node.left
      else cur = node.right
    }

    if (!found) {
      const lastSnap = cloneNodes(nodes)
      const lastId = visited[visited.length - 1]
      if (lastId) lastSnap[lastId] = { ...lastSnap[lastId], highlight: 'notFound' }
      snapshots.push({ nodes: lastSnap, rootId })
      snapshots.push({ nodes: cloneNodes(nodes), rootId })
      set({ steps: [...steps, { time: nowTime(), text: `Delete: ${value} not found` }] })
      scheduleSnapshots(snapshots, delay, `${value} not found`)
      return
    }

    const delSnap = cloneNodes(nodes)
    const targetId = visited[visited.length - 1]
    for (const id of visited.slice(0, -1)) delSnap[id] = { ...delSnap[id], highlight: 'traversing' }
    delSnap[targetId] = { ...delSnap[targetId], highlight: 'deleted' }
    snapshots.push({ nodes: delSnap, rootId })

    const result = deleteRec(nodes, rootId, value)
    snapshots.push({ nodes: cloneNodes(result.nodes), rootId: result.nodeId })

    set({ steps: [...steps, { time: nowTime(), text: `Delete: ${value} removed from tree` }] })
    scheduleSnapshots(snapshots, delay, `Deleted ${value}`)
  },

  loadFromCSV: (csv: string) => {
    cancelAnim()
    const vals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    if (vals.length === 0) return
    let n: NodeMap = {}
    let r: string | null = null
    for (const v of vals) {
      const result = insertRaw(n, r, v)
      n = result.nodes
      r = result.rootId
    }
    set({ nodes: n, rootId: r, isAnimating: false, statusText: `Loaded ${vals.length} values` })
  },
}))
