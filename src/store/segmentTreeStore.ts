import { create } from 'zustand'

export type STNodeHL = 'default' | 'building' | 'querying' | 'updating' | 'result'

export interface STNode {
  idx: number
  l: number
  r: number
  sum: number
  highlight: STNodeHL
}

interface STSnap {
  nodes: Record<number, STNode>
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

const DEFAULT_ARR = [1, 3, 5, 7, 9, 11]
const SPEED_DELAY = { slow: 700, normal: 350, fast: 130 }

function buildTree(arr: number[]): Record<number, STNode> {
  const nodes: Record<number, STNode> = {}
  const n = arr.length

  function build(idx: number, l: number, r: number) {
    if (l === r) {
      nodes[idx] = { idx, l, r, sum: arr[l], highlight: 'default' }
      return
    }
    const mid = (l + r) >> 1
    build(2 * idx, l, mid)
    build(2 * idx + 1, mid + 1, r)
    nodes[idx] = { idx, l, r, sum: nodes[2 * idx].sum + nodes[2 * idx + 1].sum, highlight: 'default' }
  }

  build(1, 0, n - 1)
  return nodes
}

function resetHL(nodes: Record<number, STNode>): Record<number, STNode> {
  const copy: Record<number, STNode> = {}
  for (const k in nodes) copy[k] = { ...nodes[k], highlight: 'default' }
  return copy
}

function scheduleSnaps(snaps: STSnap[], delay: number, finalStatus: string) {
  const gen = ++animGen
  useSTStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snaps.length - 1
      useSTStore.setState({
        nodes: snap.nodes,
        message: snap.message,
        resultSum: snap.resultSum,
        isAnimating: !isLast,
        ...(isLast ? { statusText: finalStatus } : {}),
      })
    }, i * delay)
    animTimers.push(t)
  })
}

interface STStore {
  arr: number[]
  nodes: Record<number, STNode>
  message: string
  resultSum: number | null
  isAnimating: boolean
  speed: 'slow' | 'normal' | 'fast'
  queryL: string
  queryR: string
  updateIdx: string
  updateVal: string
  statusText: string
  currentLine: number
  steps: { time: string; text: string }[]

  setSpeed: (s: 'slow' | 'normal' | 'fast') => void
  setQueryL: (v: string) => void
  setQueryR: (v: string) => void
  setUpdateIdx: (v: string) => void
  setUpdateVal: (v: string) => void
  query: (l: number, r: number) => void
  update: (idx: number, val: number) => void
  reset: () => void
  clearSteps: () => void
  loadFromCSV: (csv: string) => void
}

export const useSTStore = create<STStore>((set, get) => ({
  arr: [...DEFAULT_ARR],
  nodes: buildTree(DEFAULT_ARR),
  message: '',
  resultSum: null,
  isAnimating: false,
  speed: 'normal',
  queryL: '',
  queryR: '',
  updateIdx: '',
  updateVal: '',
  statusText: 'Ready — use controls to interact.',
  currentLine: 0,
  steps: [],

  setSpeed: s => set({ speed: s }),
  setQueryL: v => set({ queryL: v }),
  setQueryR: v => set({ queryR: v }),
  setUpdateIdx: v => set({ updateIdx: v }),
  setUpdateVal: v => set({ updateVal: v }),
  clearSteps: () => set({ steps: [] }),

  query: (ql: number, qr: number) => {
    cancelAnim()
    const { nodes: rawNodes, arr, speed, steps } = get()
    const n = arr.length
    if (ql < 0 || qr >= n || ql > qr) return

    const snaps: STSnap[] = []
    const nodes = resetHL(rawNodes)

    let total = 0
    const contributing: number[] = []

    function doQuery(idx: number, l: number, r: number) {
      if (ql > r || qr < l) return
      const n2 = { ...nodes }
      for (const k in n2) n2[k] = { ...n2[k] }

      if (ql <= l && r <= qr) {
        contributing.push(idx)
        total += nodes[idx].sum
        for (const id of contributing) n2[id] = { ...n2[id], highlight: 'result' }
        n2[idx] = { ...n2[idx], highlight: 'result' }
        snaps.push({
          nodes: { ...n2 },
          message: `Node [${l},${r}] fully covered, sum += ${nodes[idx].sum} → total=${total}`,
          resultSum: total,
        })
        return
      }

      n2[idx] = { ...n2[idx], highlight: 'querying' }
      snaps.push({ nodes: { ...n2 }, message: `Visiting node [${l},${r}], splitting...`, resultSum: total })

      const mid = (l + r) >> 1
      doQuery(2 * idx, l, mid)
      doQuery(2 * idx + 1, mid + 1, r)
    }

    doQuery(1, 0, n - 1)

    const done = resetHL(nodes)
    snaps.push({ nodes: done, message: `Query [${ql},${qr}] = ${total}`, resultSum: total })

    set({ steps: [...steps, { time: nowTime(), text: `Query [${ql},${qr}] = ${total}` }] })
    scheduleSnaps(snaps, SPEED_DELAY[speed], `Query [${ql},${qr}] = ${total}`)
  },

  update: (qi: number, val: number) => {
    cancelAnim()
    const { nodes: rawNodes, arr, speed, steps } = get()
    const n = arr.length
    if (qi < 0 || qi >= n) return

    const newArr = [...arr]
    newArr[qi] = val

    const snaps: STSnap[] = []
    const nodes = resetHL(rawNodes)

    function doUpdate(idx: number, l: number, r: number) {
      const n2 = { ...nodes }
      for (const k in n2) n2[k] = { ...n2[k] }
      n2[idx] = { ...n2[idx], highlight: 'updating' }

      if (l === r) {
        nodes[idx] = { ...nodes[idx], sum: val }
        n2[idx] = { ...n2[idx], sum: val, highlight: 'updating' }
        snaps.push({ nodes: { ...n2 }, message: `Updated leaf [${l}] = ${val}`, resultSum: null })
        return
      }

      snaps.push({ nodes: { ...n2 }, message: `Visiting [${l},${r}], going deeper...`, resultSum: null })

      const mid = (l + r) >> 1
      if (qi <= mid) doUpdate(2 * idx, l, mid)
      else doUpdate(2 * idx + 1, mid + 1, r)

      nodes[idx] = { ...nodes[idx], sum: nodes[2 * idx].sum + nodes[2 * idx + 1].sum }
      n2[idx] = { ...n2[idx], sum: nodes[idx].sum, highlight: 'updating' }
      snaps.push({ nodes: { ...n2 }, message: `Updating [${l},${r}] sum = ${nodes[idx].sum}`, resultSum: null })
    }

    doUpdate(1, 0, n - 1)

    const done = resetHL(nodes)
    snaps.push({ nodes: done, message: `arr[${qi}] updated to ${val}`, resultSum: null })

    set({ steps: [...steps, { time: nowTime(), text: `Update: arr[${qi}] = ${val}` }] })
    scheduleSnaps(snaps, SPEED_DELAY[speed], `Updated arr[${qi}] = ${val}`)
    set({ arr: newArr })
  },

  reset: () => {
    cancelAnim()
    set({ arr: [...DEFAULT_ARR], nodes: buildTree(DEFAULT_ARR), message: '', resultSum: null, isAnimating: false, statusText: 'Reset to default array.' })
  },

  loadFromCSV: (csv: string) => {
    cancelAnim()
    const vals = csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    if (vals.length === 0) return
    set({ arr: vals, nodes: buildTree(vals), message: '', resultSum: null, isAnimating: false, statusText: `Loaded array of length ${vals.length}` })
  },
}))
