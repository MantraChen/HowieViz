import { useCountingSortStore } from '@/store/countingSortStore'
import { CountingSortVisualizer } from '@/visualizers/CountingSortVisualizer'
import { CountingSortControls } from '@/components/CountingSortControls'

const COMPLEXITY = [
  { label: 'Time',  value: 'O(n + k)' },
  { label: 'Space', value: 'O(k)'     },
]

export function CountingSortPage() {
  const { step } = useCountingSortStore()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Counting Sort</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          A non-comparison sort for integers in a fixed range. Three phases: count occurrences,
          build prefix sums, then place each element in its sorted position. Values here are 0–20.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <CountingSortVisualizer step={step} description={step.description} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <CountingSortControls />
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
            <p className="text-[10px] text-[#3d2d5a] mt-2">n = array size, k = value range (21)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
