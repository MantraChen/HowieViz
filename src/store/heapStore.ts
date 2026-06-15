import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type HeapHighlight = 'default' | 'active' | 'inserted' | 'deleted' | 'swapping'

export interface HeapNode {
  id: string
  value: number
  highlight: HeapHighlight
}

type HeapFrame = { id: string; value: number; highlight: HeapHighlight }
type Snap = { heap: HeapFrame[]; currentLine: number }

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

function siftDown(arr: { id: string; value: number }[], i: number, n: number) {
  while (true) {
    let smallest = i
    const l = 2 * i + 1
    const r = 2 * i + 2
    if (l < n && arr[l].value < arr[smallest].value) smallest = l
    if (r < n && arr[r].value < arr[smallest].value) smallest = r
    if (smallest === i) break
    ;[arr[i], arr[smallest]] = [arr[smallest], arr[i]]
    i = smallest
  }
}

function heapifyArray(values: number[]): { id: string; value: number }[] {
  const arr = values.map(v => ({ id: nanoid(), value: v }))
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, arr.length)
  }
  return arr
}

interface HeapStore {
  heap: HeapNode[]
  speed: AnimationSpeed
  inputValue: string
  buildInput: string
  isAnimating: boolean
  statusText: string
  currentLine: number
  steps: { time: string; text: string }[]
  setInputValue: (v: string) => void
  setBuildInput: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  insert: (value: number) => void
  extractMin: () => void
  peek: () => void
  buildHeap: (values: number[]) => void
  clear: () => void
  reset: () => void
  clearSteps: () => void
  loadFromCSV: (csv: string) => void
}

const DEFAULT_HEAP: HeapNode[] = [1, 3, 6, 5, 9, 8].map(v => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

function scheduleSnapshots(snapshots: Snap[], delay: number, finalStatus: string) {
  const gen = ++animGen
  useHeapStore.setState({ isAnimating: true })

  snapshots.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snapshots.length - 1
      useHeapStore.setState({
        heap: snap.heap,
        currentLine: snap.currentLine,
        isAnimating: !isLast,
        ...(isLast ? { statusText: finalStatus } : {}),
      })
    }, i * delay)
    animTimers.push(t)
  })
}

export const useHeapStore = create<HeapStore>((set, get) => ({
  heap: DEFAULT_HEAP,
  speed: 'normal',
  inputValue: '',
  buildInput: '',
  isAnimating: false,
  statusText: 'Ready — use controls to interact.',
  currentLine: 0,
  steps: [],

  setInputValue: v => set({ inputValue: v }),
  setBuildInput: v => set({ buildInput: v }),
  setSpeed: s => set({ speed: s }),
  clearSteps: () => set({ steps: [] }),

  clear: () => {
    cancelAnim()
    const { heap } = get()
    if (heap.length === 0) return
    const gen = ++animGen
    set({ isAnimating: true, heap: heap.map(n => ({ ...n, highlight: 'deleted' as const })) })
    const t = setTimeout(() => {
      if (animGen !== gen) return
      set({ heap: [], isAnimating: false, statusText: 'Heap cleared.' })
    }, 650)
    animTimers.push(t)
  },

  reset: () => {
    cancelAnim()
    const { heap } = get()
    const gen = ++animGen
    if (heap.length === 0) {
      set({ heap: DEFAULT_HEAP.map(n => ({ ...n, id: nanoid(), highlight: 'default' as const })), isAnimating: false, statusText: 'Heap reset to default.' })
      return
    }
    set({ isAnimating: true, heap: heap.map(n => ({ ...n, highlight: 'deleted' as const })) })
    const t = setTimeout(() => {
      if (animGen !== gen) return
      set({ isAnimating: false, heap: DEFAULT_HEAP.map(n => ({ ...n, id: nanoid(), highlight: 'default' as const })), statusText: 'Heap reset to default.' })
    }, 650)
    animTimers.push(t)
  },

  peek: () => {
    cancelAnim()
    const { heap, speed, steps } = get()
    if (heap.length === 0) return
    const delay = SPEED_DELAY[speed]
    const gen = ++animGen
    const minVal = heap[0].value

    set({
      isAnimating: true,
      heap: heap.map((n, i) => ({ ...n, highlight: i === 0 ? 'active' : 'default' })),
    })

    const t = setTimeout(() => {
      if (animGen !== gen) return
      set(s => ({
        isAnimating: false,
        heap: s.heap.map(n => ({ ...n, highlight: 'default' })),
        statusText: `Min (peek): ${minVal}`,
        steps: [...steps, { time: nowTime(), text: `Peek: min = ${minVal}` }],
      }))
    }, delay * 3)
    animTimers.push(t)
  },

  insert: (value: number) => {
    cancelAnim()
    const { heap, speed, steps } = get()
    if (heap.length >= MAX_SIZE) return
    const delay = SPEED_DELAY[speed]

    const work = heap.map(n => ({ id: n.id, value: n.value }))
    work.push({ id: nanoid(), value })

    const snapshots: Snap[] = []

    snapshots.push({ heap: work.map((n, i) => ({
      ...n,
      highlight: i === work.length - 1 ? 'inserted' : 'default',
    } as HeapFrame)), currentLine: 2 })

    let idx = work.length - 1
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2)
      if (work[idx].value < work[parent].value) {
        snapshots.push({ heap: work.map((n, i) => ({
          ...n,
          highlight: i === idx || i === parent ? 'swapping' : 'default',
        } as HeapFrame)), currentLine: 3 })
        ;[work[idx], work[parent]] = [work[parent], work[idx]]
        snapshots.push({ heap: work.map((n, i) => ({
          ...n,
          highlight: i === idx || i === parent ? 'swapping' : 'default',
        } as HeapFrame)), currentLine: 4 })
        idx = parent
      } else {
        break
      }
    }

    snapshots.push({ heap: work.map((n, i) => ({
      ...n,
      highlight: i === idx ? 'active' : 'default',
    } as HeapFrame)), currentLine: 4 })
    snapshots.push({ heap: work.map(n => ({ ...n, highlight: 'default' } as HeapFrame)), currentLine: 4 })

    set({ steps: [...steps, { time: nowTime(), text: `Insert: ${value} added to heap` }] })
    scheduleSnapshots(snapshots, delay, `Inserted ${value}`)
  },

  extractMin: () => {
    cancelAnim()
    const { heap, speed, steps } = get()
    if (heap.length === 0) return
    const delay = SPEED_DELAY[speed]
    const minVal = heap[0].value

    const snapshots: Snap[] = []

    if (heap.length === 1) {
      snapshots.push({ heap: [{ ...heap[0], highlight: 'deleted' }], currentLine: 6 })
      snapshots.push({ heap: [], currentLine: 6 })
    } else {
      const work = heap.map(n => ({ id: n.id, value: n.value }))

      snapshots.push({ heap: work.map((n, i) => ({
        ...n,
        highlight: i === 0 ? 'deleted' : 'default',
      } as HeapFrame)), currentLine: 6 })

      work[0] = { ...work[work.length - 1] }
      work.splice(work.length - 1, 1)

      snapshots.push({ heap: work.map((n, i) => ({
        ...n,
        highlight: i === 0 ? 'active' : 'default',
      } as HeapFrame)), currentLine: 6 })

      let idx = 0
      while (true) {
        const l = 2 * idx + 1
        const r = 2 * idx + 2
        let smallest = idx
        if (l < work.length && work[l].value < work[smallest].value) smallest = l
        if (r < work.length && work[r].value < work[smallest].value) smallest = r
        if (smallest === idx) break

        snapshots.push({ heap: work.map((n, i) => ({
          ...n,
          highlight: i === idx || i === smallest ? 'swapping' : 'default',
        } as HeapFrame)), currentLine: 7 })
        ;[work[idx], work[smallest]] = [work[smallest], work[idx]]
        snapshots.push({ heap: work.map((n, i) => ({
          ...n,
          highlight: i === idx || i === smallest ? 'swapping' : 'default',
        } as HeapFrame)), currentLine: 8 })
        idx = smallest
      }

      snapshots.push({ heap: work.map(n => ({ ...n, highlight: 'default' } as HeapFrame)), currentLine: 8 })
    }

    set({ steps: [...steps, { time: nowTime(), text: `Extract min: ${minVal} removed` }] })
    scheduleSnapshots(snapshots, delay, `Extracted min: ${minVal}`)
  },

  buildHeap: (values: number[]) => {
    cancelAnim()
    const { steps } = get()
    const trimmed = values.slice(0, MAX_SIZE)
    const heapified = heapifyArray(trimmed)
    const gen = ++animGen

    set({
      isAnimating: true,
      heap: heapified.map(n => ({ ...n, highlight: 'inserted' })),
    })

    const t = setTimeout(() => {
      if (animGen !== gen) return
      set(s => ({
        isAnimating: false,
        heap: s.heap.map(n => ({ ...n, highlight: 'default' })),
        statusText: `Built heap from ${trimmed.length} values`,
        steps: [...steps, { time: nowTime(), text: `Build heap: ${trimmed.length} values heapified` }],
      }))
    }, 800)
    animTimers.push(t)
  },

  loadFromCSV: (csv: string) => {
    cancelAnim()
    const vals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    if (vals.length === 0) return
    const trimmed = vals.slice(0, MAX_SIZE)
    const heapified = heapifyArray(trimmed)
    set({
      heap: heapified.map(n => ({ ...n, highlight: 'default' })),
      isAnimating: false,
      statusText: `Loaded ${trimmed.length} values`,
    })
  },
}))
