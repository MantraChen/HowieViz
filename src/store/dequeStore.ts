import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type DequeHighlight = 'default' | 'push-front' | 'push-rear' | 'pop-front' | 'pop-rear' | 'peek'

export interface DequeElement {
  id: string
  value: number
  highlight: DequeHighlight
}

const DEFAULT_VALUES = [8, 15, 3, 22, 7]

function makeElements(values: number[]): DequeElement[] {
  return values.map(v => ({ id: nanoid(), value: v, highlight: 'default' as DequeHighlight }))
}

interface DequeStore {
  elements: DequeElement[]
  inputValue: string
  setInputValue: (v: string) => void
  pushFront: (value: number) => void
  pushRear: (value: number) => void
  popFront: () => void
  popRear: () => void
  peekFront: () => void
  peekRear: () => void
  reset: () => void
}

const clearDefault = (els: DequeElement[]): DequeElement[] =>
  els.map(el => ({ ...el, highlight: 'default' as DequeHighlight }))

export const useDequeStore = create<DequeStore>((set, get) => ({
  elements: makeElements(DEFAULT_VALUES),
  inputValue: '',

  setInputValue: v => set({ inputValue: v }),

  pushFront: value => {
    set(s => ({
      elements: [
        { id: nanoid(), value, highlight: 'push-front' as DequeHighlight },
        ...clearDefault(s.elements),
      ],
    }))
    setTimeout(() => {
      useDequeStore.setState(s => ({
        elements: s.elements.map(el =>
          el.highlight === 'push-front' ? { ...el, highlight: 'default' } : el,
        ),
      }))
    }, 600)
  },

  pushRear: value => {
    set(s => ({
      elements: [
        ...clearDefault(s.elements),
        { id: nanoid(), value, highlight: 'push-rear' as DequeHighlight },
      ],
    }))
    setTimeout(() => {
      useDequeStore.setState(s => ({
        elements: s.elements.map(el =>
          el.highlight === 'push-rear' ? { ...el, highlight: 'default' } : el,
        ),
      }))
    }, 600)
  },

  popFront: () => {
    const { elements } = get()
    if (elements.length === 0) return
    set(s => {
      const updated = [...s.elements]
      updated[0] = { ...updated[0], highlight: 'pop-front' }
      return { elements: updated }
    })
    setTimeout(() => {
      useDequeStore.setState(s => ({
        elements: clearDefault(s.elements.slice(1)),
      }))
    }, 700)
  },

  popRear: () => {
    const { elements } = get()
    if (elements.length === 0) return
    set(s => {
      const updated = [...s.elements]
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'pop-rear' }
      return { elements: updated }
    })
    setTimeout(() => {
      useDequeStore.setState(s => ({
        elements: clearDefault(s.elements.slice(0, -1)),
      }))
    }, 700)
  },

  peekFront: () => {
    const { elements } = get()
    if (elements.length === 0) return
    set(s => ({
      elements: s.elements.map((el, i) => ({
        ...el,
        highlight: i === 0 ? ('peek' as DequeHighlight) : 'default',
      })),
    }))
    setTimeout(() => {
      useDequeStore.setState(s => ({ elements: clearDefault(s.elements) }))
    }, 1000)
  },

  peekRear: () => {
    const { elements } = get()
    if (elements.length === 0) return
    set(s => ({
      elements: s.elements.map((el, i) => ({
        ...el,
        highlight:
          i === s.elements.length - 1 ? ('peek' as DequeHighlight) : 'default',
      })),
    }))
    setTimeout(() => {
      useDequeStore.setState(s => ({ elements: clearDefault(s.elements) }))
    }, 1000)
  },

  reset: () => set({ elements: makeElements(DEFAULT_VALUES) }),
}))
