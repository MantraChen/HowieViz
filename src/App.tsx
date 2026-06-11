import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { ArrayPage } from '@/pages/ArrayPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="visualizer/array" element={<ArrayPage />} />
      </Route>
    </Routes>
  )
}
