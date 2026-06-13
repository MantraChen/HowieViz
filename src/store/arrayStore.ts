import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { ArrayElement, AnimationSpeed } from '@/types'

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

interface ArrayStore {
  elements: ArrayElement[]
  speed: AnimationSpeed
  inputValue: string
  inputIndex: string
  statusText: string
  steps: { time: string; text: string }[]
  currentLine: number
  setInputValue: (v: string) => void
  setInputIndex: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  push: (value: number) => void
  pop: () => void
  insert: (index: number, value: number) => void
  remove: (index: number) => void
  reset: () => void
  clearHighlights: () => void
  clearSteps: () => void
  loadCustom: (vals: number[]) => void
}

const DEFAULT_ELEMENTS: ArrayElement[] = [10, 25, 7, 42, 18].map((v) => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

let resetTimer: ReturnType<typeof setTimeout> | null = null

export const useArrayStore = create<ArrayStore>((set, get) => ({
  elements: DEFAULT_ELEMENTS,
  speed: 'normal',
  inputValue: '',
  inputIndex: '',
  statusText: 'Ready — use controls to interact.',
  steps: [],
  currentLine: 0,

  setInputValue: (v) => set({ inputValue: v }),
  setInputIndex: (v) => set({ inputIndex: v }),
  setSpeed: (s) => set({ speed: s }),
  clearSteps: () => set({ steps: [] }),

  clearHighlights: () =>
    set((state) => ({
      elements: state.elements.map((el) => ({ ...el, highlight: 'default' as const })),
    })),

  push: (value) => {
    set((state) => ({
      elements: [
        ...state.elements.map((el) => ({ ...el, highlight: 'default' as const })),
        { id: nanoid(), value, highlight: 'inserted' as const },
      ],
      statusText: `Pushed ${value}`,
      steps: [...state.steps, { time: nowTime(), text: `Pushed ${value} to end` }],
      currentLine: 2,
    }))
    setTimeout(() => useArrayStore.setState({ currentLine: 0 }), 500)
  },

  pop: () => {
    set((state) => {
      if (state.elements.length === 0) return state
      const topVal = state.elements[state.elements.length - 1].value
      const updated = [...state.elements]
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'deleted' as const }
      return {
        elements: updated,
        statusText: `Popped ${topVal}`,
        steps: [...state.steps, { time: nowTime(), text: `Popped ${topVal} from end` }],
        currentLine: 4,
      }
    })
    setTimeout(() => useArrayStore.setState({ currentLine: 0 }), 500)
  },

  insert: (index, value) => {
    set((state) => {
      const clamped = Math.max(0, Math.min(index, state.elements.length))
      const updated: ArrayElement[] = state.elements.map((el) => ({ ...el, highlight: 'default' as const }))
      updated.splice(clamped, 0, { id: nanoid(), value, highlight: 'inserted' as const })
      return {
        elements: updated,
        statusText: `Inserted ${value} at index ${clamped}`,
        steps: [...state.steps, { time: nowTime(), text: `Inserted ${value} at index ${clamped}` }],
        currentLine: 7,
      }
    })
    setTimeout(() => useArrayStore.setState({ currentLine: 0 }), 500)
  },

  remove: (index) => {
    set((state) => {
      if (index < 0 || index >= state.elements.length) return state
      const removedVal = state.elements[index].value
      const updated = state.elements.map((el, i) => ({
        ...el,
        highlight: i === index ? ('deleted' as const) : ('default' as const),
      }))
      return {
        elements: updated,
        statusText: `Removed ${removedVal} at index ${index}`,
        steps: [...state.steps, { time: nowTime(), text: `Removed ${removedVal} at index ${index}` }],
        currentLine: 10,
      }
    })
    setTimeout(() => useArrayStore.setState({ currentLine: 0 }), 500)
  },

  loadCustom: (vals) =>
    set({
      elements: vals.map((v) => ({ id: nanoid(), value: v, highlight: 'default' as const })),
      statusText: `Loaded ${vals.length} custom values`,
      steps: [],
    }),

  reset: () => {
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null }
    const { elements } = get()
    if (elements.length === 0) {
      set({
        elements: DEFAULT_ELEMENTS.map((el) => ({ ...el, id: nanoid(), highlight: 'default' as const })),
        statusText: 'Ready — use controls to interact.',
        steps: [],
      })
      return
    }
    set({ elements: elements.map((el) => ({ ...el, highlight: 'deleted' as const })), statusText: 'Resetting...' })
    resetTimer = setTimeout(() => {
      resetTimer = null
      useArrayStore.setState({
        elements: DEFAULT_ELEMENTS.map((el) => ({ ...el, id: nanoid(), highlight: 'default' as const })),
        statusText: 'Ready — use controls to interact.',
        steps: [],
      })
    }, 650)
  },
}))
