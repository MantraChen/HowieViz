import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export interface QueueElement {
  id: string
  value: number
  highlight?: 'default' | 'active' | 'inserted' | 'deleted'
}

interface QueueStore {
  elements: QueueElement[]  // index 0 = front, last = rear
  speed: AnimationSpeed
  inputValue: string
  statusText: string
  steps: { time: string; text: string }[]
  setInputValue: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  enqueue: (value: number) => void
  dequeue: () => void
  peek: () => void
  clear: () => void
  clearHighlights: () => void
  reset: () => void
  clearSteps: () => void
  loadCustom: (vals: number[]) => void
}

const DEFAULT_ELEMENTS: QueueElement[] = [12, 5, 30, 8, 21].map((v) => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

let resetTimer: ReturnType<typeof setTimeout> | null = null

export const useQueueStore = create<QueueStore>((set, get) => ({
  elements: DEFAULT_ELEMENTS,
  speed: 'normal',
  inputValue: '',
  statusText: 'Ready — use controls to interact.',
  steps: [],

  setInputValue: (v) => set({ inputValue: v }),
  setSpeed: (s) => set({ speed: s }),
  clearSteps: () => set({ steps: [] }),

  clearHighlights: () =>
    set((state) => ({
      elements: state.elements.map((el) => ({ ...el, highlight: 'default' as const })),
    })),

  enqueue: (value) =>
    set((state) => ({
      elements: [
        ...state.elements.map((el) => ({ ...el, highlight: 'default' as const })),
        { id: nanoid(), value, highlight: 'inserted' as const },
      ],
      statusText: `Enqueued ${value} to rear`,
      steps: [...state.steps, { time: nowTime(), text: `Enqueued ${value} to rear` }],
    })),

  dequeue: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      const frontVal = state.elements[0].value
      const updated = [...state.elements]
      updated[0] = { ...updated[0], highlight: 'deleted' as const }
      return {
        elements: updated,
        statusText: `Dequeued ${frontVal} from front`,
        steps: [...state.steps, { time: nowTime(), text: `Dequeued ${frontVal} from front` }],
      }
    }),

  peek: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      const frontVal = state.elements[0].value
      const updated: QueueElement[] = state.elements.map((el) => ({ ...el, highlight: 'default' as const }))
      updated[0] = { ...updated[0], highlight: 'active' as const }
      return {
        elements: updated,
        statusText: `Peek → front is ${frontVal}`,
        steps: [...state.steps, { time: nowTime(), text: `Peek — front value is ${frontVal}` }],
      }
    }),

  clear: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      return {
        elements: state.elements.map((el) => ({ ...el, highlight: 'deleted' as const })),
        statusText: 'Queue cleared',
        steps: [...state.steps, { time: nowTime(), text: 'Queue cleared' }],
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
      useQueueStore.setState({
        elements: DEFAULT_ELEMENTS.map((el) => ({ ...el, id: nanoid(), highlight: 'default' as const })),
        statusText: 'Ready — use controls to interact.',
        steps: [],
      })
    }, 650)
  },
}))
