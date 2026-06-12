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

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
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

function scheduleSnaps(snaps: FWSnap[], delay: number, finalStatus: string) {
  const gen = ++animGen
  useFWStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snaps.length - 1
      useFWStore.setState({
        bit: snap.bit,
        arrHL: snap.arrHL,
        bitHL: snap.bitHL,
        message: snap.message,
        resultSum: snap.resultSum,
        isAnimating: !isLast,
        ...(isLast ? { statusText: finalStatus } : {}),
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
  statusText: string
  steps: { time: string; text: string }[]

  setSpeed: (s: 'slow' | 'normal' | 'fast') => void
  setQueryIdx: (v: string) => void
  setUpdateIdx: (v: string) => void
  setUpdateDelta: (v: string) => void
  query: (i: number) => void
  update: (i: number, delta: number) => void
  reset: () => void
  clearSteps: () => void
  loadFromCSV: (csv: string) => void
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
  statusText: 'Ready — use controls to interact.',
  steps: [],

  setSpeed: s => set({ speed: s }),
  setQueryIdx: v => set({ queryIdx: v }),
  setUpdateIdx: v => set({ updateIdx: v }),
  setUpdateDelta: v => set({ updateDelta: v }),
  clearSteps: () => set({ steps: [] }),

  query: (qi: number) => {
    cancelAnim()
    const { bit, arr, speed, steps } = get()
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

    set({ steps: [...steps, { time: nowTime(), text: `Query(${qi}) = ${total}` }] })
    scheduleSnaps(snaps, SPEED_DELAY[speed], `Prefix sum(${qi}) = ${total}`)
  },

  update: (ui: number, delta: number) => {
    cancelAnim()
    const { bit, arr, speed, steps } = get()
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

    set({ steps: [...steps, { time: nowTime(), text: `Update(${ui}, ${delta > 0 ? '+' : ''}${delta})` }] })
    scheduleSnaps(snaps, SPEED_DELAY[speed], `Updated index ${ui} by ${delta > 0 ? '+' : ''}${delta}`)
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
      statusText: 'Reset to default array.',
    })
  },

  loadFromCSV: (csv: string) => {
    cancelAnim()
    const vals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    if (vals.length === 0) return
    set({
      arr: vals,
      bit: buildBIT(vals),
      arrHL: new Array(vals.length).fill('default') as FWNodeHL[],
      bitHL: new Array(vals.length + 1).fill('default') as FWNodeHL[],
      message: '',
      resultSum: null,
      isAnimating: false,
      statusText: `Loaded array of length ${vals.length}`,
    })
  },
}))
