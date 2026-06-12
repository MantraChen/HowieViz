import { LCSVisualizer } from '@/visualizers/LCSVisualizer'
import { LCSControls } from '@/components/LCSControls'

const COMPLEXITY_ROWS = [
  { op: 'Time',  val: 'O(m × n)' },
  { op: 'Space', val: 'O(m × n)' },
]

export function LCSPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">LCS — Longest Common Subsequence</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          DP table filled cell by cell. After solving, backtrack animates and highlights the matched characters in both strings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <LCSVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <LCSControls />
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#e1d2e9] tracking-wide">Complexity</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a1f3d]">
                  <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Metric</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Bound</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_ROWS.map(({ op, val }) => (
                  <tr key={op} className="border-b border-[#1e1630] last:border-0">
                    <td className="py-2 text-[#e1d2e9]">{op}</td>
                    <td className="py-2 text-right font-mono text-[#b892e8] font-semibold">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[#6b4d8a] mt-2">m = |str1|, n = |str2|</p>
          </div>
        </div>
      </div>
    </div>
  )
}
