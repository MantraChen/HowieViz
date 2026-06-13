import { create } from 'zustand'
import { nanoid } from 'nanoid'

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

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
  statusText: string
  currentLine: number
  steps: { time: string; text: string }[]
  setInputValue: (v: string) => void
  pushFront: (value: number) => void
  pushRear: (value: number) => void
  popFront: () => void
  popRear: () => void
  peekFront: () => void
  peekRear: () => void
  reset: () => void
  clearSteps: () => void
  loadCustom: (vals: number[]) => void
}

const clearDefault = (els: DequeElement[]): DequeElement[] =>
  els.map(el => ({ ...el, highlight: 'default' as DequeHighlight }))

export const useDequeStore = create<DequeStore>((set, get) => ({
  elements: makeElements(DEFAULT_VALUES),
  inputValue: '',
  statusText: 'Ready — use controls to interact.',
  currentLine: 0,
  steps: [],

  setInputValue: v => set({ inputValue: v }),
  clearSteps: () => set({ steps: [] }),

  pushFront: value => {
    set(s => ({
      elements: [
        { id: nanoid(), value, highlight: 'push-front' as DequeHighlight },
        ...clearDefault(s.elements),
      ],
      statusText: `Push front: ${value}`,
      currentLine: 3,
      steps: [...s.steps, { time: nowTime(), text: `Pushed ${value} to front` }],
    }))
    setTimeout(() => useDequeStore.setState({ currentLine: 0 }), 500)
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
      statusText: `Push rear: ${value}`,
      currentLine: 5,
      steps: [...s.steps, { time: nowTime(), text: `Pushed ${value} to rear` }],
    }))
    setTimeout(() => useDequeStore.setState({ currentLine: 0 }), 500)
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
    const frontVal = elements[0].value
    set(s => {
      const updated = [...s.elements]
      updated[0] = { ...updated[0], highlight: 'pop-front' }
      return {
        elements: updated,
        statusText: `Pop front: ${frontVal}`,
        currentLine: 7,
        steps: [...s.steps, { time: nowTime(), text: `Popped ${frontVal} from front` }],
      }
    })
    setTimeout(() => useDequeStore.setState({ currentLine: 0 }), 500)
    setTimeout(() => {
      useDequeStore.setState(s => ({
        elements: clearDefault(s.elements.slice(1)),
      }))
    }, 700)
  },

  popRear: () => {
    const { elements } = get()
    if (elements.length === 0) return
    const rearVal = elements[elements.length - 1].value
    set(s => {
      const updated = [...s.elements]
      updated[updated.length - 1] = { ...updated[updated.length - 1], highlight: 'pop-rear' }
      return {
        elements: updated,
        statusText: `Pop rear: ${rearVal}`,
        currentLine: 9,
        steps: [...s.steps, { time: nowTime(), text: `Popped ${rearVal} from rear` }],
      }
    })
    setTimeout(() => useDequeStore.setState({ currentLine: 0 }), 500)
    setTimeout(() => {
      useDequeStore.setState(s => ({
        elements: clearDefault(s.elements.slice(0, -1)),
      }))
    }, 700)
  },

  peekFront: () => {
    const { elements } = get()
    if (elements.length === 0) return
    const frontVal = elements[0].value
    set(s => ({
      elements: s.elements.map((el, i) => ({
        ...el,
        highlight: i === 0 ? ('peek' as DequeHighlight) : 'default',
      })),
      statusText: `Peek front → ${frontVal}`,
      currentLine: 11,
      steps: [...s.steps, { time: nowTime(), text: `Peek front — value is ${frontVal}` }],
    }))
    setTimeout(() => useDequeStore.setState({ currentLine: 0 }), 500)
    setTimeout(() => {
      useDequeStore.setState(s => ({ elements: clearDefault(s.elements) }))
    }, 1000)
  },

  peekRear: () => {
    const { elements } = get()
    if (elements.length === 0) return
    const rearVal = elements[elements.length - 1].value
    set(s => ({
      elements: s.elements.map((el, i) => ({
        ...el,
        highlight:
          i === s.elements.length - 1 ? ('peek' as DequeHighlight) : 'default',
      })),
      statusText: `Peek rear → ${rearVal}`,
      currentLine: 13,
      steps: [...s.steps, { time: nowTime(), text: `Peek rear — value is ${rearVal}` }],
    }))
    setTimeout(() => useDequeStore.setState({ currentLine: 0 }), 500)
    setTimeout(() => {
      useDequeStore.setState(s => ({ elements: clearDefault(s.elements) }))
    }, 1000)
  },

  loadCustom: (vals) =>
    set({
      elements: makeElements(vals),
      statusText: `Loaded ${vals.length} custom values`,
      steps: [],
    }),

  reset: () => set({
    elements: makeElements(DEFAULT_VALUES),
    statusText: 'Ready — use controls to interact.',
    steps: [],
  }),
}))
