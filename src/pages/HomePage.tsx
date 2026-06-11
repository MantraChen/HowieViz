import { Link } from 'react-router-dom'
import { LayoutList, GitBranch, Network, ArrowUpDown, Search, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  {
    icon: LayoutList,
    title: 'Linear Structures',
    description: 'Arrays, stacks, queues, and linked lists with step-by-step operation animations.',
    items: [
      { label: 'Array', path: '/visualizer/array', ready: true },
      { label: 'Stack', path: '/visualizer/stack', ready: true },
      { label: 'Queue', path: '/visualizer/queue', ready: true },
      { label: 'Linked List', path: '/visualizer/linked-list', ready: true },
    ],
  },
  {
    icon: GitBranch,
    title: 'Trees',
    description: 'Binary search trees, heaps, and balanced trees. Visualize rotations and traversals.',
    items: [
      { label: 'Binary Search Tree', path: '/visualizer/bst', ready: true },
      { label: 'Binary Heap', path: '/visualizer/binary-heap', ready: true },
      { label: 'AVL Tree', path: '#', ready: false },
    ],
  },
  {
    icon: Network,
    title: 'Graphs',
    description: 'BFS, DFS, Dijkstra, and more on interactive graph canvases.',
    items: [
      { label: 'BFS / DFS', path: '#', ready: false },
      { label: "Dijkstra's", path: '#', ready: false },
    ],
  },
  {
    icon: ArrowUpDown,
    title: 'Sorting',
    description: 'Watch every comparison and swap in classic sorting algorithms.',
    items: [
      { label: 'Quicksort', path: '#', ready: false },
      { label: 'Merge Sort', path: '#', ready: false },
      { label: 'Heap Sort', path: '#', ready: false },
    ],
  },
  {
    icon: Search,
    title: 'Searching',
    description: 'Binary search and advanced search techniques visualized.',
    items: [{ label: 'Binary Search', path: '#', ready: false }],
  },
]

export function HomePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#f0e8f8]">HowieViz</h1>
        <p className="text-[#a78bde] text-lg">
          Interactive data structure &amp; algorithm visualizer for competitive programmers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map(({ icon: Icon, title, description, items }) => (
          <div
            key={title}
            className="rounded-xl border border-[#2a1f3d] bg-[#120e1a] p-5 hover:border-[#744cae]/50 transition-colors duration-300"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1e1630] border border-[#2a1f3d] flex items-center justify-center">
                <Icon size={16} className="text-[#b892e8]" />
              </div>
              <h2 className="font-semibold text-sm text-[#e1d2e9]">{title}</h2>
            </div>
            <p className="text-[#6b4d8a] text-xs leading-relaxed mb-4">{description}</p>
            <ul className="space-y-1">
              {items.map((item) =>
                item.ready ? (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-[#744cae]/10 hover:bg-[#9b6fd4]/20 text-[#b892e8] hover:text-[#e1d2e9] text-sm transition-all duration-200 group border border-[#744cae]/20 hover:border-[#9b6fd4]/40"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <div className="flex items-center justify-between px-3 py-2 rounded-md text-[#3d2d5a] text-sm cursor-not-allowed">
                      <span>{item.label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#1e1630] text-[#3d2d5a] border border-[#2a1f3d]">
                        Soon
                      </span>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
