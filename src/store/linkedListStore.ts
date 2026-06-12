import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export interface ListNode {
  id: string
  value: number
  highlight?: 'default' | 'active' | 'inserted' | 'deleted'
}

const SPEED_DELAY: Record<AnimationSpeed, number> = {
  slow: 800,
  normal: 400,
  fast: 150,
}

// Module-level timer state so Zustand state stays serializable
let searchTimers: ReturnType<typeof setTimeout>[] = []
let searchId = 0
let resetTimer: ReturnType<typeof setTimeout> | null = null

function cancelPendingSearch() {
  searchTimers.forEach(clearTimeout)
  searchTimers = []
  searchId++
}

interface LinkedListStore {
  nodes: ListNode[]
  speed: AnimationSpeed
  inputValue: string
  inputIndex: string
  isSearching: boolean
  statusText: string
  steps: { time: string; text: string }[]
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
  clearSteps: () => void
  loadCustom: (vals: number[]) => void
}

const DEFAULT_NODES: ListNode[] = [4, 11, 7, 2, 9].map((v) => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

export const useLinkedListStore = create<LinkedListStore>((set, get) => ({
  nodes: DEFAULT_NODES,
  speed: 'normal',
  inputValue: '',
  inputIndex: '',
  isSearching: false,
  statusText: 'Ready — use controls to interact.',
  steps: [],

  setInputValue: (v) => set({ inputValue: v }),
  setInputIndex: (v) => set({ inputIndex: v }),
  setSpeed: (s) => set({ speed: s }),
  clearSteps: () => set({ steps: [] }),

  clearHighlights: () =>
    set((state) => ({
      nodes: state.nodes.map((n) => ({ ...n, highlight: 'default' as const })),
    })),

  cancelSearch: () => {
    cancelPendingSearch()
    set({ isSearching: false })
    get().clearHighlights()
  },

  insertHead: (value) => {
    cancelPendingSearch()
    set((state) => ({
      isSearching: false,
      nodes: [
        { id: nanoid(), value, highlight: 'inserted' as const },
        ...state.nodes.map((n) => ({ ...n, highlight: 'default' as const })),
      ],
      statusText: `Inserted ${value} at head`,
      steps: [...state.steps, { time: nowTime(), text: `Inserted ${value} at head` }],
    }))
  },

  insertTail: (value) => {
    cancelPendingSearch()
    set((state) => ({
      isSearching: false,
      nodes: [
        ...state.nodes.map((n) => ({ ...n, highlight: 'default' as const })),
        { id: nanoid(), value, highlight: 'inserted' as const },
      ],
      statusText: `Inserted ${value} at tail`,
      steps: [...state.steps, { time: nowTime(), text: `Inserted ${value} at tail` }],
    }))
  },

  insertAt: (index, value) => {
    cancelPendingSearch()
    set((state) => {
      const clamped = Math.max(0, Math.min(index, state.nodes.length))
      const updated: ListNode[] = state.nodes.map((n) => ({ ...n, highlight: 'default' as const }))
      updated.splice(clamped, 0, { id: nanoid(), value, highlight: 'inserted' as const })
      return {
        isSearching: false,
        nodes: updated,
        statusText: `Inserted ${value} at index ${clamped}`,
        steps: [...state.steps, { time: nowTime(), text: `Inserted ${value} at index ${clamped}` }],
      }
    })
  },

  deleteHead: () => {
    cancelPendingSearch()
    set((state) => {
      if (state.nodes.length === 0) return state
      const headVal = state.nodes[0].value
      const updated = [...state.nodes]
      updated[0] = { ...updated[0], highlight: 'deleted' as const }
      return {
        isSearching: false,
        nodes: updated,
        statusText: `Deleted ${headVal} from head`,
        steps: [...state.steps, { time: nowTime(), text: `Deleted ${headVal} from head` }],
      }
    })
  },

  deleteTail: () => {
    cancelPendingSearch()
    set((state) => {
      if (state.nodes.length === 0) return state
      const tailVal = state.nodes[state.nodes.length - 1].value
      const updated = [...state.nodes]
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'deleted' as const }
      return {
        isSearching: false,
        nodes: updated,
        statusText: `Deleted ${tailVal} from tail`,
        steps: [...state.steps, { time: nowTime(), text: `Deleted ${tailVal} from tail` }],
      }
    })
  },

  deleteAt: (index) => {
    cancelPendingSearch()
    set((state) => {
      if (index < 0 || index >= state.nodes.length) return state
      const val = state.nodes[index].value
      const updated = state.nodes.map((n, i) => ({
        ...n,
        highlight: i === index ? ('deleted' as const) : ('default' as const),
      }))
      return {
        isSearching: false,
        nodes: updated,
        statusText: `Deleted ${val} at index ${index}`,
        steps: [...state.steps, { time: nowTime(), text: `Deleted ${val} at index ${index}` }],
      }
    })
  },

  search: (value) => {
    cancelPendingSearch()
    const nodes = get().nodes
    if (nodes.length === 0) return

    const delay = SPEED_DELAY[get().speed]
    const currentId = ++searchId

    set(state => ({
      isSearching: true,
      statusText: `Searching for ${value}…`,
      steps: [...state.steps, { time: nowTime(), text: `Searching for ${value}` }],
    }))

    for (let i = 0; i < nodes.length; i++) {
      const idx = i
      const isFound = nodes[i].value === value

      const t = setTimeout(() => {
        if (searchId !== currentId) return

        set((s) => ({
          nodes: s.nodes.map((n, j) => ({
            ...n,
            highlight: j === idx ? (isFound ? 'inserted' : 'active') : 'default',
          })),
        }))

        if (isFound || idx === nodes.length - 1) {
          const resultText = isFound ? `Found ${value} at index ${idx}` : `${value} not found`
          set(s => ({
            statusText: resultText,
            steps: [...s.steps, { time: nowTime(), text: resultText }],
          }))
          const endT = setTimeout(() => {
            if (searchId !== currentId) return
            set((s) => ({
              isSearching: false,
              nodes: s.nodes.map((n) => ({ ...n, highlight: 'default' as const })),
            }))
          }, isFound ? delay * 2 : delay)
          searchTimers.push(endT)
        }
      }, (i + 1) * delay)
      searchTimers.push(t)

      if (isFound) break
    }
  },

  loadCustom: (vals) => {
    cancelPendingSearch()
    set({
      nodes: vals.map((v) => ({ id: nanoid(), value: v, highlight: 'default' as const })),
      isSearching: false,
      statusText: `Loaded ${vals.length} custom values`,
      steps: [],
    })
  },

  reset: () => {
    cancelPendingSearch()
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null }
    const { nodes } = get()
    set({ isSearching: false, statusText: 'Resetting...' })
    if (nodes.length === 0) {
      set({
        nodes: DEFAULT_NODES.map((n) => ({ ...n, id: nanoid(), highlight: 'default' as const })),
        statusText: 'Ready — use controls to interact.',
        steps: [],
      })
      return
    }
    set({ nodes: nodes.map((n) => ({ ...n, highlight: 'deleted' as const })) })
    resetTimer = setTimeout(() => {
      resetTimer = null
      useLinkedListStore.setState({
        nodes: DEFAULT_NODES.map((n) => ({ ...n, id: nanoid(), highlight: 'default' as const })),
        statusText: 'Ready — use controls to interact.',
        steps: [],
      })
    }, 650)
  },
}))
