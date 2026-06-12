import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { ArrayPage } from '@/pages/ArrayPage'
import { StackPage } from '@/pages/StackPage'
import { QueuePage } from '@/pages/QueuePage'
import { LinkedListPage } from '@/pages/LinkedListPage'
import { DoublyLinkedListPage } from '@/pages/DoublyLinkedListPage'
import { HeapPage } from '@/pages/HeapPage'
import { BSTPage } from '@/pages/BSTPage'
import { AVLPage } from '@/pages/AVLPage'
import { GraphPage } from '@/pages/GraphPage'
import { QuicksortPage } from '@/pages/QuicksortPage'
import { MergeSortPage } from '@/pages/MergeSortPage'
import { HeapSortPage } from '@/pages/HeapSortPage'
import { BubbleSortPage } from '@/pages/BubbleSortPage'
import { InsertionSortPage } from '@/pages/InsertionSortPage'
import { BinarySearchPage } from '@/pages/BinarySearchPage'
import { DijkstraPage } from '@/pages/DijkstraPage'
import { UnionFindPage } from '@/pages/UnionFindPage'
import { TriePage } from '@/pages/TriePage'
import { SegmentTreePage } from '@/pages/SegmentTreePage'
import { FenwickPage } from '@/pages/FenwickPage'
import { CircularQueuePage } from '@/pages/CircularQueuePage'
import { DequePage } from '@/pages/DequePage'
import { LinearSearchPage } from '@/pages/LinearSearchPage'
import { CountingSortPage } from '@/pages/CountingSortPage'
import { RadixSortPage } from '@/pages/RadixSortPage'
import { BellmanFordPage } from '@/pages/BellmanFordPage'
import { FloydWarshallPage } from '@/pages/FloydWarshallPage'
import { TopoSortPage } from '@/pages/TopoSortPage'
import { PrimsPage } from '@/pages/PrimsPage'
import { KruskalsPage } from '@/pages/KruskalsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="visualizer/array" element={<ArrayPage />} />
        <Route path="visualizer/stack" element={<StackPage />} />
        <Route path="visualizer/queue" element={<QueuePage />} />
        <Route path="visualizer/circular-queue" element={<CircularQueuePage />} />
        <Route path="visualizer/deque" element={<DequePage />} />
        <Route path="visualizer/linked-list" element={<LinkedListPage />} />
        <Route path="visualizer/doubly-linked-list" element={<DoublyLinkedListPage />} />
        <Route path="visualizer/binary-heap" element={<HeapPage />} />
        <Route path="visualizer/bst" element={<BSTPage />} />
        <Route path="visualizer/avl-tree" element={<AVLPage />} />
        <Route path="visualizer/graph" element={<GraphPage />} />
        <Route path="visualizer/quicksort" element={<QuicksortPage />} />
        <Route path="visualizer/merge-sort" element={<MergeSortPage />} />
        <Route path="visualizer/heap-sort" element={<HeapSortPage />} />
        <Route path="visualizer/bubble-sort" element={<BubbleSortPage />} />
        <Route path="visualizer/insertion-sort" element={<InsertionSortPage />} />
        <Route path="visualizer/counting-sort" element={<CountingSortPage />} />
        <Route path="visualizer/radix-sort" element={<RadixSortPage />} />
        <Route path="visualizer/binary-search" element={<BinarySearchPage />} />
        <Route path="visualizer/linear-search" element={<LinearSearchPage />} />
        <Route path="visualizer/dijkstra" element={<DijkstraPage />} />
        <Route path="visualizer/union-find" element={<UnionFindPage />} />
        <Route path="visualizer/trie" element={<TriePage />} />
        <Route path="visualizer/segment-tree" element={<SegmentTreePage />} />
        <Route path="visualizer/fenwick-tree" element={<FenwickPage />} />
        <Route path="visualizer/bellman-ford" element={<BellmanFordPage />} />
        <Route path="visualizer/floyd-warshall" element={<FloydWarshallPage />} />
        <Route path="visualizer/topological-sort" element={<TopoSortPage />} />
        <Route path="visualizer/prims" element={<PrimsPage />} />
        <Route path="visualizer/kruskals" element={<KruskalsPage />} />
      </Route>
    </Routes>
  )
}
