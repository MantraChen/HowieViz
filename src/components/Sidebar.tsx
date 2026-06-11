import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types'
import { LayoutList, GitBranch, Network, ArrowUpDown, Search, Home } from 'lucide-react'

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Array',
    path: '/visualizer/array',
    category: 'linear',
    description: 'Dynamic array with push/pop/insert/delete',
  },
  {
    label: 'Stack',
    path: '/visualizer/stack',
    category: 'linear',
    description: 'LIFO structure with push/pop/peek/clear',
  },
  {
    label: 'Queue',
    path: '/visualizer/queue',
    category: 'linear',
    description: 'FIFO structure with enqueue/dequeue/peek/clear',
  },
  {
    label: 'Linked List',
    path: '/visualizer/linked-list',
    category: 'linear',
    description: 'Singly linked list with insert, delete, and search',
  },
  {
    label: 'Binary Heap',
    path: '/visualizer/binary-heap',
    category: 'tree',
    description: 'Min-heap with insert, extract-min, and heapify',
  },
  {
    label: 'BST',
    path: '/visualizer/bst',
    category: 'tree',
    description: 'Binary search tree with insert, delete, and search',
  },
  {
    label: 'Graph BFS / DFS',
    path: '/visualizer/graph',
    category: 'graph',
    description: 'BFS and DFS traversal on an interactive undirected graph',
  },
  {
    label: "Dijkstra's",
    path: '/visualizer/dijkstra',
    category: 'graph',
    description: 'Shortest path on a weighted directed graph',
  },
  {
    label: 'Union Find',
    path: '/visualizer/union-find',
    category: 'graph',
    description: 'Disjoint set union with path compression and union by rank',
  },
  {
    label: 'Trie',
    path: '/visualizer/trie',
    category: 'tree',
    description: 'Prefix tree with insert, search, and delete',
  },
  {
    label: 'Segment Tree',
    path: '/visualizer/segment-tree',
    category: 'tree',
    description: 'Range sum queries and point updates in O(log n)',
  },
  {
    label: 'Fenwick Tree',
    path: '/visualizer/fenwick-tree',
    category: 'tree',
    description: 'Binary indexed tree for prefix sums and updates',
  },
  {
    label: 'Quicksort',
    path: '/visualizer/quicksort',
    category: 'sorting',
    description: 'In-place divide and conquer with pivot partitioning',
  },
  {
    label: 'Merge Sort',
    path: '/visualizer/merge-sort',
    category: 'sorting',
    description: 'Stable divide and conquer — split, sort, merge',
  },
]

const CATEGORY_ICONS = {
  linear: LayoutList,
  tree: GitBranch,
  graph: Network,
  sorting: ArrowUpDown,
  searching: Search,
}

const CATEGORY_LABELS: Record<string, string> = {
  linear: 'Linear',
  tree: 'Trees',
  graph: 'Graphs',
  sorting: 'Sorting',
  searching: 'Searching',
}

const grouped = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
  if (!acc[item.category]) acc[item.category] = []
  acc[item.category].push(item)
  return acc
}, {})

const linkBase = 'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200'
const linkActive = 'bg-[#744cae] text-white font-medium shadow-[0_0_12px_rgba(180,130,232,0.4)]'
const linkIdle = 'text-[#a78bde] hover:text-[#f0eaf8] hover:bg-[#1e1630]'

const sectionLabel = 'text-xs font-medium text-[#a78bde] uppercase tracking-[0.1em]'

export function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 border-r border-[#2a1f3d] bg-[#0a0812] flex flex-col">
      <div className="p-4 border-b border-[#2a1f3d]">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-[#744cae] flex items-center justify-center shadow-[0_0_12px_rgba(116,76,174,0.55)]">
            <span className="text-xs font-bold text-white">HV</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#f0eaf8]">HowieViz</span>
        </NavLink>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        <div>
          <NavLink
            to="/"
            end
            className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkIdle)}
          >
            <Home size={15} />
            Home
          </NavLink>
        </div>

        {Object.entries(grouped).map(([category, items]) => {
          const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
          return (
            <div key={category}>
              <div className="flex items-center gap-1.5 px-3 mb-1.5">
                <Icon size={12} className="text-[#a78bde]" />
                <span className={sectionLabel}>{CATEGORY_LABELS[category]}</span>
              </div>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkIdle)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        <div className="pt-2">
          <p className={cn(sectionLabel, 'px-3 mb-1.5')}>Coming Soon</p>
          {['Heap Sort', 'Binary Search', 'AVL Tree'].map((name) => (
            <div key={name} className="flex items-center px-3 py-2 text-sm text-[#3d2d5a] cursor-not-allowed">
              {name}
            </div>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-[#2a1f3d]">
        <p className="text-xs text-[#3d2d5a] text-center">OI/ICPC Visualizer</p>
      </div>
    </aside>
  )
}
