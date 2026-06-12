import { DequeVisualizer } from '@/visualizers/DequeVisualizer'
import { DequeControls } from '@/components/DequeControls'

const COMPLEXITY = [
  { op: 'Push Front', time: 'O(1)' },
  { op: 'Push Rear',  time: 'O(1)' },
  { op: 'Pop Front',  time: 'O(1)' },
  { op: 'Pop Rear',   time: 'O(1)' },
  { op: 'Peek Front', time: 'O(1)' },
  { op: 'Peek Rear',  time: 'O(1)' },
]

export function DequePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Deque</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          A double-ended queue (deque) supports push and pop from both the front and rear in O(1).
          Front operations slide in/out from the left; rear operations from the right.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <DequeVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <DequeControls />
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
                {COMPLEXITY.map(({ op, time }) => (
                  <tr key={op} className="border-b border-[#1e1630] last:border-0">
                    <td className="py-2 text-[#e1d2e9]">{op}</td>
                    <td className="py-2 text-right font-mono text-[#d4a8ff] font-bold">{time}</td>
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
