import { FibVisualizer } from '@/visualizers/FibVisualizer'
import { FibControls } from '@/components/FibControls'

const COMPLEXITY_ROWS = [
  { op: 'With Memo',  time: 'O(n)',   space: 'O(n)'   },
  { op: 'Naive',      time: 'O(2ⁿ)',  space: 'O(n)'   },
]

export function FibPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Fibonacci with Memoization</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          Watch the recursion tree build up. Memo hits light up instantly in purple — no further branching. Computed nodes show their result once resolved.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Recursion Tree</h2>
            <FibVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <FibControls />
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#e1d2e9] tracking-wide">Complexity</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a1f3d]">
                  <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Approach</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Time</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Space</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_ROWS.map(({ op, time, space }) => (
                  <tr key={op} className="border-b border-[#1e1630] last:border-0">
                    <td className="py-2 text-[#e1d2e9]">{op}</td>
                    <td className="py-2 text-right font-mono text-[#b892e8] font-semibold">{time}</td>
                    <td className="py-2 text-right font-mono text-[#a78bde]">{space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#c9a0ff]" />
              <span className="text-xs text-[#6b4d8a]">Memo hit — cached result reused</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#9b6fd4]" />
              <span className="text-xs text-[#6b4d8a]">Computing — expanding children</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#c9a0ff]">★</span>
              <span className="text-xs text-[#6b4d8a]">Saved to memo table</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
