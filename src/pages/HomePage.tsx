import { Link } from 'react-router-dom'
import { LayoutList, GitBranch, Network, ArrowUpDown, Search, ChevronRight, BrainCircuit } from 'lucide-react'

const CATEGORIES = [
  {
    icon: LayoutList,
    title: 'Linear Structures',
    description: 'Arrays, stacks, queues, and linked lists with step-by-step operation animations.',
    items: [
      { label: 'Array',              path: '/visualizer/array',              ready: true },
      { label: 'Stack',              path: '/visualizer/stack',              ready: true },
      { label: 'Queue',              path: '/visualizer/queue',              ready: true },
      { label: 'Linked List',        path: '/visualizer/linked-list',        ready: true },
      { label: 'Doubly Linked List', path: '/visualizer/doubly-linked-list', ready: true },
      { label: 'Circular Queue',     path: '/visualizer/circular-queue',     ready: true },
      { label: 'Deque',              path: '/visualizer/deque',              ready: true },
    ],
  },
  {
    icon: GitBranch,
    title: 'Trees',
    description: 'Binary search trees, heaps, tries, and range trees. Visualize traversals and queries.',
    items: [
      { label: 'Binary Search Tree', path: '/visualizer/bst',          ready: true },
      { label: 'AVL Tree',           path: '/visualizer/avl-tree',     ready: true },
      { label: 'Binary Heap',        path: '/visualizer/binary-heap',  ready: true },
      { label: 'Trie',               path: '/visualizer/trie',         ready: true },
      { label: 'Segment Tree',       path: '/visualizer/segment-tree', ready: true },
      { label: 'Fenwick Tree / BIT', path: '/visualizer/fenwick-tree', ready: true },
      { label: 'Red-Black Tree',     path: '/visualizer/red-black-tree', ready: true },
    ],
  },
  {
    icon: Network,
    title: 'Graphs',
    description: 'BFS, DFS, shortest paths, and disjoint sets on interactive graph canvases.',
    items: [
      { label: 'BFS / DFS',         path: '/visualizer/graph',             ready: true },
      { label: "Dijkstra's",         path: '/visualizer/dijkstra',          ready: true },
      { label: 'Bellman-Ford',       path: '/visualizer/bellman-ford',      ready: true },
      { label: 'Floyd-Warshall',     path: '/visualizer/floyd-warshall',    ready: true },
      { label: 'Topological Sort',   path: '/visualizer/topological-sort',  ready: true },
      { label: "Prim's MST",         path: '/visualizer/prims',             ready: true },
      { label: "Kruskal's MST",      path: '/visualizer/kruskals',          ready: true },
      { label: 'Union Find / DSU',   path: '/visualizer/union-find',        ready: true },
    ],
  },
  {
    icon: ArrowUpDown,
    title: 'Sorting',
    description: 'Watch every comparison and swap in classic sorting algorithms.',
    items: [
      { label: 'Quicksort',      path: '/visualizer/quicksort',      ready: true },
      { label: 'Merge Sort',     path: '/visualizer/merge-sort',     ready: true },
      { label: 'Heap Sort',      path: '/visualizer/heap-sort',      ready: true },
      { label: 'Bubble Sort',    path: '/visualizer/bubble-sort',    ready: true },
      { label: 'Insertion Sort', path: '/visualizer/insertion-sort', ready: true },
      { label: 'Counting Sort', path: '/visualizer/counting-sort',  ready: true },
      { label: 'Radix Sort',    path: '/visualizer/radix-sort',     ready: true },
    ],
  },
  {
    icon: Search,
    title: 'Searching',
    description: 'Binary search and linear search techniques visualized.',
    items: [
      { label: 'Binary Search', path: '/visualizer/binary-search', ready: true },
      { label: 'Linear Search', path: '/visualizer/linear-search', ready: true },
    ],
  },
  {
    icon: BrainCircuit,
    title: 'Dynamic Programming',
    description: 'Memoization, tabulation, and optimal substructure — watch DP tables fill in real time.',
    items: [
      { label: 'Fibonacci (Memoization)', path: '/visualizer/fibonacci',      ready: true },
      { label: '0/1 Knapsack',            path: '/visualizer/knapsack',        ready: true },
      { label: 'LCS',                     path: '/visualizer/lcs',             ready: true },
      { label: 'Edit Distance',           path: '/visualizer/edit-distance',   ready: true },
    ],
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
              {items.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-[#744cae]/10 hover:bg-[#9b6fd4]/20 text-[#b892e8] hover:text-[#e1d2e9] text-sm transition-all duration-200 group border border-[#744cae]/20 hover:border-[#9b6fd4]/40"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
