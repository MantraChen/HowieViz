import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export type RSHighlight = 'default' | 'active' | 'in-bucket' | 'sorted'

export interface RSElement {
  value: number
  highlight: RSHighlight
  digitPos: number // which digit position is active (-1 = none)
}

export interface RSStep {
  array: RSElement[]
  buckets: number[][]
  phase: 'idle' | 'distributing' | 'collecting' | 'done'
  passNumber: number
  digitPlace: number
  description: string
}

export interface StepEntry {
  time: string
  text: string
}

const SPEED_MS: Record<AnimationSpeed, number> = { slow: 700, normal: 220, fast: 55 }

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10)
}

function getDigit(n: number, place: number): number {
  return Math.floor(n / place) % 10
}

function placeLabel(place: number): string {
  if (place === 1) return '1s'
  if (place === 10) return '10s'
  if (place === 100) return '100s'
  return `${place}s`
}

function emptyBuckets(): number[][] {
  return Array.from({ length: 10 }, () => [])
}

function makeInitialStep(arr: number[]): RSStep {
  return {
    array: arr.map(v => ({ value: v, highlight: 'default', digitPos: -1 })),
    buckets: emptyBuckets(),
    phase: 'idle',
    passNumber: 0,
    digitPlace: 1,
    description: '',
  }
}

function generateSteps(arr: number[]): RSStep[] {
  const steps: RSStep[] = []
  const maxVal = Math.max(...arr)
  let current = [...arr]
  let passNum = 1

  for (let place = 1; place <= maxVal; place *= 10) {
    const dp = Math.log10(place)

    steps.push({
      array: current.map(v => ({ value: v, highlight: 'default', digitPos: dp })),
      buckets: emptyBuckets(),
      phase: 'distributing',
      passNumber: passNum,
      digitPlace: place,
      description: `Pass ${passNum}: sorting by ${placeLabel(place)} digit`,
    })

    const buckets = emptyBuckets()
    for (let i = 0; i < current.length; i++) {
      const digit = getDigit(current[i], place)
      buckets[digit] = [...buckets[digit], current[i]]

      steps.push({
        array: current.map((v, j) => ({
          value: v,
          highlight: j < i ? 'in-bucket' : j === i ? 'active' : 'default',
          digitPos: dp,
        })),
        buckets: buckets.map(b => [...b]),
        phase: 'distributing',
        passNumber: passNum,
        digitPlace: place,
        description: `${current[i]} → bucket[${digit}]  (${placeLabel(place)} digit = ${digit})`,
      })
    }

    current = ([] as number[]).concat(...buckets)
    steps.push({
      array: current.map(v => ({ value: v, highlight: 'active', digitPos: dp })),
      buckets: buckets.map(b => [...b]),
      phase: 'collecting',
      passNumber: passNum,
      digitPlace: place,
      description: `Pass ${passNum} complete: collect from buckets 0→9`,
    })

    passNum++
  }

  steps.push({
    array: current.map(v => ({ value: v, highlight: 'sorted', digitPos: -1 })),
    buckets: emptyBuckets(),
    phase: 'done',
    passNumber: passNum - 1,
    digitPlace: 1,
    description: 'Array sorted!',
  })

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

interface RadixSortState {
  array: number[]
  step: RSStep
  isAnimating: boolean
  isSorted: boolean
  arraySize: number
  speed: AnimationSpeed
  statusText: string
  snaps: RSStep[]
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

export const useRadixSortStore = create<RadixSortState>((set, get) => ({
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
    })
  },

  loadCustom: (csv: string) => {
    cancelAll()
    const rawVals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 10 && n <= 99)
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
