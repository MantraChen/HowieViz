import { createSortStore } from './sortStore'
import type { SortStep, BarHighlight } from './sortStore'

function generateSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = []
  const a = [...input]
  const n = a.length
  let sortedFrom = n

  function snap(overrides: Partial<Record<number, BarHighlight>>, desc: string) {
    steps.push({
      bars: a.map((v, i) => ({
        value: v,
        highlight: i >= sortedFrom ? 'sorted' : (overrides[i] ?? 'default'),
      })),
      description: desc,
    })
  }

  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false
    snap({}, `Pass ${pass + 1}`)
    steps[steps.length - 1].currentLine = 1

    for (let j = 0; j < n - 1 - pass; j++) {
      snap({ [j]: 'comparing', [j + 1]: 'comparing' },
        `Pass ${pass + 1}: compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}`)
      steps[steps.length - 1].currentLine = 4

      if (a[j] > a[j + 1]) {
        snap({ [j]: 'swapping', [j + 1]: 'swapping' },
          `Pass ${pass + 1}: swap ${a[j]} ↔ ${a[j + 1]}`)
        steps[steps.length - 1].currentLine = 5
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        snap({ [j]: 'swapping', [j + 1]: 'swapping' },
          `Pass ${pass + 1}: → ${a[j]} and ${a[j + 1]}`)
        steps[steps.length - 1].currentLine = 6
        swapped = true
      }
    }

    sortedFrom = n - 1 - pass
    if (!swapped) break
  }

  steps.push({
    bars: a.map(v => ({ value: v, highlight: 'sorted' as BarHighlight })),
    description: 'Array is sorted!',
    currentLine: 8,
  })

  return steps
}

export const useBubbleSortStore = createSortStore(generateSteps)
