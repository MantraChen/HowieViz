import { ArrayVisualizer } from '@/visualizers/ArrayVisualizer'
import { ArrayControls } from '@/components/ArrayControls'

const COMPLEXITY_ROWS = [
  { op: 'Access (index)',   time: 'O(1)' },
  { op: 'Push (end)',       time: 'O(1) amortized' },
  { op: 'Pop (end)',        time: 'O(1)' },
  { op: 'Insert (middle)',  time: 'O(n)' },
  { op: 'Delete (middle)',  time: 'O(n)' },
  { op: 'Search',           time: 'O(n)' },
]

function complexityClass(time: string): string {
  if (time.startsWith('O(1)'))    return 'text-[#d4a8ff] font-bold'
  if (time.startsWith('O(log)'))  return 'text-[#b892e8] font-semibold'
  return 'text-[#a78bde] font-medium'
}

export function ArrayPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Array</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          A contiguous block of memory storing elements at indexed positions.
          Visualize push, pop, insert, and delete with live animations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <ArrayVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <ArrayControls />
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#e1d2e9] tracking-wide">Complexity</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a1f3d]">
                  <th className="w-1/2 text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Operation</th>
                  <th className="w-1/2 text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Time</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_ROWS.map(({ op, time }) => (
                  <tr key={op} className="border-b border-[#1e1630] last:border-0">
                    <td className="w-1/2 py-2 text-[#e1d2e9]">{op}</td>
                    <td className={`w-1/2 py-2 text-right font-mono ${complexityClass(time)}`}>{time}</td>
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
