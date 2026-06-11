import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { ArrayPage } from '@/pages/ArrayPage'
import { StackPage } from '@/pages/StackPage'
import { QueuePage } from '@/pages/QueuePage'
import { LinkedListPage } from '@/pages/LinkedListPage'
import { HeapPage } from '@/pages/HeapPage'
import { BSTPage } from '@/pages/BSTPage'
import { GraphPage } from '@/pages/GraphPage'
import { QuicksortPage } from '@/pages/QuicksortPage'
import { MergeSortPage } from '@/pages/MergeSortPage'
import { DijkstraPage } from '@/pages/DijkstraPage'
import { UnionFindPage } from '@/pages/UnionFindPage'
import { TriePage } from '@/pages/TriePage'
import { SegmentTreePage } from '@/pages/SegmentTreePage'
import { FenwickPage } from '@/pages/FenwickPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="visualizer/array" element={<ArrayPage />} />
        <Route path="visualizer/stack" element={<StackPage />} />
        <Route path="visualizer/queue" element={<QueuePage />} />
        <Route path="visualizer/linked-list" element={<LinkedListPage />} />
        <Route path="visualizer/binary-heap" element={<HeapPage />} />
        <Route path="visualizer/bst" element={<BSTPage />} />
        <Route path="visualizer/graph" element={<GraphPage />} />
        <Route path="visualizer/quicksort" element={<QuicksortPage />} />
        <Route path="visualizer/merge-sort" element={<MergeSortPage />} />
        <Route path="visualizer/dijkstra" element={<DijkstraPage />} />
        <Route path="visualizer/union-find" element={<UnionFindPage />} />
        <Route path="visualizer/trie" element={<TriePage />} />
        <Route path="visualizer/segment-tree" element={<SegmentTreePage />} />
        <Route path="visualizer/fenwick-tree" element={<FenwickPage />} />
      </Route>
    </Routes>
  )
}
