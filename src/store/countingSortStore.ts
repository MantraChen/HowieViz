import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export type CSHighlight = 'default' | 'active' | 'sorted' | 'counting' | 'placed'

export interface CSInputElement { value: number; highlight: CSHighlight }
export interface CSCountCell { value: number; highlight: CSHighlight }
export interface CSOutputCell { value: number | null; highlight: CSHighlight }

export interface CSStep {
  inputElements: CSInputElement[]
  countArray: CSCountCell[]
  outputArray: CSOutputCell[]
  phase: 0 | 1 | 2 | 3
  description: string
  currentLine?: number
}

export interface StepEntry {
  time: string
  text: string
}

const MAX_VAL = 20
const SPEED_MS: Record<AnimationSpeed, number> = { slow: 700, normal: 220, fast: 55 }

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (MAX_VAL + 1)))
}

function makeInitialStep(arr: number[]): CSStep {
  return {
    inputElements: arr.map(v => ({ value: v, highlight: 'default' })),
    countArray: new Array(MAX_VAL + 1).fill(0).map(v => ({ value: v, highlight: 'default' })),
    outputArray: new Array(arr.length).fill(null).map(() => ({ value: null, highlight: 'default' })),
    phase: 0,
    description: 'Press Sort to begin',
  }
}

function hl(n: number, fill: CSHighlight = 'default'): CSHighlight[] {
  return new Array(n).fill(fill) as CSHighlight[]
}

function generateSteps(arr: number[]): CSStep[] {
  const steps: CSStep[] = []
  const n = arr.length
  const count = new Array(MAX_VAL + 1).fill(0)
  const output = new Array(n).fill(null) as (number | null)[]

  const snap = (
    inputHL: CSHighlight[],
    countHL: CSHighlight[],
    outputHL: CSHighlight[],
    phase: 1 | 2 | 3,
    desc: string,
    currentLine?: number,
  ) => {
    steps.push({
      inputElements: arr.map((v, i) => ({ value: v, highlight: inputHL[i] ?? 'default' })),
      countArray: count.map((v, i) => ({ value: v, highlight: countHL[i] ?? 'default' })),
      outputArray: output.map((v, i) => ({ value: v, highlight: outputHL[i] ?? 'default' })),
      phase,
      description: desc,
      currentLine,
    })
  }

  snap(hl(n), hl(MAX_VAL + 1), hl(n), 1, 'Phase 1: Count occurrences of each value', 2)

  // Phase 1: Count
  for (let i = 0; i < n; i++) {
    const v = arr[i]
    const iHL: CSHighlight[] = arr.map((_, j) =>
      j < i ? 'sorted' : j === i ? 'active' : 'default',
    )
    const cHL: CSHighlight[] = count.map((_, j) => (j === v ? 'active' : 'default'))
    snap(iHL, cHL, hl(n), 1, `arr[${i}] = ${v} → count[${v}]++  (now ${count[v] + 1})`, 3)
    count[v]++
  }
  snap(hl(n, 'sorted'), hl(MAX_VAL + 1), hl(n), 1, 'Phase 1 complete — all values counted', 3)

  // Phase 2: Cumulative prefix sums
  snap(hl(n, 'sorted'), hl(MAX_VAL + 1), hl(n), 2, 'Phase 2: Convert counts to prefix sums', 4)
  for (let i = 1; i <= MAX_VAL; i++) {
    const sum = count[i] + count[i - 1]
    const cHL: CSHighlight[] = count.map((_, j) =>
      j === i ? 'active' : j === i - 1 ? 'counting' : j < i ? 'sorted' : 'default',
    )
    snap(
      hl(n, 'sorted'),
      cHL,
      hl(n),
      2,
      `count[${i}] = ${count[i]} + count[${i - 1}] = ${sum}`,
      5,
    )
    count[i] = sum
  }
  snap(hl(n, 'sorted'), hl(MAX_VAL + 1, 'sorted'), hl(n), 2, 'Phase 2 complete — prefix sums ready', 5)

  // Phase 3: Build output (iterate backward for stability)
  snap(hl(n, 'sorted'), hl(MAX_VAL + 1, 'sorted'), hl(n), 3, 'Phase 3: Place elements into output array', 6)
  for (let i = n - 1; i >= 0; i--) {
    const v = arr[i]
    count[v]--
    const pos = count[v]
    output[pos] = v
    const iHL: CSHighlight[] = arr.map((_, j) =>
      j > i ? 'sorted' : j === i ? 'active' : 'default',
    )
    const cHL: CSHighlight[] = count.map((_, j) => (j === v ? 'active' : 'default'))
    const oHL: CSHighlight[] = output.map((val, j) =>
      j === pos ? 'placed' : val !== null ? 'counting' : 'default',
    )
    snap(iHL, cHL, oHL, 3, `arr[${i}] = ${v} → output[${pos}]  (count[${v}] = ${count[v]})`, 7)
  }
  snap(
    hl(n, 'sorted'),
    hl(MAX_VAL + 1, 'sorted'),
    hl(n, 'sorted'),
    3,
    'Array sorted!',
    8,
  )

  return steps
}

let timers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAll() {
  timers.forEach(clearTimeout)
  timers = []
  animGen++
}

const initialArr = randomArray(8)

interface CountingSortState {
  array: number[]
  step: CSStep
  isAnimating: boolean
  isSorted: boolean
  arraySize: number
  speed: AnimationSpeed
  statusText: string
  snaps: CSStep[]
  snapIndex: number
  steps: StepEntry[]
  currentLine: number
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

export const useCountingSortStore = create<CountingSortState>((set, get) => ({
  array: initialArr,
  step: makeInitialStep(initialArr),
  isAnimating: false,
  isSorted: false,
  arraySize: 8,
  speed: 'normal',
  statusText: 'Press Sort to begin.',
  snaps: [],
  snapIndex: -1,
  steps: [],
  currentLine: 0,

  setArraySize: n => {
    cancelAll()
    const arr = randomArray(n)
    set({
      array: arr,
      step: makeInitialStep(arr),
      arraySize: n,
      isAnimating: false,
      isSorted: false,
      statusText: 'Press Sort to begin.',
      snaps: [],
      snapIndex: -1,
      steps: [],
    })
  },

  setSpeed: s => set({ speed: s }),

  randomize: () => {
    cancelAll()
    const arr = randomArray(get().arraySize)
    set({
      array: arr,
      step: makeInitialStep(arr),
      isAnimating: false,
      isSorted: false,
      statusText: 'Press Sort to begin.',
      snaps: [],
      snapIndex: -1,
      steps: [],
    })
  },

  reset: () => {
    cancelAll()
    set(s => ({
      step: makeInitialStep(s.array),
      isAnimating: false,
      isSorted: false,
      statusText: 'Press Sort to begin.',
      snaps: [],
      snapIndex: -1,
      steps: [],
    }))
  },

  sort: () => {
    cancelAll()
    const { array, speed } = get()
    const snaps = generateSteps(array)
    const delay = SPEED_MS[speed]
    const g = ++animGen
    set({ isAnimating: true, isSorted: false, snaps: [], snapIndex: -1, steps: [], statusText: 'Sorting…' })
    snaps.forEach((snap, i) => {
      const t = setTimeout(() => {
        if (animGen !== g) return
        const time = nowTime()
        set(prev => ({
          step: snap,
          isAnimating: i < snaps.length - 1,
          isSorted: i === snaps.length - 1,
          statusText: snap.description,
          currentLine: snap.currentLine ?? 0,
          steps: snap.description
            ? [...prev.steps, { time, text: snap.description }]
            : prev.steps,
        }))
      }, i * delay)
      timers.push(t)
    })
  },

  clearSteps: () => set({ steps: [] }),

  prepareSnaps: () => {
    cancelAll()
    const { array } = get()
    if (array.length < 2) return
    const snaps = generateSteps(array)
    const first = snaps[0]
    set({
      snaps,
      snapIndex: 0,
      step: first,
      statusText: first.description,
      isAnimating: false,
      isSorted: false,
      steps: [],
    })
  },

  stepForward: () => {
    const { snaps, snapIndex } = get()
    if (snaps.length === 0) { get().prepareSnaps(); return }
    if (snapIndex >= snaps.length - 1) return
    const newIdx = snapIndex + 1
    const snap = snaps[newIdx]
    const time = nowTime()
    set(prev => ({
      snapIndex: newIdx,
      step: snap,
      statusText: snap.description,
      isSorted: newIdx === snaps.length - 1,
      currentLine: snap.currentLine ?? 0,
      steps: snap.description
        ? [...prev.steps, { time, text: snap.description }]
        : prev.steps,
    }))
  },

  stepBack: () => {
    const { snaps, snapIndex } = get()
    if (snapIndex <= 0) return
    const newIdx = snapIndex - 1
    const snap = snaps[newIdx]
    set({
      snapIndex: newIdx,
      step: snap,
      statusText: snap.description,
      isSorted: false,
      currentLine: snap.currentLine ?? 0,
    })
  },

  loadCustom: (csv: string) => {
    cancelAll()
    const rawVals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0 && n <= MAX_VAL)
    if (rawVals.length === 0) return
    const vals = rawVals.slice(0, 20)
    set({
      array: vals,
      step: makeInitialStep(vals),
      arraySize: vals.length,
      snaps: [],
      snapIndex: -1,
      statusText: `Loaded ${vals.length} values.`,
      steps: [],
      isAnimating: false,
      isSorted: false,
    })
  },
}))
