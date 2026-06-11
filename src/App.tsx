import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { ArrayPage } from '@/pages/ArrayPage'
import { StackPage } from '@/pages/StackPage'
import { QueuePage } from '@/pages/QueuePage'
import { LinkedListPage } from '@/pages/LinkedListPage'
import { HeapPage } from '@/pages/HeapPage'
import { BSTPage } from '@/pages/BSTPage'

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
      </Route>
    </Routes>
  )
}
