import { useMergeSortStore } from '@/store/mergeSortStore'
import { SortVisualizer } from '@/visualizers/SortVisualizer'
import { SortControls } from '@/components/SortControls'

const COMPLEXITY = [
  { case: 'Best',    time: 'O(n log n)' },
  { case: 'Average', time: 'O(n log n)' },
  { case: 'Worst',   time: 'O(n log n)' },
  { case: 'Space',   time: 'O(n)'       },
]

function complexityClass(time: string): string {
  if (time.startsWith('O(1)')) return 'text-[#d4a8ff] font-bold'
  if (time.includes('log'))    return 'text-[#b892e8] font-semibold'
  return 'text-[#a78bde] font-medium'
}

export function MergeSortPage() {
  const store = useMergeSortStore()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Merge Sort</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          Divide and conquer: split the array in half recursively, then merge sorted halves back together.
          Left subarray is teal-violet, right is soft-violet; placed elements glow when merged.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <SortVisualizer bars={store.bars} description={store.description} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <SortControls
              arraySize={store.arraySize}
              speed={store.speed}
              isAnimating={store.isAnimating}
              isSorted={store.isSorted}
              onSetArraySize={store.setArraySize}
              onSetSpeed={store.setSpeed}
              onRandomize={store.randomize}
              onSort={store.sort}
              onReset={store.reset}
            />
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#e1d2e9] tracking-wide">Complexity</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a1f3d]">
                  <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Case</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Time</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY.map(({ case: c, time }) => (
                  <tr key={c} className="border-b border-[#1e1630] last:border-0">
                    <td className="py-2 text-[#e1d2e9]">{c}</td>
                    <td className={`py-2 text-right font-mono ${complexityClass(time)}`}>{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
