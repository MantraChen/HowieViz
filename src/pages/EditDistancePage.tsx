import { EditDistanceVisualizer } from '@/visualizers/EditDistanceVisualizer'
import { EditDistanceControls } from '@/components/EditDistanceControls'

const COMPLEXITY_ROWS = [
  { op: 'Time',  val: 'O(m × n)' },
  { op: 'Space', val: 'O(m × n)' },
]

export function EditDistancePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Edit Distance (Levenshtein)</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          Fill the DP table, then backtrack to show the minimum sequence of Insert, Delete, and Replace operations to transform one string into another.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <EditDistanceVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <EditDistanceControls />
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
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-4 space-y-1.5">
            <p className="text-xs text-[#a78bde] font-semibold mb-1">Operations</p>
            {[
              { color: '#c9a0ff', label: 'Insert — add character from str2' },
              { color: '#ff6b8a', label: 'Delete — remove character from str1' },
              { color: '#9b6fd4', label: 'Replace — swap one character' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="text-xs text-[#6b4d8a]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
