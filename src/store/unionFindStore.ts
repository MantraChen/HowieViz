import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export type UFNodeHL = 'default' | 'path' | 'root' | 'merged'

const SPEED_DELAY: Record<AnimationSpeed, number> = {
  slow: 700,
  normal: 500,
  fast: 200,
}

export interface UFSnap {
  parent: number[]
  rank: number[]
  highlights: UFNodeHL[]
  message: string
}

let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

const DEFAULT_N = 8

interface UFStore {
  n: number
  parent: number[]
  rank: number[]
  highlights: UFNodeHL[]
  message: string
  isAnimating: boolean
  speed: AnimationSpeed
  currentLine: number
  unionX: string
  unionY: string
  findX: string

  setUnionX: (v: string) => void
  setUnionY: (v: string) => void
  setFindX: (v: string) => void
  setN: (n: number) => void
  setSpeed: (s: AnimationSpeed) => void
  union: (x: number, y: number) => void
  find: (x: number) => void
  reset: () => void
}

function makeInitialState(n: number) {
  return {
    parent: Array.from({ length: n }, (_, i) => i),
    rank: new Array(n).fill(0),
    highlights: new Array(n).fill('default') as UFNodeHL[],
  }
}

function findRoot(parent: number[], x: number): number[] {
  const path: number[] = []
  let cur = x
  while (parent[cur] !== cur) {
    path.push(cur)
    cur = parent[cur]
  }
  path.push(cur)
  return path
}

function scheduleSnaps(snaps: UFSnap[]) {
  const gen = ++animGen
  const delay = SPEED_DELAY[useUFStore.getState().speed]
  useUFStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useUFStore.setState({
        parent: snap.parent,
        rank: snap.rank,
        highlights: snap.highlights,
        message: snap.message,
        isAnimating: i < snaps.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

export const useUFStore = create<UFStore>((set, get) => ({
  n: DEFAULT_N,
  ...makeInitialState(DEFAULT_N),
  message: '',
  isAnimating: false,
  speed: 'normal',
  currentLine: 0,
  unionX: '',
  unionY: '',
  findX: '',

  setUnionX: v => set({ unionX: v }),
  setUnionY: v => set({ unionY: v }),
  setFindX: v => set({ findX: v }),
  setSpeed: s => set({ speed: s }),

  setN: (n: number) => {
    cancelAnim()
    set({ n, ...makeInitialState(n), message: '', isAnimating: false, unionX: '', unionY: '', findX: '' })
  },

  union: (x: number, y: number) => {
    cancelAnim()
    const { parent, rank, n } = get()
    if (x < 0 || x >= n || y < 0 || y >= n) return

    const snaps: UFSnap[] = []
    const p = [...parent]
    const r = [...rank]

    // Find root of x
    const pathX = findRoot(p, x)
    snaps.push({
      parent: [...p], rank: [...r],
      highlights: p.map((_, i) => pathX.includes(i) ? (i === pathX[pathX.length - 1] ? 'root' : 'path') : 'default'),
      message: `Finding root of ${x}: path ${pathX.join(' → ')}`,
    })

    // Path compress x
    const rootX = pathX[pathX.length - 1]
    for (const node of pathX.slice(0, -1)) p[node] = rootX
    snaps.push({
      parent: [...p], rank: [...r],
      highlights: p.map((_, i) => pathX.includes(i) ? (i === rootX ? 'root' : 'path') : 'default'),
      message: `Root of ${x} = ${rootX} (path compressed)`,
    })

    // Find root of y
    const pathY = findRoot(p, y)
    snaps.push({
      parent: [...p], rank: [...r],
      highlights: p.map((_, i) => pathY.includes(i) ? (i === pathY[pathY.length - 1] ? 'root' : 'path') : (pathX.includes(i) ? 'merged' : 'default')),
      message: `Finding root of ${y}: path ${pathY.join(' → ')}`,
    })

    const rootY = pathY[pathY.length - 1]
    for (const node of pathY.slice(0, -1)) p[node] = rootY

    if (rootX === rootY) {
      snaps.push({
        parent: [...p], rank: [...r],
        highlights: new Array(p.length).fill('default') as UFNodeHL[],
        message: `${x} and ${y} are already in the same set`,
      })
      scheduleSnaps(snaps)
      return
    }

    // Union by rank
    if (r[rootX] < r[rootY]) {
      p[rootX] = rootY
    } else if (r[rootX] > r[rootY]) {
      p[rootY] = rootX
    } else {
      p[rootY] = rootX
      r[rootX]++
    }

    const newRoot = r[rootX] >= r[rootY] ? rootX : rootY
    snaps.push({
      parent: [...p], rank: [...r],
      highlights: p.map((_, i) => (pathX.includes(i) || pathY.includes(i)) ? 'merged' : 'default'),
      message: `Union complete: merged under root ${newRoot}`,
    })

    snaps.push({
      parent: [...p], rank: [...r],
      highlights: new Array(p.length).fill('default') as UFNodeHL[],
      message: `Done. Sets merged.`,
    })

    scheduleSnaps(snaps)
  },

  find: (x: number) => {
    cancelAnim()
    const { parent, rank, n } = get()
    if (x < 0 || x >= n) return

    const snaps: UFSnap[] = []
    const p = [...parent]
    const r = [...rank]

    const path = findRoot(p, x)
    const root = path[path.length - 1]

    // Animate traversal
    for (let i = 0; i < path.length; i++) {
      snaps.push({
        parent: [...p], rank: [...r],
        highlights: p.map((_, idx) => {
          if (idx === path[i]) return i === path.length - 1 ? 'root' : 'path'
          if (path.slice(0, i).includes(idx)) return 'path'
          return 'default'
        }),
        message: `find(${x}): at node ${path[i]}${path[i] === root ? ' (root!)' : ''}`,
      })
    }

    // Path compression
    const compressed = [...p]
    for (const node of path.slice(0, -1)) compressed[node] = root

    snaps.push({
      parent: [...compressed], rank: [...r],
      highlights: p.map((_, i) => path.includes(i) ? (i === root ? 'root' : 'merged') : 'default'),
      message: `Path compression: all nodes on path now point to root ${root}`,
    })

    snaps.push({
      parent: [...compressed], rank: [...r],
      highlights: new Array(compressed.length).fill('default') as UFNodeHL[],
      message: `find(${x}) = ${root}`,
    })

    scheduleSnaps(snaps)
  },

  reset: () => {
    cancelAnim()
    const { n } = get()
    set({ ...makeInitialState(n), message: '', isAnimating: false })
  },
}))
