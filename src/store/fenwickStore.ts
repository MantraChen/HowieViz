import { create } from 'zustand'

export type FWNodeHL = 'default' | 'querying' | 'updating' | 'result'

interface FWSnap {
  bit: number[]
  arrHL: FWNodeHL[]
  bitHL: FWNodeHL[]
  message: string
  resultSum: number | null
}

let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

const DEFAULT_ARR = [1, 2, 3, 4, 5, 6, 7, 8]
const SPEED_DELAY = { slow: 700, normal: 350, fast: 130 }

function lowbit(x: number) { return x & (-x) }

function buildBIT(arr: number[]): number[] {
  const n = arr.length
  const bit = new Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    let j = i
    while (j <= n) {
      bit[j] += arr[i - 1]
      j += lowbit(j)
    }
  }
  return bit
}

function scheduleSnaps(snaps: FWSnap[], delay: number) {
  const gen = ++animGen
  useFWStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useFWStore.setState({
        bit: snap.bit,
        arrHL: snap.arrHL,
        bitHL: snap.bitHL,
        message: snap.message,
        resultSum: snap.resultSum,
        isAnimating: i < snaps.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

interface FWStore {
  arr: number[]
  bit: number[]
  arrHL: FWNodeHL[]
  bitHL: FWNodeHL[]
  message: string
  resultSum: number | null
  isAnimating: boolean
  speed: 'slow' | 'normal' | 'fast'
  queryIdx: string
  updateIdx: string
  updateDelta: string

  setSpeed: (s: 'slow' | 'normal' | 'fast') => void
  setQueryIdx: (v: string) => void
  setUpdateIdx: (v: string) => void
  setUpdateDelta: (v: string) => void
  query: (i: number) => void
  update: (i: number, delta: number) => void
  reset: () => void
}

export const useFWStore = create<FWStore>((set, get) => ({
  arr: [...DEFAULT_ARR],
  bit: buildBIT(DEFAULT_ARR),
  arrHL: new Array(DEFAULT_ARR.length).fill('default') as FWNodeHL[],
  bitHL: new Array(DEFAULT_ARR.length + 1).fill('default') as FWNodeHL[],
  message: '',
  resultSum: null,
  isAnimating: false,
  speed: 'normal',
  queryIdx: '',
  updateIdx: '',
  updateDelta: '',

  setSpeed: s => set({ speed: s }),
  setQueryIdx: v => set({ queryIdx: v }),
  setUpdateIdx: v => set({ updateIdx: v }),
  setUpdateDelta: v => set({ updateDelta: v }),

  query: (qi: number) => {
    cancelAnim()
    const { bit, arr, speed } = get()
    const n = arr.length
    if (qi < 1 || qi > n) return

    const snaps: FWSnap[] = []
    const b = [...bit]
    let total = 0
    let i = qi

    const initBitHL = new Array(n + 1).fill('default') as FWNodeHL[]
    const initArrHL = new Array(n).fill('default') as FWNodeHL[]
    snaps.push({ bit: b, arrHL: initArrHL, bitHL: initBitHL, message: `Prefix sum query(${qi})`, resultSum: null })

    while (i > 0) {
      total += b[i]
      const ahl = new Array(n).fill('default') as FWNodeHL[]
      const bhl = new Array(n + 1).fill('default') as FWNodeHL[]
      bhl[i] = 'querying'
      // highlight the responsibility range in arr
      const lo = i - lowbit(i) + 1
      for (let k = lo - 1; k < i; k++) ahl[k] = 'querying'
      snaps.push({
        bit: b, arrHL: ahl, bitHL: bhl,
        message: `i=${i}: bit[${i}]=${b[i]}, covers arr[${lo}..${i}], sum+=${b[i]} → ${total}`,
        resultSum: total,
      })
      i -= lowbit(i)
    }

    const doneAHL = new Array(n).fill('default') as FWNodeHL[]
    const doneBHL = new Array(n + 1).fill('default') as FWNodeHL[]
    snaps.push({ bit: b, arrHL: doneAHL, bitHL: doneBHL, message: `query(${qi}) = ${total}`, resultSum: total })
    scheduleSnaps(snaps, SPEED_DELAY[speed])
  },

  update: (ui: number, delta: number) => {
    cancelAnim()
    const { bit, arr, speed } = get()
    const n = arr.length
    if (ui < 1 || ui > n) return

    const snaps: FWSnap[] = []
    const b = [...bit]
    let i = ui

    const newArr = [...arr]
    newArr[ui - 1] += delta

    snaps.push({
      bit: b,
      arrHL: new Array(n).fill('default') as FWNodeHL[],
      bitHL: new Array(n + 1).fill('default') as FWNodeHL[],
      message: `Update index ${ui} by delta ${delta > 0 ? '+' : ''}${delta}`,
      resultSum: null,
    })

    while (i <= n) {
      b[i] += delta
      const ahl = new Array(n).fill('default') as FWNodeHL[]
      const bhl = new Array(n + 1).fill('default') as FWNodeHL[]
      bhl[i] = 'updating'
      ahl[ui - 1] = 'updating'
      snaps.push({
        bit: [...b], arrHL: ahl, bitHL: bhl,
        message: `i=${i}: bit[${i}] += ${delta} → ${b[i]}`,
        resultSum: null,
      })
      i += lowbit(i)
    }

    const done = new Array(n).fill('default') as FWNodeHL[]
    const doneBHL = new Array(n + 1).fill('default') as FWNodeHL[]
    snaps.push({ bit: [...b], arrHL: done, bitHL: doneBHL, message: `Update complete`, resultSum: null })
    scheduleSnaps(snaps, SPEED_DELAY[speed])
    set({ arr: newArr })
  },

  reset: () => {
    cancelAnim()
    set({
      arr: [...DEFAULT_ARR],
      bit: buildBIT(DEFAULT_ARR),
      arrHL: new Array(DEFAULT_ARR.length).fill('default') as FWNodeHL[],
      bitHL: new Array(DEFAULT_ARR.length + 1).fill('default') as FWNodeHL[],
      message: '',
      resultSum: null,
      isAnimating: false,
    })
  },
}))
