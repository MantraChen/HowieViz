import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export interface QueueElement {
  id: string
  value: number
  highlight?: 'default' | 'active' | 'inserted' | 'deleted'
}

interface QueueStore {
  elements: QueueElement[]  // index 0 = front, last = rear
  speed: AnimationSpeed
  inputValue: string
  setInputValue: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  enqueue: (value: number) => void
  dequeue: () => void
  peek: () => void
  clear: () => void
  clearHighlights: () => void
  reset: () => void
}

const DEFAULT_ELEMENTS: QueueElement[] = [12, 5, 30, 8, 21].map((v) => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

export const useQueueStore = create<QueueStore>((set) => ({
  elements: DEFAULT_ELEMENTS,
  speed: 'normal',
  inputValue: '',

  setInputValue: (v) => set({ inputValue: v }),
  setSpeed: (s) => set({ speed: s }),

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
    })),

  dequeue: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      const updated = [...state.elements]
      updated[0] = { ...updated[0], highlight: 'deleted' as const }
      return { elements: updated }
    }),

  peek: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      const updated: QueueElement[] = state.elements.map((el) => ({ ...el, highlight: 'default' as const }))
      updated[0] = { ...updated[0], highlight: 'active' as const }
      return { elements: updated }
    }),

  clear: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      return { elements: state.elements.map((el) => ({ ...el, highlight: 'deleted' as const })) }
    }),

  reset: () => set({ elements: DEFAULT_ELEMENTS.map((el) => ({ ...el, id: nanoid(), highlight: 'default' })) }),
}))
