import { LinkedListVisualizer } from '@/visualizers/LinkedListVisualizer'
import { LinkedListControls } from '@/components/LinkedListControls'

const COMPLEXITY_ROWS = [
  { op: 'Insert at Head',  time: 'O(1)' },
  { op: 'Insert at Tail',  time: 'O(n)' },
  { op: 'Insert at Index', time: 'O(n)' },
  { op: 'Delete at Head',  time: 'O(1)' },
  { op: 'Delete at Tail',  time: 'O(n)' },
  { op: 'Search',          time: 'O(n)' },
]

function complexityClass(time: string): string {
  if (time.startsWith('O(1)')) return 'text-[#d4a8ff] font-bold'
  if (time.includes('log'))    return 'text-[#b892e8] font-semibold'
  return 'text-[#a78bde] font-medium'
}

export function LinkedListPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Linked List</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          A sequence of nodes where each node holds a value and a pointer to the next.
          Visualize insertion, deletion, and traversal with live animations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <LinkedListVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <LinkedListControls />
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
