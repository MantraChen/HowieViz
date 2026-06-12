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

export interface StepEntry {
  time: string
  text: string
}

export interface SortState {
  bars: SortBar[]
  originalValues: number[]
  description: string
  statusText: string
  isAnimating: boolean
  isSorted: boolean
  arraySize: number
  speed: AnimationSpeed
  snaps: SortStep[]
  snapIndex: number
  steps: StepEntry[]
  setArraySize: (n: number) => void
  setSpeed: (s: AnimationSpeed) => void
  randomize: () => void
  sort: () => void
  reset: () => void
  clearSteps: () => void
  prepareSnaps: () => void
  stepForward: () => void
  stepBack: () => void
  loadCustom: (csv: string) => void
}

const SPEED_MS: Record<AnimationSpeed, number> = { slow: 500, normal: 100, fast: 15 }

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

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
    statusText: 'Press Sort to begin.',
    isAnimating: false,
    isSorted: false,
    arraySize: initialSize,
    speed: 'normal',
    snaps: [],
    snapIndex: -1,
    steps: [],

    setArraySize(n) {
      cancelAll()
      const vals = randomArray(n)
      set({
        arraySize: n,
        bars: makeBars(vals),
        originalValues: [...vals],
        description: '',
        statusText: 'Press Sort to begin.',
        isSorted: false,
        isAnimating: false,
        snaps: [],
        snapIndex: -1,
        steps: [],
      })
    },

    setSpeed: s => set({ speed: s }),

    randomize() {
      cancelAll()
      const vals = randomArray(get().arraySize)
      set({
        bars: makeBars(vals),
        originalValues: [...vals],
        description: '',
        statusText: 'Press Sort to begin.',
        isSorted: false,
        isAnimating: false,
        snaps: [],
        snapIndex: -1,
        steps: [],
      })
    },

    reset() {
      cancelAll()
      set(s => ({
        bars: makeBars(s.originalValues),
        description: '',
        statusText: 'Press Sort to begin.',
        isSorted: false,
        isAnimating: false,
        snaps: [],
        snapIndex: -1,
        steps: [],
      }))
    },

    sort() {
      cancelAll()
      const { bars, speed } = get()
      if (bars.length < 2) return
      const vals = bars.map(b => b.value)
      const stepsArr = generateSteps(vals)
      const delay = SPEED_MS[speed]
      const g = ++animGen
      set({ isAnimating: true, isSorted: false, snaps: [], snapIndex: -1, steps: [], statusText: 'Sorting…' })
      stepsArr.forEach((step, i) => {
        const t = setTimeout(() => {
          if (animGen !== g) return
          const time = nowTime()
          set(prev => ({
            bars: step.bars,
            description: step.description,
            statusText: step.description,
            isAnimating: i < stepsArr.length - 1,
            isSorted: i === stepsArr.length - 1,
            steps: step.description
              ? [...prev.steps, { time, text: step.description }]
              : prev.steps,
          }))
        }, i * delay)
        timers.push(t)
      })
    },

    clearSteps: () => set({ steps: [] }),

    prepareSnaps() {
      cancelAll()
      const { bars } = get()
      if (bars.length < 2) return
      const vals = bars.map(b => b.value)
      const snaps = generateSteps(vals)
      const first = snaps[0]
      set({
        snaps,
        snapIndex: 0,
        bars: first.bars,
        statusText: first.description,
        description: first.description,
        isAnimating: false,
        isSorted: false,
        steps: [],
      })
    },

    stepForward() {
      const { snaps, snapIndex } = get()
      if (snaps.length === 0) { get().prepareSnaps(); return }
      if (snapIndex >= snaps.length - 1) return
      const newIdx = snapIndex + 1
      const snap = snaps[newIdx]
      const time = nowTime()
      set(prev => ({
        snapIndex: newIdx,
        bars: snap.bars,
        description: snap.description,
        statusText: snap.description,
        isSorted: newIdx === snaps.length - 1,
        steps: snap.description
          ? [...prev.steps, { time, text: snap.description }]
          : prev.steps,
      }))
    },

    stepBack() {
      const { snaps, snapIndex } = get()
      if (snapIndex <= 0) return
      const newIdx = snapIndex - 1
      const snap = snaps[newIdx]
      set({
        snapIndex: newIdx,
        bars: snap.bars,
        description: snap.description,
        statusText: snap.description,
        isSorted: false,
      })
    },

    loadCustom(csv: string) {
      cancelAll()
      const rawVals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0 && n <= 999)
      if (rawVals.length === 0) return
      const vals = rawVals.slice(0, 64)
      set({
        bars: makeBars(vals),
        originalValues: [...vals],
        arraySize: vals.length,
        snaps: [],
        snapIndex: -1,
        description: '',
        statusText: `Loaded ${vals.length} values.`,
        steps: [],
        isAnimating: false,
        isSorted: false,
      })
    },
  }))
}
