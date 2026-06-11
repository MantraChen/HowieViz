import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export interface StackElement {
  id: string
  value: number
  highlight?: 'default' | 'active' | 'inserted' | 'deleted'
}

interface StackStore {
  elements: StackElement[]  // index 0 = bottom of stack, last = top
  speed: AnimationSpeed
  inputValue: string
  setInputValue: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  push: (value: number) => void
  pop: () => void
  peek: () => void
  clear: () => void
  clearHighlights: () => void
  reset: () => void
}

const DEFAULT_ELEMENTS: StackElement[] = [3, 7, 15, 24, 8].map((v) => ({
  id: nanoid(),
  value: v,
  highlight: 'default',
}))

export const useStackStore = create<StackStore>((set) => ({
  elements: DEFAULT_ELEMENTS,
  speed: 'normal',
  inputValue: '',

  setInputValue: (v) => set({ inputValue: v }),
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

  peek: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      const updated: StackElement[] = state.elements.map((el) => ({ ...el, highlight: 'default' as const }))
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'active' as const }
      return { elements: updated }
    }),

  clear: () =>
    set((state) => {
      if (state.elements.length === 0) return state
      return { elements: state.elements.map((el) => ({ ...el, highlight: 'deleted' as const })) }
    }),

  reset: () => set({ elements: DEFAULT_ELEMENTS.map((el) => ({ ...el, id: nanoid(), highlight: 'default' })) }),
}))
