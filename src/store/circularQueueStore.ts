import { create } from 'zustand'
import { nanoid } from 'nanoid'

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export type CQHighlight = 'empty' | 'filled' | 'inserted' | 'deleted'

export interface CQSlot {
  id: string
  value: number | null
  highlight: CQHighlight
}

interface CQStore {
  slots: CQSlot[]
  front: number
  rear: number
  size: number
  capacity: number
  inputValue: string
  statusText: string
  currentLine: number
  steps: { time: string; text: string }[]
  setInputValue: (v: string) => void
  setCapacity: (n: number) => void
  enqueue: (value: number) => void
  dequeue: () => void
  reset: () => void
  clearSteps: () => void
  loadCustom: (vals: number[]) => void
}

function makeSlots(n: number): CQSlot[] {
  return Array.from({ length: n }, () => ({
    id: nanoid(),
    value: null,
    highlight: 'empty' as CQHighlight,
  }))
}

export const useCircularQueueStore = create<CQStore>((set, get) => ({
  slots: makeSlots(6),
  front: 0,
  rear: 0,
  size: 0,
  capacity: 6,
  inputValue: '',
  statusText: 'Ready — use controls to interact.',
  currentLine: 0,
  steps: [],

  setInputValue: v => set({ inputValue: v }),
  clearSteps: () => set({ steps: [] }),

  setCapacity: n =>
    set({ slots: makeSlots(n), capacity: n, front: 0, rear: 0, size: 0, statusText: `Capacity set to ${n}`, steps: [] }),

  enqueue: value => {
    const { slots, rear, size, capacity } = get()
    if (size >= capacity) return
    const ns = slots.map(s =>
      s.highlight === 'inserted' ? { ...s, highlight: 'filled' as CQHighlight } : s,
    )
    ns[rear] = { ...ns[rear], value, highlight: 'inserted' }
    set(state => ({
      slots: ns,
      rear: (rear + 1) % capacity,
      size: size + 1,
      statusText: `Enqueued ${value} at slot ${rear}`,
      currentLine: 5,
      steps: [...state.steps, { time: nowTime(), text: `Enqueued ${value} at slot ${rear}` }],
    }))
    setTimeout(() => useCircularQueueStore.setState({ currentLine: 0 }), 500)
    setTimeout(() => {
      useCircularQueueStore.setState(s => ({
        slots: s.slots.map(sl =>
          sl.highlight === 'inserted' ? { ...sl, highlight: 'filled' } : sl,
        ),
      }))
    }, 600)
  },

  dequeue: () => {
    const { slots, front, size } = get()
    if (size === 0) return
    const val = slots[front].value
    const ns = [...slots]
    ns[front] = { ...ns[front], highlight: 'deleted' }
    set(state => ({
      slots: ns,
      statusText: `Dequeued ${val} from slot ${front}`,
      currentLine: 10,
      steps: [...state.steps, { time: nowTime(), text: `Dequeued ${val} from slot ${front}` }],
    }))
    setTimeout(() => useCircularQueueStore.setState({ currentLine: 0 }), 500)
    setTimeout(() => {
      useCircularQueueStore.setState(s => {
        const f = s.front
        const updated = [...s.slots]
        updated[f] = { ...updated[f], value: null, highlight: 'empty' }
        return { slots: updated, front: (f + 1) % s.capacity, size: s.size - 1 }
      })
    }, 700)
  },

  loadCustom: (vals) => {
    const { capacity } = get()
    const cap = Math.max(capacity, vals.length)
    const slots = makeSlots(cap)
    vals.forEach((v, i) => {
      slots[i] = { ...slots[i], value: v, highlight: 'filled' }
    })
    set({
      slots,
      front: 0,
      rear: vals.length % cap,
      size: vals.length,
      capacity: cap,
      statusText: `Loaded ${vals.length} custom values`,
      steps: [],
    })
  },

  reset: () => {
    const { capacity } = get()
    set({ slots: makeSlots(capacity), front: 0, rear: 0, size: 0, statusText: 'Ready — use controls to interact.', steps: [] })
  },
}))
