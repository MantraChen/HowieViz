import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type AVLHighlight = 'default' | 'traversing' | 'found' | 'notFound' | 'inserted' | 'deleted' | 'rotating'

export interface AVLNode {
  id: string
  value: number
  left: string | null
  right: string | null
  height: number
  highlight: AVLHighlight
}

export type AVLNodeMap = Record<string, AVLNode>

interface Snap {
  nodes: AVLNodeMap
  rootId: string | null
  rotationLabel?: string
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 700, normal: 350, fast: 130 }

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

// --- Pure tree helpers ---

function nodeH(nodes: AVLNodeMap, id: string | null): number {
  return id === null ? 0 : nodes[id].height
}

function bf(nodes: AVLNodeMap, id: string): number {
  const n = nodes[id]
  return nodeH(nodes, n.left) - nodeH(nodes, n.right)
}

function updH(nodes: AVLNodeMap, id: string): AVLNodeMap {
  const n = nodes[id]
  const h = 1 + Math.max(nodeH(nodes, n.left), nodeH(nodes, n.right))
  if (h === n.height) return nodes
  return { ...nodes, [id]: { ...n, height: h } }
}

function rotRight(nodes: AVLNodeMap, y: string): { nodes: AVLNodeMap; newRoot: string } {
  const Y = nodes[y]
  const x = Y.left!
  const X = nodes[x]
  let n = { ...nodes, [y]: { ...Y, left: X.right }, [x]: { ...X, right: y } }
  n = updH(n, y)
  n = updH(n, x)
  return { nodes: n, newRoot: x }
}

function rotLeft(nodes: AVLNodeMap, x: string): { nodes: AVLNodeMap; newRoot: string } {
  const X = nodes[x]
  const y = X.right!
  const Y = nodes[y]
  let n = { ...nodes, [x]: { ...X, right: Y.left }, [y]: { ...Y, left: x } }
  n = updH(n, x)
  n = updH(n, y)
  return { nodes: n, newRoot: y }
}

interface RebalResult {
  nodes: AVLNodeMap
  newRoot: string
  rotationType?: string
}

function rebalance(nodes: AVLNodeMap, id: string): RebalResult {
  let n = updH(nodes, id)
  const b = bf(n, id)

  if (b > 1) {
    const lc = n[id].left!
    if (bf(n, lc) >= 0) {
      const r = rotRight(n, id)
      return { ...r, rotationType: 'Right Rotation' }
    }
    const lr = rotLeft(n, lc)
    n = { ...lr.nodes, [id]: { ...n[id], left: lr.newRoot } }
    n = updH(n, id)
    const r = rotRight(n, id)
    return { ...r, rotationType: 'Left-Right Rotation' }
  }

  if (b < -1) {
    const rc = n[id].right!
    if (bf(n, rc) <= 0) {
      const r = rotLeft(n, id)
      return { ...r, rotationType: 'Left Rotation' }
    }
    const rr = rotRight(n, rc)
    n = { ...rr.nodes, [id]: { ...n[id], right: rr.newRoot } }
    n = updH(n, id)
    const r = rotLeft(n, id)
    return { ...r, rotationType: 'Right-Left Rotation' }
  }

  return { nodes: n, newRoot: id }
}

function insertRaw(nodes: AVLNodeMap, rootId: string | null, value: number): { nodes: AVLNodeMap; rootId: string | null } {
  if (rootId === null) {
    const node: AVLNode = { id: nanoid(), value, left: null, right: null, height: 1, highlight: 'default' }
    return { nodes: { ...nodes, [node.id]: node }, rootId: node.id }
  }
  const node = nodes[rootId]
  if (value === node.value) return { nodes, rootId }
  if (value < node.value) {
    const { nodes: n2, rootId: newLeft } = insertRaw(nodes, node.left, value)
    let n3 = { ...n2, [rootId]: { ...n2[rootId], left: newLeft } }
    n3 = updH(n3, rootId)
    const r = rebalance(n3, rootId)
    return { nodes: r.nodes, rootId: r.newRoot }
  }
  const { nodes: n2, rootId: newRight } = insertRaw(nodes, node.right, value)
  let n3 = { ...n2, [rootId]: { ...n2[rootId], right: newRight } }
  n3 = updH(n3, rootId)
  const r = rebalance(n3, rootId)
  return { nodes: r.nodes, rootId: r.newRoot }
}

function deleteRaw(nodes: AVLNodeMap, rootId: string | null, value: number): { nodes: AVLNodeMap; rootId: string | null } {
  if (rootId === null) return { nodes, rootId: null }
  const node = nodes[rootId]
  let n = { ...nodes }

  if (value < node.value) {
    const { nodes: n2, rootId: newLeft } = deleteRaw(n, node.left, value)
    n = { ...n2, [rootId]: { ...n2[rootId], left: newLeft } }
  } else if (value > node.value) {
    const { nodes: n2, rootId: newRight } = deleteRaw(n, node.right, value)
    n = { ...n2, [rootId]: { ...n2[rootId], right: newRight } }
  } else {
    if (node.left === null && node.right === null) { delete n[rootId]; return { nodes: n, rootId: null } }
    if (node.left === null) { delete n[rootId]; return { nodes: n, rootId: node.right } }
    if (node.right === null) { delete n[rootId]; return { nodes: n, rootId: node.left } }
    let succId = node.right
    while (n[succId].left !== null) succId = n[succId].left!
    const succVal = n[succId].value
    const { nodes: n2, rootId: newRight } = deleteRaw(n, node.right, succVal)
    n = { ...n2, [rootId]: { ...n2[rootId], value: succVal, right: newRight } }
  }

  n = updH(n, rootId)
  const r = rebalance(n, rootId)
  return { nodes: r.nodes, rootId: r.newRoot }
}

function cloneNodes(nodes: AVLNodeMap, hl: AVLHighlight = 'default'): AVLNodeMap {
  const out: AVLNodeMap = {}
  for (const id in nodes) out[id] = { ...nodes[id], highlight: hl }
  return out
}

function countNodes(nodes: AVLNodeMap, id: string | null): number {
  if (id === null) return 0
  const n = nodes[id]
  return 1 + countNodes(nodes, n.left) + countNodes(nodes, n.right)
}

function buildInitialTree(): { nodes: AVLNodeMap; rootId: string | null } {
  let nodes: AVLNodeMap = {}
  let rootId: string | null = null
  for (const v of [30, 15, 50, 10, 20, 40, 60]) {
    const r = insertRaw(nodes, rootId, v)
    nodes = r.nodes
    rootId = r.rootId
  }
  return { nodes, rootId }
}

const INITIAL = buildInitialTree()

function scheduleSnaps(snaps: Snap[], delay: number, finalStatus: string) {
  const gen = ++animGen
  useAVLStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snaps.length - 1
      useAVLStore.setState({
        nodes: snap.nodes,
        rootId: snap.rootId,
        rotationLabel: snap.rotationLabel ?? '',
        isAnimating: !isLast,
        ...(isLast ? { statusText: finalStatus } : {}),
      })
    }, i * delay)
    animTimers.push(t)
  })
}

interface AVLStore {
  nodes: AVLNodeMap
  rootId: string | null
  speed: AnimationSpeed
  inputValue: string
  isAnimating: boolean
  rotationLabel: string
  statusText: string
  currentLine: number
  steps: { time: string; text: string }[]
  setInputValue: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  insert: (value: number) => void
  deleteAVL: (value: number) => void
  search: (value: number) => void
  clear: () => void
  reset: () => void
  clearSteps: () => void
  loadFromCSV: (csv: string) => void
}

export const useAVLStore = create<AVLStore>((set, get) => ({
  nodes: cloneNodes(INITIAL.nodes),
  rootId: INITIAL.rootId,
  speed: 'normal',
  inputValue: '',
  isAnimating: false,
  rotationLabel: '',
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
    set({ isAnimating: true, nodes: cloneNodes(nodes, 'deleted'), rotationLabel: '' })
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
      set({ nodes: fresh.nodes, rootId: fresh.rootId, isAnimating: false, rotationLabel: '', statusText: 'Tree reset to default.' })
      return
    }
    set({ isAnimating: true, nodes: cloneNodes(cur, 'deleted'), rotationLabel: '' })
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const fresh = buildInitialTree()
      set({ nodes: fresh.nodes, rootId: fresh.rootId, isAnimating: false, rotationLabel: '', statusText: 'Tree reset to default.' })
    }, 650)
    animTimers.push(t)
  },

  search: value => {
    cancelAnim()
    const { nodes, rootId, speed, steps } = get()
    if (rootId === null) return
    const delay = SPEED_DELAY[speed]
    const snaps: Snap[] = []
    const visited: string[] = []
    let cur: string | null = rootId
    let foundNode = false

    while (cur !== null) {
      const curId: string = cur
      visited.push(curId)
      const snap = cloneNodes(nodes)
      for (const id of visited) snap[id] = { ...snap[id], highlight: 'traversing' }
      snaps.push({ nodes: snap, rootId })
      const node: AVLNode = nodes[curId]
      if (value === node.value) {
        const fs = cloneNodes(nodes)
        for (const id of visited.slice(0, -1)) fs[id] = { ...fs[id], highlight: 'traversing' }
        fs[curId] = { ...fs[curId], highlight: 'found' }
        snaps.push({ nodes: fs, rootId })
        foundNode = true
        break
      }
      cur = value < node.value ? node.left : node.right
    }

    if (cur === null && visited.length > 0) {
      const nfs = cloneNodes(nodes)
      const last = visited[visited.length - 1]
      for (const id of visited.slice(0, -1)) nfs[id] = { ...nfs[id], highlight: 'traversing' }
      nfs[last] = { ...nfs[last], highlight: 'notFound' }
      snaps.push({ nodes: nfs, rootId })
    }

    snaps.push({ nodes: cloneNodes(nodes), rootId })
    const finalStatus = foundNode ? `Found ${value}` : `${value} not found`
    const stepText = foundNode ? `Search: Found ${value}` : `Search: ${value} not found`
    set({ steps: [...steps, { time: nowTime(), text: stepText }] })
    scheduleSnaps(snaps, delay, finalStatus)
  },

  insert: value => {
    cancelAnim()
    const { nodes, rootId, speed, steps } = get()
    if (countNodes(nodes, rootId) >= 64) return
    const delay = SPEED_DELAY[speed]
    const snaps: Snap[] = []

    const path: string[] = []
    let cur: string | null = rootId
    while (cur !== null) {
      const node = nodes[cur]
      if (value === node.value) return
      path.push(cur)
      cur = value < node.value ? node.left : node.right
    }

    for (let i = 0; i < path.length; i++) {
      const snap = cloneNodes(nodes)
      for (let j = 0; j <= i; j++) snap[path[j]] = { ...snap[path[j]], highlight: 'traversing' }
      snaps.push({ nodes: snap, rootId })
    }

    const newNode: AVLNode = { id: nanoid(), value, left: null, right: null, height: 1, highlight: 'inserted' }
    let n: AVLNodeMap = { ...nodes, [newNode.id]: newNode }
    let newRootId: string | null = rootId

    if (path.length === 0) {
      newRootId = newNode.id
    } else {
      const parentId = path[path.length - 1]
      const parent = n[parentId]
      n[parentId] = value < parent.value
        ? { ...parent, left: newNode.id }
        : { ...parent, right: newNode.id }
    }

    const ins = cloneNodes(n)
    ins[newNode.id] = { ...ins[newNode.id], highlight: 'inserted' }
    snaps.push({ nodes: ins, rootId: newRootId })

    for (let i = path.length - 1; i >= 0; i--) {
      const nodeId = path[i]
      n = updH(n, nodeId)
      const balance = bf(n, nodeId)

      if (Math.abs(balance) > 1) {
        const pre = cloneNodes(n)
        pre[nodeId] = { ...pre[nodeId], highlight: 'rotating' }
        const childId = balance > 1 ? n[nodeId].left : n[nodeId].right
        if (childId && n[childId]) pre[childId] = { ...pre[childId], highlight: 'rotating' }
        const result = rebalance(n, nodeId)
        snaps.push({ nodes: pre, rootId: newRootId, rotationLabel: result.rotationType })

        n = result.nodes
        if (i > 0) {
          const parentId = path[i - 1]
          const parent = n[parentId]
          n[parentId] = parent.left === nodeId
            ? { ...parent, left: result.newRoot }
            : { ...parent, right: result.newRoot }
          n = updH(n, parentId)
        } else {
          newRootId = result.newRoot
        }

        snaps.push({ nodes: cloneNodes(n), rootId: newRootId, rotationLabel: result.rotationType })
        break
      }
    }

    snaps.push({ nodes: cloneNodes(n), rootId: newRootId })
    set({ steps: [...steps, { time: nowTime(), text: `Insert: ${value} added (self-balanced)` }] })
    scheduleSnaps(snaps, delay, `Inserted ${value}`)
  },

  deleteAVL: value => {
    cancelAnim()
    const { nodes, rootId, speed, steps } = get()
    if (rootId === null) return
    const delay = SPEED_DELAY[speed]
    const snaps: Snap[] = []
    const visited: string[] = []
    let cur: string | null = rootId
    let found = false

    while (cur !== null) {
      const curId: string = cur
      visited.push(curId)
      const snap = cloneNodes(nodes)
      for (const id of visited) snap[id] = { ...snap[id], highlight: 'traversing' }
      snaps.push({ nodes: snap, rootId })
      const node: AVLNode = nodes[curId]
      if (value === node.value) { found = true; break }
      cur = value < node.value ? node.left : node.right
    }

    if (!found) {
      const nfs = cloneNodes(nodes)
      const last = visited[visited.length - 1]
      if (last) nfs[last] = { ...nfs[last], highlight: 'notFound' }
      snaps.push({ nodes: nfs, rootId })
      snaps.push({ nodes: cloneNodes(nodes), rootId })
      set({ steps: [...steps, { time: nowTime(), text: `Delete: ${value} not found` }] })
      scheduleSnaps(snaps, delay, `${value} not found`)
      return
    }

    const del = cloneNodes(nodes)
    const targetId = visited[visited.length - 1]
    for (const id of visited.slice(0, -1)) del[id] = { ...del[id], highlight: 'traversing' }
    del[targetId] = { ...del[targetId], highlight: 'deleted' }
    snaps.push({ nodes: del, rootId })

    const result = deleteRaw(nodes, rootId, value)
    snaps.push({ nodes: cloneNodes(result.nodes), rootId: result.rootId })

    set({ steps: [...steps, { time: nowTime(), text: `Delete: ${value} removed (rebalanced)` }] })
    scheduleSnaps(snaps, delay, `Deleted ${value}`)
  },

  loadFromCSV: (csv: string) => {
    cancelAnim()
    const vals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    if (vals.length === 0) return
    let n: AVLNodeMap = {}
    let r: string | null = null
    for (const v of vals) {
      const result = insertRaw(n, r, v)
      n = result.nodes
      r = result.rootId
    }
    set({ nodes: n, rootId: r, isAnimating: false, rotationLabel: '', statusText: `Loaded ${vals.length} values` })
  },
}))
