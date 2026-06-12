import { create } from 'zustand'
import { nanoid } from 'nanoid'

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
  setInputValue: (v: string) => void
  setCapacity: (n: number) => void
  enqueue: (value: number) => void
  dequeue: () => void
  reset: () => void
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

  setInputValue: v => set({ inputValue: v }),

  setCapacity: n =>
    set({ slots: makeSlots(n), capacity: n, front: 0, rear: 0, size: 0 }),

  enqueue: value => {
    const { slots, rear, size, capacity } = get()
    if (size >= capacity) return
    const ns = slots.map(s =>
      s.highlight === 'inserted' ? { ...s, highlight: 'filled' as CQHighlight } : s,
    )
    ns[rear] = { ...ns[rear], value, highlight: 'inserted' }
    set({ slots: ns, rear: (rear + 1) % capacity, size: size + 1 })
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
    const ns = [...slots]
    ns[front] = { ...ns[front], highlight: 'deleted' }
    set({ slots: ns })
    setTimeout(() => {
      useCircularQueueStore.setState(s => {
        const f = s.front
        const updated = [...s.slots]
        updated[f] = { ...updated[f], value: null, highlight: 'empty' }
        return { slots: updated, front: (f + 1) % s.capacity, size: s.size - 1 }
      })
    }, 700)
  },

  reset: () => {
    const { capacity } = get()
    set({ slots: makeSlots(capacity), front: 0, rear: 0, size: 0 })
  },
}))
