import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export interface DLLNode {
  id: string
  value: number
  highlight?: 'default' | 'active' | 'inserted' | 'deleted'
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 800, normal: 400, fast: 150 }

let searchTimers: ReturnType<typeof setTimeout>[] = []
let searchId = 0
let resetTimer: ReturnType<typeof setTimeout> | null = null

function cancelPendingSearch() {
  searchTimers.forEach(clearTimeout)
  searchTimers = []
  searchId++
}

interface DLLStore {
  nodes: DLLNode[]
  speed: AnimationSpeed
  inputValue: string
  inputIndex: string
  isSearching: boolean
  setInputValue: (v: string) => void
  setInputIndex: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  insertHead: (value: number) => void
  insertTail: (value: number) => void
  insertAt: (index: number, value: number) => void
  deleteHead: () => void
  deleteTail: () => void
  deleteAt: (index: number) => void
  search: (value: number) => void
  cancelSearch: () => void
  clearHighlights: () => void
  reset: () => void
}

const DEFAULT_NODES: DLLNode[] = [3, 8, 5, 11, 6].map(v => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

export const useDLLStore = create<DLLStore>((set, get) => ({
  nodes: DEFAULT_NODES,
  speed: 'normal',
  inputValue: '',
  inputIndex: '',
  isSearching: false,

  setInputValue: v => set({ inputValue: v }),
  setInputIndex: v => set({ inputIndex: v }),
  setSpeed: s => set({ speed: s }),

  clearHighlights: () =>
    set(state => ({
      nodes: state.nodes.map(n => ({ ...n, highlight: 'default' as const })),
    })),

  cancelSearch: () => {
    cancelPendingSearch()
    set({ isSearching: false })
    get().clearHighlights()
  },

  insertHead: value => {
    cancelPendingSearch()
    set(state => ({
      isSearching: false,
      nodes: [
        { id: nanoid(), value, highlight: 'inserted' as const },
        ...state.nodes.map(n => ({ ...n, highlight: 'default' as const })),
      ],
    }))
  },

  insertTail: value => {
    cancelPendingSearch()
    set(state => ({
      isSearching: false,
      nodes: [
        ...state.nodes.map(n => ({ ...n, highlight: 'default' as const })),
        { id: nanoid(), value, highlight: 'inserted' as const },
      ],
    }))
  },

  insertAt: (index, value) => {
    cancelPendingSearch()
    set(state => {
      const clamped = Math.max(0, Math.min(index, state.nodes.length))
      const updated: DLLNode[] = state.nodes.map(n => ({ ...n, highlight: 'default' as const }))
      updated.splice(clamped, 0, { id: nanoid(), value, highlight: 'inserted' as const })
      return { isSearching: false, nodes: updated }
    })
  },

  deleteHead: () => {
    cancelPendingSearch()
    set(state => {
      if (state.nodes.length === 0) return state
      const updated = [...state.nodes]
      updated[0] = { ...updated[0], highlight: 'deleted' as const }
      return { isSearching: false, nodes: updated }
    })
  },

  deleteTail: () => {
    cancelPendingSearch()
    set(state => {
      if (state.nodes.length === 0) return state
      const updated = [...state.nodes]
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'deleted' as const }
      return { isSearching: false, nodes: updated }
    })
  },

  deleteAt: index => {
    cancelPendingSearch()
    set(state => {
      if (index < 0 || index >= state.nodes.length) return state
      const updated = state.nodes.map((n, i) => ({
        ...n,
        highlight: i === index ? ('deleted' as const) : ('default' as const),
      }))
      return { isSearching: false, nodes: updated }
    })
  },

  search: value => {
    cancelPendingSearch()
    const nodes = get().nodes
    if (nodes.length === 0) return
    const delay = SPEED_DELAY[get().speed]
    const currentId = ++searchId
    set({ isSearching: true })

    for (let i = 0; i < nodes.length; i++) {
      const idx = i
      const isFound = nodes[i].value === value
      const t = setTimeout(() => {
        if (searchId !== currentId) return
        set(s => ({
          nodes: s.nodes.map((n, j) => ({
            ...n,
            highlight: j === idx ? (isFound ? 'inserted' : 'active') : 'default',
          })),
        }))
        if (isFound || idx === nodes.length - 1) {
          const endT = setTimeout(() => {
            if (searchId !== currentId) return
            set(s => ({
              isSearching: false,
              nodes: s.nodes.map(n => ({ ...n, highlight: 'default' as const })),
            }))
          }, isFound ? delay * 2 : delay)
          searchTimers.push(endT)
        }
      }, (i + 1) * delay)
      searchTimers.push(t)
      if (isFound) break
    }
  },

  reset: () => {
    cancelPendingSearch()
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null }
    const { nodes } = get()
    set({ isSearching: false })
    if (nodes.length === 0) {
      set({ nodes: DEFAULT_NODES.map(n => ({ ...n, id: nanoid(), highlight: 'default' as const })) })
      return
    }
    set({ nodes: nodes.map(n => ({ ...n, highlight: 'deleted' as const })) })
    resetTimer = setTimeout(() => {
      resetTimer = null
      useDLLStore.setState({
        nodes: DEFAULT_NODES.map(n => ({ ...n, id: nanoid(), highlight: 'default' as const })),
      })
    }, 650)
  },
}))
