import { createSortStore } from './sortStore'
import type { SortStep, BarHighlight } from './sortStore'

function generateSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = []
  const a = [...input]
  const n = a.length
  let sortedFrom = n

  function snap(overrides: Partial<Record<number, BarHighlight>>, desc: string, currentLine?: number) {
    steps.push({
      bars: a.map((v, i) => ({
        value: v,
        highlight: i >= sortedFrom ? 'sorted' : (overrides[i] ?? 'default'),
      })),
      description: desc,
      currentLine,
    })
  }

  function heapifyDown(root: number, heapSize: number, phase: string) {
    let i = root
    while (true) {
      let largest = i
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < heapSize && a[l] > a[largest]) largest = l
      if (r < heapSize && a[r] > a[largest]) largest = r
      if (largest !== i) {
        snap({ [i]: 'comparing', [largest]: 'comparing' },
          `${phase}: compare a[${i}]=${a[i]} with child a[${largest}]=${a[largest]}`, 10)
        snap({ [i]: 'swapping', [largest]: 'swapping' },
          `${phase}: swap ${a[i]} ↔ ${a[largest]}`, 11)
        ;[a[i], a[largest]] = [a[largest], a[i]]
        snap({ [i]: 'swapping', [largest]: 'swapping' },
          `${phase}: → ${a[i]} at ${i}, ${a[largest]} at ${largest}`, 11)
        i = largest
      } else {
        break
      }
    }
  }

  snap({}, 'Building heap...', 6)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    snap({ [i]: 'pivot' }, `Building heap... heapify at index ${i} (value ${a[i]})`, 8)
    heapifyDown(i, n, 'Building heap')
  }
  snap({}, 'Max heap built — extracting max elements', 2)

  for (let end = n - 1; end > 0; end--) {
    snap({ [0]: 'swapping', [end]: 'swapping' },
      `Extracting... swap root ${a[0]} ↔ last ${a[end]}`, 4)
    ;[a[0], a[end]] = [a[end], a[0]]
    sortedFrom = end
    snap({}, `Extracting... ${a[end]} placed at index ${end}`, 5)
    if (end > 1) heapifyDown(0, end, 'Extracting')
  }

  steps.push({
    bars: a.map(v => ({ value: v, highlight: 'sorted' as BarHighlight })),
    description: 'Array is sorted!',
    currentLine: 1,
  })

  return steps
}

export const useHeapSortStore = createSortStore(generateSteps)
