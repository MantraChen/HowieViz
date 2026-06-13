import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export interface FibNode {
  id: string
  n: number
  result: number | null
  isMemoHit: boolean
  highlight: 'default' | 'computing' | 'memo' | 'resolved'
  parentId: string | null
  depth: number
  xIndex: number
}

export interface FibSnap {
  nodes: Record<string, FibNode>
  memo: Record<number, number>
  currentId: string | null
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 800, normal: 400, fast: 150 }
let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

let nodeCounter = 0

function buildFibTree(
  n: number,
  memo: Record<number, number>,
  nodes: Record<string, FibNode>,
  snaps: FibSnap[],
  parentId: string | null,
  depth: number,
  xCounter: { v: number },
): { id: string; result: number } {
  const id = `fib-${nodeCounter++}`
  const isMemoHit = n in memo

  const node: FibNode = {
    id,
    n,
    result: isMemoHit ? memo[n] : null,
    isMemoHit,
    highlight: isMemoHit ? 'memo' : 'computing',
    parentId,
    depth,
    xIndex: 0,
  }
  nodes[id] = node

  if (isMemoHit) {
    node.xIndex = xCounter.v++
    const snap: FibSnap = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      memo: { ...memo },
      currentId: id,
    }
    snaps.push(snap)
    return { id, result: memo[n] }
  }

  if (n <= 1) {
    node.result = n
    node.highlight = 'resolved'
    node.xIndex = xCounter.v++
    memo[n] = n
    const snap: FibSnap = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      memo: { ...memo },
      currentId: id,
    }
    snaps.push(snap)
    return { id, result: n }
  }

  // Show node being computed before expanding children
  const snap0: FibSnap = {
    nodes: JSON.parse(JSON.stringify(nodes)),
    memo: { ...memo },
    currentId: id,
  }
  snaps.push(snap0)

  const left = buildFibTree(n - 1, memo, nodes, snaps, id, depth + 1, xCounter)
  const right = buildFibTree(n - 2, memo, nodes, snaps, id, depth + 1, xCounter)

  node.xIndex = Math.floor((nodes[left.id].xIndex + nodes[right.id].xIndex) / 2)
  const result = left.result + right.result
  node.result = result
  node.highlight = 'resolved'
  memo[n] = result

  const snapFinal: FibSnap = {
    nodes: JSON.parse(JSON.stringify(nodes)),
    memo: { ...memo },
    currentId: id,
  }
  snaps.push(snapFinal)

  return { id, result }
}

interface FibStore {
  n: number
  nInput: string
  nodes: Record<string, FibNode>
  memo: Record<number, number>
  rootId: string | null
  snaps: FibSnap[]
  currentSnapIdx: number
  isAnimating: boolean
  speed: AnimationSpeed
  currentLine: number
  setNInput: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  compute: () => void
  reset: () => void
}

export const useFibStore = create<FibStore>((set, get) => ({
  n: 6,
  nInput: '6',
  nodes: {},
  memo: {},
  rootId: null,
  snaps: [],
  currentSnapIdx: -1,
  isAnimating: false,
  speed: 'normal',
  currentLine: 0,

  setNInput: v => set({ nInput: v }),
  setSpeed: s => set({ speed: s }),

  compute: () => {
    cancelAnim()
    const { nInput, speed } = get()
    const n = parseInt(nInput, 10)
    if (isNaN(n) || n < 0 || n > 15) return

    nodeCounter = 0
    const nodes: Record<string, FibNode> = {}
    const memo: Record<number, number> = {}
    const snaps: FibSnap[] = []
    const xCounter = { v: 0 }

    const { id: rootId } = buildFibTree(n, memo, nodes, snaps, null, 0, xCounter)

    set({ nodes, memo, rootId, snaps, currentSnapIdx: 0, isAnimating: true, n })

    const delay = SPEED_DELAY[speed]
    const gen = ++animGen

    snaps.forEach((snap, i) => {
      const t = setTimeout(() => {
        if (animGen !== gen) return
        useFibStore.setState({
          nodes: snap.nodes,
          memo: snap.memo,
          currentSnapIdx: i,
          isAnimating: i < snaps.length - 1,
        })
      }, i * delay)
      animTimers.push(t)
    })
  },

  reset: () => {
    cancelAnim()
    set({ nodes: {}, memo: {}, rootId: null, snaps: [], currentSnapIdx: -1, isAnimating: false })
  },
}))
