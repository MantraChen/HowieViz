import { SegmentTreeVisualizer } from '@/visualizers/SegmentTreeVisualizer'
import { SegmentTreeControls } from '@/components/SegmentTreeControls'

const COMPLEXITY_ROWS = [
  { op: 'Build', time: 'O(n)' },
  { op: 'Range Query', time: 'O(log n)' },
  { op: 'Point Update', time: 'O(log n)' },
]

function complexityClass(time: string): string {
  if (time.startsWith('O(1)')) return 'text-[#d4a8ff] font-bold'
  if (time.includes('log'))    return 'text-[#b892e8] font-semibold'
  return 'text-[#a78bde] font-medium'
}

export function SegmentTreePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Segment Tree</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          A complete binary tree where each node stores the aggregate (sum) of a range.
          Range queries traverse only O(log n) nodes. Each node shows its range [l, r] and its sum.
          Default array: [1, 3, 5, 7, 9, 11] (0-indexed).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <SegmentTreeVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <SegmentTreeControls />
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#e1d2e9] tracking-wide">Complexity</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a1f3d]">
                  <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Operation</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Time</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_ROWS.map(({ op, time }) => (
                  <tr key={op} className="border-b border-[#1e1630] last:border-0">
                    <td className="py-2 text-[#e1d2e9]">{op}</td>
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
