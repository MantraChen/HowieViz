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
  setCapacityInput: (v: string) => void
  setWeightInput: (v: string) => void
  setValueInput: (v: string) => void
  addItem: () => void
  removeItem: (i: number) => void
  setSpeed: (s: AnimationSpeed) => void
  solve: () => void
  reset: () => void
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
    const W = parseInt(capacityInput, 10)
    if (isNaN(W) || W <= 0 || items.length === 0) return

    const n = items.length
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
    const snaps: KnapsackSnap[] = []

    // Fill phase
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= W; w++) {
        const item = items[i - 1]
        if (item.weight <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - item.weight] + item.value)
        } else {
          dp[i][w] = dp[i - 1][w]
        }
        snaps.push({
          table: dp.map(row => [...row]),
          activeRow: i,
          activeCol: w,
          phase: 'fill',
          selectedItems: new Array(n).fill(false),
        })
      }
    }

    // Backtrack
    const selected = new Array(n).fill(false)
    let w = W
    for (let i = n; i > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selected[i - 1] = true
        w -= items[i - 1].weight
        snaps.push({
          table: dp.map(row => [...row]),
          activeRow: i,
          activeCol: w + items[i - 1].weight,
          phase: 'backtrack',
          selectedItems: [...selected],
        })
      }
    }

    snaps.push({
      table: dp.map(row => [...row]),
      activeRow: -1,
      activeCol: -1,
      phase: 'done',
      selectedItems: [...selected],
    })

    set({ table: dp, snaps, isAnimating: true, isDone: false })

    const delay = SPEED_DELAY[speed]
    const gen = ++animGen

    snaps.forEach((snap, i) => {
      const t = setTimeout(() => {
        if (animGen !== gen) return
        useKnapsackStore.setState({
          currentSnap: snap,
          isAnimating: i < snaps.length - 1,
          isDone: snap.phase === 'done',
        })
      }, i * delay)
      animTimers.push(t)
    })
  },

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
    })
  },
}))
