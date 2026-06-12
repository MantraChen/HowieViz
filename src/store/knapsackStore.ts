import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export interface KnapsackItem {
  weight: number
  value: number
}

export interface KnapsackSnap {
  table: number[][]
  activeRow: number
  activeCol: number
  phase: 'fill' | 'backtrack' | 'done'
  selectedItems: boolean[]
  currentLine: number  // 1-indexed pseudocode line, 0 = none
  stepText: string
}

export interface KnapsackStep {
  time: string
  text: string
}

export interface BenchmarkResult {
  n: number
  timeMs: number
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 120, normal: 60, fast: 20 }
let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

const DEFAULT_ITEMS: KnapsackItem[] = [
  { weight: 2, value: 6 },
  { weight: 2, value: 10 },
  { weight: 3, value: 12 },
  { weight: 5, value: 15 },
]

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

interface KnapsackStore {
  items: KnapsackItem[]
  capacity: number
  capacityInput: string
  weightInput: string
  valueInput: string
  table: number[][]
  snaps: KnapsackSnap[]
  currentSnap: KnapsackSnap | null
  isAnimating: boolean
  isDone: boolean
  speed: AnimationSpeed
  steps: KnapsackStep[]
  statusText: string
  benchmarkData: BenchmarkResult[] | null
  isBenchmarking: boolean
  setCapacityInput: (v: string) => void
  setWeightInput: (v: string) => void
  setValueInput: (v: string) => void
  addItem: () => void
  removeItem: (i: number) => void
  setSpeed: (s: AnimationSpeed) => void
  solve: () => void
  reset: () => void
  clearSteps: () => void
  runBenchmark: () => void
}

export const useKnapsackStore = create<KnapsackStore>((set, get) => ({
  items: [...DEFAULT_ITEMS],
  capacity: 8,
  capacityInput: '8',
  weightInput: '',
  valueInput: '',
  table: [],
  snaps: [],
  currentSnap: null,
  isAnimating: false,
  isDone: false,
  speed: 'normal',
  steps: [],
  statusText: 'Press Solve to start the animation.',
  benchmarkData: null,
  isBenchmarking: false,

  setCapacityInput: v => set({ capacityInput: v }),
  setWeightInput: v => set({ weightInput: v }),
  setValueInput: v => set({ valueInput: v }),
  setSpeed: s => set({ speed: s }),

  addItem: () => {
    const { weightInput, valueInput, items } = get()
    const w = parseInt(weightInput, 10)
    const v = parseInt(valueInput, 10)
    if (isNaN(w) || isNaN(v) || w <= 0 || v <= 0 || items.length >= 8) return
    set({ items: [...items, { weight: w, value: v }], weightInput: '', valueInput: '' })
  },

  removeItem: (i: number) => {
    const { items } = get()
    set({ items: items.filter((_, idx) => idx !== i) })
  },

  solve: () => {
    cancelAnim()
    const { items, capacityInput, speed } = get()
    const rawW = parseInt(capacityInput, 10)
    if (isNaN(rawW) || rawW <= 0 || items.length === 0) return
    const W = Math.min(rawW, 20)

    const n = items.length
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
    const snaps: KnapsackSnap[] = []

    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= W; w++) {
        const item = items[i - 1]
        if (item.weight <= w) {
          const take = dp[i - 1][w - item.weight] + item.value
          const skip = dp[i - 1][w]
          dp[i][w] = Math.max(skip, take)
          snaps.push({
            table: dp.map(row => [...row]),
            activeRow: i, activeCol: w,
            phase: 'fill', selectedItems: new Array(n).fill(false),
            currentLine: 8,
            stepText: w === 0 ? '' : `dp[${i}][${w}] = max(${skip}, ${dp[i - 1][w - item.weight]}+${item.value}) = ${dp[i][w]}`,
          })
        } else {
          dp[i][w] = dp[i - 1][w]
          snaps.push({
            table: dp.map(row => [...row]),
            activeRow: i, activeCol: w,
            phase: 'fill', selectedItems: new Array(n).fill(false),
            currentLine: 6,
            stepText: w === 0 ? '' : `dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}  (weight ${item.weight} > ${w})`,
          })
        }
      }
    }

    const selected = new Array(n).fill(false)
    let w = W
    for (let i = n; i > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selected[i - 1] = true
        w -= items[i - 1].weight
        snaps.push({
          table: dp.map(row => [...row]),
          activeRow: i, activeCol: w + items[i - 1].weight,
          phase: 'backtrack', selectedItems: [...selected],
          currentLine: 15,
          stepText: `Selected item ${i} (w:${items[i - 1].weight}, v:${items[i - 1].value})`,
        })
      }
    }

    snaps.push({
      table: dp.map(row => [...row]),
      activeRow: -1, activeCol: -1,
      phase: 'done', selectedItems: [...selected],
      currentLine: 10,
      stepText: `Done! Optimal value: ${dp[n][W]}`,
    })

    set({ table: dp, snaps, isAnimating: true, isDone: false, steps: [], statusText: 'Solving…' })

    const delay = SPEED_DELAY[speed]
    const gen = ++animGen

    snaps.forEach((snap, i) => {
      const t = setTimeout(() => {
        if (animGen !== gen) return
        const time = nowTime()
        useKnapsackStore.setState(prev => ({
          currentSnap: snap,
          isAnimating: i < snaps.length - 1,
          isDone: snap.phase === 'done',
          statusText: snap.stepText || prev.statusText,
          steps: snap.stepText
            ? [...prev.steps, { time, text: snap.stepText }]
            : prev.steps,
        }))
      }, i * delay)
      animTimers.push(t)
    })
  },

  clearSteps: () => set({ steps: [] }),

  reset: () => {
    cancelAnim()
    set({
      items: [...DEFAULT_ITEMS],
      capacity: 8,
      capacityInput: '8',
      table: [],
      snaps: [],
      currentSnap: null,
      isAnimating: false,
      isDone: false,
      weightInput: '',
      valueInput: '',
      steps: [],
      statusText: 'Press Solve to start the animation.',
    })
  },

  runBenchmark: () => {
    set({ isBenchmarking: true, benchmarkData: null })
    setTimeout(() => {
      const benchNs = [5, 10, 20, 50]
      const W = 100
      const results: BenchmarkResult[] = benchNs.map(n => {
        const items = Array.from({ length: n }, () => ({
          weight: Math.floor(Math.random() * 20) + 1,
          value: Math.floor(Math.random() * 50) + 1,
        }))
        const start = performance.now()
        const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
        for (let i = 1; i <= n; i++) {
          for (let ww = 0; ww <= W; ww++) {
            const item = items[i - 1]
            dp[i][ww] = item.weight <= ww
              ? Math.max(dp[i - 1][ww], dp[i - 1][ww - item.weight] + item.value)
              : dp[i - 1][ww]
          }
        }
        const end = performance.now()
        return { n, timeMs: end - start }
      })
      set({ benchmarkData: results, isBenchmarking: false })
    }, 50)
  },
}))
