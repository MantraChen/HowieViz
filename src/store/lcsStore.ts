import { create } from 'zustand'
import type { AnimationSpeed } from '@/types'

export interface LCSSnap {
  table: number[][]
  activeRow: number
  activeCol: number
  phase: 'fill' | 'backtrack' | 'done'
  lcsIndices1: number[]
  lcsIndices2: number[]
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 120, normal: 60, fast: 15 }
let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

interface LCSStore {
  str1: string
  str2: string
  str1Input: string
  str2Input: string
  table: number[][]
  currentSnap: LCSSnap | null
  lcsString: string
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

export const useLCSStore = create<LCSStore>((set, get) => ({
  str1: 'ABCBDAB',
  str2: 'BDCAB',
  str1Input: 'ABCBDAB',
  str2Input: 'BDCAB',
  table: [],
  currentSnap: null,
  lcsString: '',
  isAnimating: false,
  isDone: false,
  speed: 'normal',
  currentLine: 0,

  setStr1Input: v => set({ str1Input: v.toUpperCase().slice(0, 12) }),
  setStr2Input: v => set({ str2Input: v.toUpperCase().slice(0, 12) }),
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
    const snaps: LCSSnap[] = []

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
        snaps.push({
          table: dp.map(r => [...r]),
          activeRow: i,
          activeCol: j,
          phase: 'fill',
          lcsIndices1: [],
          lcsIndices2: [],
        })
      }
    }

    // Backtrack
    const idx1: number[] = []
    const idx2: number[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (s1[i - 1] === s2[j - 1]) {
        idx1.unshift(i - 1)
        idx2.unshift(j - 1)
        snaps.push({
          table: dp.map(r => [...r]),
          activeRow: i,
          activeCol: j,
          phase: 'backtrack',
          lcsIndices1: [...idx1],
          lcsIndices2: [...idx2],
        })
        i--; j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    snaps.push({
      table: dp.map(r => [...r]),
      activeRow: -1,
      activeCol: -1,
      phase: 'done',
      lcsIndices1: [...idx1],
      lcsIndices2: [...idx2],
    })

    const lcsString = idx1.map(k => s1[k]).join('')
    set({ str1: s1, str2: s2, table: dp, lcsString, isAnimating: true, isDone: false })

    const delay = SPEED_DELAY[speed]
    const gen = ++animGen

    snaps.forEach((snap, k) => {
      const t = setTimeout(() => {
        if (animGen !== gen) return
        useLCSStore.setState({
          currentSnap: snap,
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
      str1: 'ABCBDAB',
      str2: 'BDCAB',
      str1Input: 'ABCBDAB',
      str2Input: 'BDCAB',
      table: [],
      currentSnap: null,
      lcsString: '',
      isAnimating: false,
      isDone: false,
    })
  },
}))
