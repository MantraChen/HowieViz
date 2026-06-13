import { createSortStore } from './sortStore'
import type { SortStep, BarHighlight } from './sortStore'

function generateSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = []
  const a = [...input]

  function snap(hl: (i: number) => BarHighlight, desc: string, currentLine?: number) {
    steps.push({ bars: a.map((v, i) => ({ value: v, highlight: hl(i) })), description: desc, currentLine })
  }

  function rangeHl(lo: number, mid: number, hi: number): (i: number) => BarHighlight {
    return i => (i >= lo && i <= mid ? 'comparing' : i > mid && i <= hi ? 'pivot' : 'default')
  }

  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)

    snap(rangeHl(lo, mid, hi), `Merge [${lo}..${mid}] and [${mid + 1}..${hi}]`, 7)

    let li = 0, ri = 0, k = lo

    while (li < left.length && ri < right.length) {
      snap(rangeHl(lo, mid, hi), `Compare ${left[li]} and ${right[ri]}`, 8)

      if (left[li] <= right[ri]) {
        a[k] = left[li++]
      } else {
        a[k] = right[ri++]
      }

      const placed = k++
      snap(
        i => (i >= lo && i <= placed ? 'sorted' : i > placed && i <= mid ? 'comparing' : i > mid && i <= hi ? 'pivot' : 'default'),
        `Placed ${a[placed]} at index ${placed}`,
        8,
      )
    }

    while (li < left.length) { a[k++] = left[li++] }
    while (ri < right.length) { a[k++] = right[ri++] }

    snap(i => (i >= lo && i <= hi ? 'sorted' : 'default'), `Merged [${lo}..${hi}]`, 6)
  }

  function mergeSort(lo: number, hi: number) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    snap(rangeHl(lo, mid, hi), `Split [${lo}..${hi}] → [${lo}..${mid}] | [${mid + 1}..${hi}]`, 1)
    mergeSort(lo, mid)
    mergeSort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  mergeSort(0, a.length - 1)

  steps.push({
    bars: a.map(v => ({ value: v, highlight: 'sorted' as BarHighlight })),
    description: 'Array is sorted!',
    currentLine: 6,
  })

  return steps
}

export const useMergeSortStore = createSortStore(generateSteps)
