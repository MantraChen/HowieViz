import { useRadixSortStore } from '@/store/radixSortStore'
import { RadixSortVisualizer } from '@/visualizers/RadixSortVisualizer'
import { RadixSortControls } from '@/components/RadixSortControls'

const COMPLEXITY = [
  { label: 'Time',  value: 'O(d × (n + k))' },
  { label: 'Space', value: 'O(n + k)'        },
]

export function RadixSortPage() {
  const { step } = useRadixSortStore()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Radix Sort</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          LSD (least-significant digit) radix sort. Elements are distributed into 10 buckets
          digit by digit, from right to left. The active digit is highlighted on each element.
          Values are 10–99 for a clean 2-pass visualization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <RadixSortVisualizer step={step} description={step.description} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <RadixSortControls />
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#e1d2e9] tracking-wide">Complexity</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a1f3d]">
                  <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Metric</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Complexity</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY.map(({ label, value }) => (
                  <tr key={label} className="border-b border-[#1e1630] last:border-0">
                    <td className="py-2 text-[#e1d2e9]">{label}</td>
                    <td className="py-2 text-right font-mono text-[#b892e8] font-semibold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-[#3d2d5a] mt-2">d = digits, n = array size, k = 10 buckets</p>
          </div>
        </div>
      </div>
    </div>
  )
}
