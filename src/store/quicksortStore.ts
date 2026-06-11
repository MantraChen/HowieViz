import { createSortStore } from './sortStore'
import type { SortStep, BarHighlight } from './sortStore'

function generateSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = []
  const a = [...input]
  const sortedSet = new Set<number>()

  function hl(overrides: Partial<Record<number, BarHighlight>> = {}): BarHighlight[] {
    return a.map((_, i) => overrides[i] ?? (sortedSet.has(i) ? 'sorted' : 'default'))
  }

  function snap(highlights: BarHighlight[], desc: string) {
    steps.push({ bars: a.map((v, i) => ({ value: v, highlight: highlights[i] })), description: desc })
  }

  function partition(lo: number, hi: number): number {
    const pv = a[hi]
    snap(hl({ [hi]: 'pivot' }), `Pivot = ${pv} at index ${hi}  (range [${lo}..${hi}])`)

    let i = lo - 1
    for (let j = lo; j < hi; j++) {
      snap(hl({ [hi]: 'pivot', [j]: 'comparing' }), `Compare a[${j}] = ${a[j]} with pivot ${pv}`)

      if (a[j] <= pv) {
        i++
        if (i !== j) {
          snap(hl({ [hi]: 'pivot', [i]: 'swapping', [j]: 'swapping' }), `Swap a[${i}] = ${a[i]} ↔ a[${j}] = ${a[j]}`)
          ;[a[i], a[j]] = [a[j], a[i]]
          snap(hl({ [hi]: 'pivot', [i]: 'swapping', [j]: 'swapping' }), `→ a[${i}] = ${a[i]}, a[${j}] = ${a[j]}`)
        }
      }
    }

    i++
    if (i !== hi) {
      snap(hl({ [i]: 'swapping', [hi]: 'swapping' }), `Place pivot ${pv} → index ${i}`)
      ;[a[i], a[hi]] = [a[hi], a[i]]
    }

    sortedSet.add(i)
    snap(hl({}), `Pivot ${a[i]} is at its final position (index ${i})`)
    return i
  }

  function quicksort(lo: number, hi: number) {
    if (lo >= hi) {
      if (lo === hi) sortedSet.add(lo)
      return
    }
    const p = partition(lo, hi)
    quicksort(lo, p - 1)
    quicksort(p + 1, hi)
  }

  quicksort(0, a.length - 1)

  steps.push({
    bars: a.map(v => ({ value: v, highlight: 'sorted' as BarHighlight })),
    description: 'Array is sorted!',
  })

  return steps
}

export const useQuicksortStore = createSortStore(generateSteps)
