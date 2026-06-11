import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { ArrayElement, AnimationSpeed } from '@/types'

interface ArrayStore {
  elements: ArrayElement[]
  speed: AnimationSpeed
  inputValue: string
  inputIndex: string
  setInputValue: (v: string) => void
  setInputIndex: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  push: (value: number) => void
  pop: () => void
  insert: (index: number, value: number) => void
  remove: (index: number) => void
  reset: () => void
  clearHighlights: () => void
}

const DEFAULT_ELEMENTS: ArrayElement[] = [10, 25, 7, 42, 18].map((v) => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

export const useArrayStore = create<ArrayStore>((set) => ({
  elements: DEFAULT_ELEMENTS,
  speed: 'normal',
  inputValue: '',
  inputIndex: '',

  setInputValue: (v) => set({ inputValue: v }),
  setInputIndex: (v) => set({ inputIndex: v }),
  setSpeed: (s) => set({ speed: s }),

  clearHighlights: () =>
    set((state) => ({
      elements: state.elements.map((el) => ({ ...el, highlight: 'default' as const })),
    })),

  push: (value) =>
    set((state) => ({
      elements: [
        ...state.elements.map((el) => ({ ...el, highlight: 'default' as const })),
        { id: nanoid(), value, highlight: 'inserted' as const },
      ],
    })),

  pop: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      const updated = [...state.elements]
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'deleted' as const }
      return { elements: updated }
    }),

  insert: (index, value) =>
    set((state) => {
      const clamped = Math.max(0, Math.min(index, state.elements.length))
      const updated: ArrayElement[] = state.elements.map((el) => ({ ...el, highlight: 'default' as const }))
      updated.splice(clamped, 0, { id: nanoid(), value, highlight: 'inserted' as const })
      return { elements: updated }
    }),

  remove: (index) =>
    set((state) => {
      if (index < 0 || index >= state.elements.length) return state
      const updated = state.elements.map((el, i) => ({
        ...el,
        highlight: i === index ? ('deleted' as const) : ('default' as const),
      }))
      return { elements: updated }
    }),

  reset: () => set({ elements: DEFAULT_ELEMENTS.map((el) => ({ ...el, id: nanoid(), highlight: 'default' })) }),
}))
