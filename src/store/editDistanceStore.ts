import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export type EditOp = 'match' | 'insert' | 'delete' | 'replace' | 'none'

export interface EditStep {
  op: EditOp
  from?: string
  to?: string
  pos: number
}

export interface EditSnap {
  table: number[][]
  activeRow: number
  activeCol: number
  phase: 'fill' | 'backtrack' | 'done'
  ops: EditStep[]
  cellOp: EditOp[][]
  currentLine?: number
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 120, normal: 60, fast: 15 }
let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

interface EditDistanceStore {
  str1: string
  str2: string
  str1Input: string
  str2Input: string
  table: number[][]
  currentSnap: EditSnap | null
  isAnimating: boolean
  isDone: boolean
  speed: AnimationSpeed
  currentLine: number
  setStr1Input: (v: string) => void
  setStr2Input: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  solve: () => void
  reset: () => void
}

export const useEditDistanceStore = create<EditDistanceStore>((set, get) => ({
  str1: 'kitten',
  str2: 'sitting',
  str1Input: 'kitten',
  str2Input: 'sitting',
  table: [],
  currentSnap: null,
  isAnimating: false,
  isDone: false,
  speed: 'normal',
  currentLine: 0,

  setStr1Input: v => set({ str1Input: v.toLowerCase().slice(0, 10) }),
  setStr2Input: v => set({ str2Input: v.toLowerCase().slice(0, 10) }),
  setSpeed: s => set({ speed: s }),

  solve: () => {
    cancelAnim()
    const { str1Input, str2Input, speed } = get()
    const s1 = str1Input.trim()
    const s2 = str2Input.trim()
    if (!s1 || !s2) return

    const m = s1.length
    const n = s2.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    const cellOp: EditOp[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill('none' as EditOp))
    const snaps: EditSnap[] = []

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = s1[i - 1] === s2[j - 1]
        if (isMatch) {
          dp[i][j] = dp[i - 1][j - 1]
          cellOp[i][j] = 'match'
        } else {
          const ins = dp[i][j - 1] + 1
          const del = dp[i - 1][j] + 1
          const rep = dp[i - 1][j - 1] + 1
          const minVal = Math.min(ins, del, rep)
          dp[i][j] = minVal
          cellOp[i][j] = minVal === rep ? 'replace' : minVal === del ? 'delete' : 'insert'
        }
        snaps.push({
          table: dp.map(r => [...r]),
          activeRow: i,
          activeCol: j,
          phase: 'fill',
          ops: [],
          cellOp: cellOp.map(r => [...r]),
          currentLine: isMatch ? 7 : 9,
        })
      }
    }

    // Backtrack to find operations
    const ops: EditStep[] = []
    let i = m, j = n
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) {
        i--; j--
      } else if (i > 0 && j > 0 && cellOp[i][j] === 'replace') {
        ops.unshift({ op: 'replace', from: s1[i - 1], to: s2[j - 1], pos: i - 1 })
        snaps.push({
          table: dp.map(r => [...r]),
          activeRow: i,
          activeCol: j,
          phase: 'backtrack',
          ops: [...ops],
          cellOp: cellOp.map(r => [...r]),
          currentLine: 12,
        })
        i--; j--
      } else if (j > 0 && (i === 0 || cellOp[i][j] === 'insert')) {
        ops.unshift({ op: 'insert', to: s2[j - 1], pos: j - 1 })
        snaps.push({
          table: dp.map(r => [...r]),
          activeRow: i,
          activeCol: j,
          phase: 'backtrack',
          ops: [...ops],
          cellOp: cellOp.map(r => [...r]),
          currentLine: 12,
        })
        j--
      } else {
        ops.unshift({ op: 'delete', from: s1[i - 1], pos: i - 1 })
        snaps.push({
          table: dp.map(r => [...r]),
          activeRow: i,
          activeCol: j,
          phase: 'backtrack',
          ops: [...ops],
          cellOp: cellOp.map(r => [...r]),
          currentLine: 12,
        })
        i--
      }
    }

    snaps.push({
      table: dp.map(r => [...r]),
      activeRow: -1,
      activeCol: -1,
      phase: 'done',
      ops: [...ops],
      cellOp: cellOp.map(r => [...r]),
      currentLine: 13,
    })

    set({ str1: s1, str2: s2, table: dp, isAnimating: true, isDone: false })

    const delay = SPEED_DELAY[speed]
    const gen = ++animGen

    snaps.forEach((snap, k) => {
      const t = setTimeout(() => {
        if (animGen !== gen) return
        useEditDistanceStore.setState({
          currentSnap: snap,
          currentLine: snap.currentLine ?? 0,
          isAnimating: k < snaps.length - 1,
          isDone: snap.phase === 'done',
        })
      }, k * delay)
      animTimers.push(t)
    })
  },

  reset: () => {
    cancelAnim()
    set({
      str1: 'kitten',
      str2: 'sitting',
      str1Input: 'kitten',
      str2Input: 'sitting',
      table: [],
      currentSnap: null,
      isAnimating: false,
      isDone: false,
    })
  },
}))
