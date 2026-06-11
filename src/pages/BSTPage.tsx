import { BSTVisualizer } from '@/visualizers/BSTVisualizer'
import { BSTControls } from '@/components/BSTControls'

const COMPLEXITY_ROWS = [
  { op: 'Insert', avg: 'O(log n)', worst: 'O(n)' },
  { op: 'Delete', avg: 'O(log n)', worst: 'O(n)' },
  { op: 'Search', avg: 'O(log n)', worst: 'O(n)' },
  { op: 'Height', avg: 'O(log n)', worst: 'O(n)' },
]

export function BSTPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f0eaf8]">Binary Search Tree</h1>
        <p className="text-sm text-[#a78bde] mt-1">
          Each node's left subtree contains only smaller values; right subtree only larger.
          Watch traversal paths animate step by step for insert, delete, and search.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Visualization</h2>
            <BSTVisualizer />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#e1d2e9] tracking-wide">Controls</h2>
            <BSTControls />
          </div>

          <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-5">
            <h2 className="text-sm font-semibold mb-3 text-[#e1d2e9] tracking-wide">Complexity</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a1f3d]">
                  <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Operation</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Avg</th>
                  <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Worst</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_ROWS.map(({ op, avg, worst }) => (
                  <tr key={op} className="border-b border-[#1e1630] last:border-0">
                    <td className="py-2 text-[#e1d2e9]">{op}</td>
                    <td className="py-2 text-right font-mono text-[#b892e8] font-semibold">{avg}</td>
                    <td className="py-2 text-right font-mono text-[#a78bde]">{worst}</td>
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
