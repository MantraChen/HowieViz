import { createSortStore } from './sortStore'
import type { SortStep, BarHighlight } from './sortStore'

function generateSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = []
  const a = [...input]
  const n = a.length

  for (let i = 1; i < n; i++) {
    const key = a[i]

    steps.push({
      bars: a.map((v, idx) => ({
        value: v,
        highlight: idx < i ? 'sorted' : idx === i ? 'pivot' : 'default',
      })),
      description: `Insert a[${i}]=${key} into sorted portion [0..${i - 1}]`,
    })

    let j = i - 1
    while (j >= 0 && a[j] > key) {
      steps.push({
        bars: a.map((v, idx) => ({
          value: v,
          highlight:
            idx < j ? 'sorted' :
            idx === j ? 'comparing' :
            idx === j + 1 ? 'swapping' :
            'default',
        })),
        description: `a[${j}]=${a[j]} > ${key}: shift right`,
      })
      a[j + 1] = a[j]
      j--
    }
    a[j + 1] = key

    steps.push({
      bars: a.map((v, idx) => ({
        value: v,
        highlight: idx <= i ? 'sorted' : 'default',
      })),
      description: `Placed ${key} at index ${j + 1}`,
    })
  }

  steps.push({
    bars: a.map(v => ({ value: v, highlight: 'sorted' as BarHighlight })),
    description: 'Array is sorted!',
  })

  return steps
}

export const useInsertionSortStore = createSortStore(generateSteps)
