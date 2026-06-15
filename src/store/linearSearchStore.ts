import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export type LSHighlight = 'default' | 'checking' | 'checked' | 'found' | 'not-found'

export interface LSElement {
  value: number
  highlight: LSHighlight
}

export interface LSStep {
  elements: LSElement[]
  description: string
  comparisons: number
  foundAt: number
  currentLine: number
}

const SPEED_MS: Record<AnimationSpeed, number> = { slow: 800, normal: 300, fast: 80 }

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 89) + 10)
}

function makeDefault(arr: number[]): LSElement[] {
  return arr.map(v => ({ value: v, highlight: 'default' as LSHighlight }))
}

function generateSteps(arr: number[], target: number): LSStep[] {
  const steps: LSStep[] = []
  const n = arr.length

  steps.push({
    elements: makeDefault(arr),
    description: `Searching for ${target} in ${n} elements`,
    comparisons: 0,
    foundAt: -1,
    currentLine: 2,
  })

  for (let i = 0; i < n; i++) {
    steps.push({
      elements: arr.map((v, j) => ({
        value: v,
        highlight: j < i ? 'checked' : j === i ? 'checking' : 'default',
      })),
      description: `[${i}] = ${arr[i]} — is ${arr[i]} === ${target}?`,
      comparisons: i + 1,
      foundAt: -1,
      currentLine: 3,
    })

    if (arr[i] === target) {
      steps.push({
        elements: arr.map((v, j) => ({
          value: v,
          highlight: j < i ? 'checked' : j === i ? 'found' : 'default',
        })),
        description: `Found ${target} at index ${i}! (${i + 1} comparison${i + 1 > 1 ? 's' : ''})`,
        comparisons: i + 1,
        foundAt: i,
        currentLine: 4,
      })
      return steps
    }
  }

  steps.push({
    elements: arr.map(v => ({ value: v, highlight: 'not-found' as LSHighlight })),
    description: `${target} not found after ${n} comparisons`,
    comparisons: n,
    foundAt: -1,
    currentLine: 5,
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

const initialArray = randomArray(12)

interface LinearSearchState {
  array: number[]
  elements: LSElement[]
  target: string
  description: string
  comparisons: number
  foundAt: number
  isAnimating: boolean
  isDone: boolean
  speed: AnimationSpeed
  currentLine: number
  setTarget: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  randomize: () => void
  search: () => void
  reset: () => void
}

export const useLinearSearchStore = create<LinearSearchState>((set, get) => ({
  array: initialArray,
  elements: makeDefault(initialArray),
  target: '',
  description: '',
  comparisons: 0,
  foundAt: -1,
  isAnimating: false,
  isDone: false,
  speed: 'normal',
  currentLine: 0,

  setTarget: v => set({ target: v }),
  setSpeed: s => set({ speed: s }),

  randomize: () => {
    cancelAll()
    const arr = randomArray(12)
    set({
      array: arr,
      elements: makeDefault(arr),
      target: '',
      description: '',
      comparisons: 0,
      foundAt: -1,
      isAnimating: false,
      isDone: false,
    })
  },

  reset: () => {
    cancelAll()
    const { array } = get()
    set({
      elements: makeDefault(array),
      description: '',
      comparisons: 0,
      foundAt: -1,
      isAnimating: false,
      isDone: false,
    })
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
          comparisons: step.comparisons,
          foundAt: step.foundAt,
          currentLine: step.currentLine,
          isAnimating: i < steps.length - 1,
          isDone: i === steps.length - 1,
        })
      }, i * delay)
      timers.push(timer)
    })
  },
}))
