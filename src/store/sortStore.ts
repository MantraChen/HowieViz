import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export type BarHighlight = 'default' | 'comparing' | 'pivot' | 'sorted' | 'swapping'

export interface SortBar {
  value: number
  highlight: BarHighlight
}

export interface SortStep {
  bars: SortBar[]
  description: string
}

export interface SortState {
  bars: SortBar[]
  originalValues: number[]
  description: string
  isAnimating: boolean
  isSorted: boolean
  arraySize: number
  speed: AnimationSpeed
  setArraySize: (n: number) => void
  setSpeed: (s: AnimationSpeed) => void
  randomize: () => void
  sort: () => void
  reset: () => void
}

const SPEED_MS: Record<AnimationSpeed, number> = { slow: 500, normal: 100, fast: 15 }

export function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 8)
}

export function makeBars(values: number[]): SortBar[] {
  return values.map(v => ({ value: v, highlight: 'default' as BarHighlight }))
}

export function createSortStore(generateSteps: (arr: number[]) => SortStep[]) {
  let timers: ReturnType<typeof setTimeout>[] = []
  let animGen = 0

  function cancelAll() {
    timers.forEach(clearTimeout)
    timers = []
    animGen++
  }

  const initialSize = 8
  const initialValues = randomArray(initialSize)

  return create<SortState>((set, get) => ({
    bars: makeBars(initialValues),
    originalValues: [...initialValues],
    description: '',
    isAnimating: false,
    isSorted: false,
    arraySize: initialSize,
    speed: 'normal',

    setArraySize(n) {
      cancelAll()
      const vals = randomArray(n)
      set({ arraySize: n, bars: makeBars(vals), originalValues: [...vals], description: '', isSorted: false, isAnimating: false })
    },

    setSpeed: s => set({ speed: s }),

    randomize() {
      cancelAll()
      const vals = randomArray(get().arraySize)
      set({ bars: makeBars(vals), originalValues: [...vals], description: '', isSorted: false, isAnimating: false })
    },

    reset() {
      cancelAll()
      set(s => ({ bars: makeBars(s.originalValues), description: '', isSorted: false, isAnimating: false }))
    },

    sort() {
      cancelAll()
      const { bars, speed } = get()
      if (bars.length < 2) return
      const vals = bars.map(b => b.value)
      const steps = generateSteps(vals)
      const delay = SPEED_MS[speed]
      const g = ++animGen
      set({ isAnimating: true, isSorted: false })
      steps.forEach((step, i) => {
        const t = setTimeout(() => {
          if (animGen !== g) return
          set({
            bars: step.bars,
            description: step.description,
            isAnimating: i < steps.length - 1,
            isSorted: i === steps.length - 1,
          })
        }, i * delay)
        timers.push(t)
      })
    },
  }))
}
