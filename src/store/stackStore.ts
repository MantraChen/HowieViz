import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export interface StackElement {
  id: string
  value: number
  highlight?: 'default' | 'active' | 'inserted' | 'deleted'
}

interface StackStore {
  elements: StackElement[]  // index 0 = bottom of stack, last = top
  speed: AnimationSpeed
  inputValue: string
  statusText: string
  steps: { time: string; text: string }[]
  currentLine: number
  setInputValue: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  push: (value: number) => void
  pop: () => void
  peek: () => void
  clear: () => void
  clearHighlights: () => void
  reset: () => void
  clearSteps: () => void
  loadCustom: (vals: number[]) => void
}

const DEFAULT_ELEMENTS: StackElement[] = [3, 7, 15, 24, 8].map((v) => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

let resetTimer: ReturnType<typeof setTimeout> | null = null

export const useStackStore = create<StackStore>((set, get) => ({
  elements: DEFAULT_ELEMENTS,
  speed: 'normal',
  inputValue: '',
  statusText: 'Ready — use controls to interact.',
  steps: [],
  currentLine: 0,

  setInputValue: (v) => set({ inputValue: v }),
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
      statusText: `Pushed ${value} onto stack`,
      steps: [...state.steps, { time: nowTime(), text: `Pushed ${value} onto stack` }],
      currentLine: 3,
    }))
    setTimeout(() => useStackStore.setState({ currentLine: 0 }), 500)
  },

  pop: () => {
    set((state) => {
      if (state.elements.length === 0) return state
      const topVal = state.elements[state.elements.length - 1].value
      const updated = [...state.elements]
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'deleted' as const }
      return {
        elements: updated,
        statusText: `Popped ${topVal} from stack`,
        steps: [...state.steps, { time: nowTime(), text: `Popped ${topVal} from top` }],
        currentLine: 6,
      }
    })
    setTimeout(() => useStackStore.setState({ currentLine: 0 }), 500)
  },

  peek: () => {
    set((state) => {
      if (state.elements.length === 0) return state
      const topVal = state.elements[state.elements.length - 1].value
      const updated: StackElement[] = state.elements.map((el) => ({ ...el, highlight: 'default' as const }))
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'active' as const }
      return {
        elements: updated,
        statusText: `Peek → top is ${topVal}`,
        steps: [...state.steps, { time: nowTime(), text: `Peek — top value is ${topVal}` }],
        currentLine: 9,
      }
    })
    setTimeout(() => useStackStore.setState({ currentLine: 0 }), 500)
  },

  clear: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      return {
        elements: state.elements.map((el) => ({ ...el, highlight: 'deleted' as const })),
        statusText: 'Stack cleared',
        steps: [...state.steps, { time: nowTime(), text: 'Stack cleared' }],
      }
    }),

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
      useStackStore.setState({
        elements: DEFAULT_ELEMENTS.map((el) => ({ ...el, id: nanoid(), highlight: 'default' as const })),
        statusText: 'Ready — use controls to interact.',
        steps: [],
      })
    }, 650)
  },
}))
