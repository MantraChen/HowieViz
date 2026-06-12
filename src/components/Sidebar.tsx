import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types'
import { LayoutList, GitBranch, Network, ArrowUpDown, Search, Home, ChevronRight } from 'lucide-react'

const NAV_ITEMS: NavItem[] = [
  { label: 'Array',               path: '/visualizer/array',           category: 'linear',    description: '' },
  { label: 'Stack',               path: '/visualizer/stack',           category: 'linear',    description: '' },
  { label: 'Queue',               path: '/visualizer/queue',           category: 'linear',    description: '' },
  { label: 'Linked List',         path: '/visualizer/linked-list',     category: 'linear',    description: '' },
  { label: 'Doubly Linked List',  path: '/visualizer/doubly-linked-list', category: 'linear', description: '' },
  { label: 'Circular Queue',      path: '/visualizer/circular-queue',     category: 'linear', description: '' },
  { label: 'Deque',               path: '/visualizer/deque',              category: 'linear', description: '' },
  { label: 'Binary Heap',         path: '/visualizer/binary-heap',     category: 'tree',      description: '' },
  { label: 'BST',                 path: '/visualizer/bst',             category: 'tree',      description: '' },
  { label: 'AVL Tree',            path: '/visualizer/avl-tree',        category: 'tree',      description: '' },
  { label: 'Trie',                path: '/visualizer/trie',            category: 'tree',      description: '' },
  { label: 'Segment Tree',        path: '/visualizer/segment-tree',    category: 'tree',      description: '' },
  { label: 'Fenwick Tree',        path: '/visualizer/fenwick-tree',    category: 'tree',      description: '' },
  { label: 'Graph BFS / DFS',     path: '/visualizer/graph',           category: 'graph',     description: '' },
  { label: "Dijkstra's",          path: '/visualizer/dijkstra',        category: 'graph',     description: '' },
  { label: 'Bellman-Ford',        path: '/visualizer/bellman-ford',    category: 'graph',     description: '' },
  { label: 'Floyd-Warshall',      path: '/visualizer/floyd-warshall',  category: 'graph',     description: '' },
  { label: 'Topological Sort',    path: '/visualizer/topological-sort',category: 'graph',     description: '' },
  { label: "Prim's MST",          path: '/visualizer/prims',           category: 'graph',     description: '' },
  { label: "Kruskal's MST",       path: '/visualizer/kruskals',        category: 'graph',     description: '' },
  { label: 'Union Find',          path: '/visualizer/union-find',      category: 'graph',     description: '' },
  { label: 'Quicksort',           path: '/visualizer/quicksort',       category: 'sorting',   description: '' },
  { label: 'Merge Sort',          path: '/visualizer/merge-sort',      category: 'sorting',   description: '' },
  { label: 'Heap Sort',           path: '/visualizer/heap-sort',       category: 'sorting',   description: '' },
  { label: 'Bubble Sort',         path: '/visualizer/bubble-sort',     category: 'sorting',   description: '' },
  { label: 'Insertion Sort',      path: '/visualizer/insertion-sort',  category: 'sorting',   description: '' },
  { label: 'Counting Sort',       path: '/visualizer/counting-sort',   category: 'sorting',   description: '' },
  { label: 'Radix Sort',          path: '/visualizer/radix-sort',      category: 'sorting',   description: '' },
  { label: 'Binary Search',       path: '/visualizer/binary-search',   category: 'searching', description: '' },
  { label: 'Linear Search',       path: '/visualizer/linear-search',   category: 'searching', description: '' },
]

const CATEGORY_ICONS = {
  linear:    LayoutList,
  tree:      GitBranch,
  graph:     Network,
  sorting:   ArrowUpDown,
  searching: Search,
}

const CATEGORY_LABELS: Record<string, string> = {
  linear:    'Linear',
  tree:      'Trees',
  graph:     'Graphs',
  sorting:   'Sorting',
  searching: 'Searching',
}

const CATEGORY_ORDER = ['linear', 'tree', 'graph', 'sorting', 'searching']

const grouped = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
  if (!acc[item.category]) acc[item.category] = []
  acc[item.category].push(item)
  return acc
}, {})

const linkBase = 'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200'
const linkActive = 'bg-[#744cae] text-white font-medium shadow-[0_0_12px_rgba(180,130,232,0.4)]'
const linkIdle = 'text-[#a78bde] hover:text-[#f0eaf8] hover:bg-[#1e1630]'
const sectionLabel = 'text-xs font-medium text-[#a78bde] uppercase tracking-[0.1em]'

function getInitialCollapsed(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored) return JSON.parse(stored)
  } catch {}
  return {}
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(getInitialCollapsed)

  const toggle = (category: string) => {
    setCollapsed(prev => {
      const next = { ...prev, [category]: !prev[category] }
      try { localStorage.setItem('sidebar-collapsed', JSON.stringify(next)) } catch {}
      return next
    })
  }

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

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="mb-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkIdle)}
          >
            <Home size={15} />
            Home
          </NavLink>
        </div>

        {CATEGORY_ORDER.map(category => {
          const items = grouped[category] ?? []
          const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
          const isCollapsed = !!collapsed[category]
          return (
            <div key={category}>
              <button
                onClick={() => toggle(category)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-[#1e1630] transition-colors duration-150 group"
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-[#a78bde]" />
                  <span className={sectionLabel}>{CATEGORY_LABELS[category]}</span>
                </div>
                <ChevronRight
                  size={12}
                  className="text-[#6b4d8a] transition-transform duration-200"
                  style={{ transform: `rotate(${isCollapsed ? '0deg' : '90deg'})` }}
                />
              </button>

              <div
                style={{
                  maxHeight: isCollapsed ? '0px' : '600px',
                  overflow: 'hidden',
                  transition: 'max-height 0.25s ease',
                }}
              >
                <ul className="space-y-0.5 mt-0.5 mb-1">
                  {items.map(item => (
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
            </div>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[#2a1f3d]">
        <p className="text-xs text-[#3d2d5a] text-center">OI/ICPC Visualizer</p>
      </div>
    </aside>
  )
}
