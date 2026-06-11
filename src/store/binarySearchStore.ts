import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export type BSHighlight = 'default' | 'low' | 'mid' | 'high' | 'found' | 'notFound' | 'eliminated'

export interface BSElement {
  value: number
  highlight: BSHighlight
}

export interface BSStep {
  elements: BSElement[]
  description: string
}

const SPEED_MS: Record<AnimationSpeed, number> = { slow: 900, normal: 450, fast: 120 }

function randomSortedArray(size = 20): number[] {
  const set = new Set<number>()
  while (set.size < size) set.add(Math.floor(Math.random() * 95) + 2)
  return [...set].sort((a, b) => a - b)
}

function makeDefault(arr: number[]): BSElement[] {
  return arr.map(v => ({ value: v, highlight: 'default' as BSHighlight }))
}

function hlFor(i: number, lo: number, mid: number, hi: number): BSHighlight {
  if (i < lo || i > hi) return 'eliminated'
  if (i === mid) return 'mid'
  if (i === lo) return 'low'
  if (i === hi) return 'high'
  return 'default'
}

function generateSteps(array: number[], target: number): BSStep[] {
  const steps: BSStep[] = []
  const n = array.length
  let lo = 0, hi = n - 1

  steps.push({
    elements: makeDefault(array),
    description: `Searching for ${target} in sorted array of ${n} elements`,
  })

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)

    steps.push({
      elements: array.map((v, i) => ({ value: v, highlight: hlFor(i, lo, mid, hi) })),
      description: `lo=${lo}  mid=${mid}  hi=${hi}  →  a[mid]=${array[mid]}`,
    })

    if (array[mid] === target) {
      steps.push({
        elements: array.map((v, i) => ({
          value: v,
          highlight: i < lo || i > hi ? 'eliminated' : i === mid ? 'found' : hlFor(i, lo, mid, hi),
        })),
        description: `Found ${target} at index ${mid}!`,
      })
      return steps
    } else if (target < array[mid]) {
      steps.push({
        elements: array.map((v, i) => ({
          value: v,
          highlight: i < lo || i > hi || i >= mid ? 'eliminated' : hlFor(i, lo, mid, hi),
        })),
        description: `${target} < a[mid]=${array[mid]}  →  search left half`,
      })
      hi = mid - 1
    } else {
      steps.push({
        elements: array.map((v, i) => ({
          value: v,
          highlight: i < lo || i > hi || i <= mid ? 'eliminated' : hlFor(i, lo, mid, hi),
        })),
        description: `${target} > a[mid]=${array[mid]}  →  search right half`,
      })
      lo = mid + 1
    }
  }

  steps.push({
    elements: array.map(v => ({ value: v, highlight: 'eliminated' as BSHighlight })),
    description: `${target} not found in array`,
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

const initialArray = randomSortedArray()

interface BinarySearchState {
  array: number[]
  elements: BSElement[]
  target: string
  description: string
  isAnimating: boolean
  isDone: boolean
  speed: AnimationSpeed
  setTarget: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  randomize: () => void
  search: () => void
  reset: () => void
}

export const useBinarySearchStore = create<BinarySearchState>((set, get) => ({
  array: initialArray,
  elements: makeDefault(initialArray),
  target: '',
  description: '',
  isAnimating: false,
  isDone: false,
  speed: 'normal',

  setTarget: v => set({ target: v }),
  setSpeed: s => set({ speed: s }),

  randomize: () => {
    cancelAll()
    const arr = randomSortedArray()
    set({ array: arr, elements: makeDefault(arr), target: '', description: '', isAnimating: false, isDone: false })
  },

  reset: () => {
    cancelAll()
    const { array } = get()
    set({ elements: makeDefault(array), description: '', isAnimating: false, isDone: false })
  },

  search: () => {
    cancelAll()
    const { array, target, speed } = get()
    const t = parseInt(target, 10)
    if (isNaN(t)) return
    const steps = generateSteps(array, t)
    const delay = SPEED_MS[speed]
    const g = ++animGen
    set({ isAnimating: true, isDone: false })
    steps.forEach((step, i) => {
      const timer = setTimeout(() => {
        if (animGen !== g) return
        set({
          elements: step.elements,
          description: step.description,
          isAnimating: i < steps.length - 1,
          isDone: i === steps.length - 1,
        })
      }, i * delay)
      timers.push(timer)
    })
  },
}))
