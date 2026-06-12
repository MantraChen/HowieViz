import { useRef, useEffect } from 'react'
import { useFWStore, type FWNodeHL } from '@/store/fenwickStore'

const CELL_W = 44
const CELL_H = 40

const FILL: Record<FWNodeHL, string> = {
  default: '#1c1530',
  querying: '#9b6fd4',
  updating: '#744cae',
  result: '#c9a0ff',
}
const STROKE: Record<FWNodeHL, string> = {
  default: '#2a1f3d',
  querying: '#d4aaff',
  updating: '#b892e8',
  result: '#e8d5ff',
}
const TEXT: Record<FWNodeHL, string> = {
  default: '#f0eaf8',
  querying: '#ffffff',
  updating: '#ffffff',
  result: '#1a0f2e',
}

function lowbit(x: number) { return x & (-x) }

export function FenwickVisualizer() {
  const { arr, bit, arrHL, bitHL, message, resultSum } = useFWStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollContainerRef.current) return
    const el = scrollContainerRef.current.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [arrHL, bitHL])
  const n = arr.length

  // Responsibility ranges: bit[i] covers [i - lowbit(i) + 1 .. i]
  const ranges = Array.from({ length: n }, (_, i) => {
    const idx = i + 1
    return { lo: idx - lowbit(idx), hi: idx - 1 }  // 0-indexed for array display
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Arrays */}
      <div ref={scrollContainerRef} className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-5 py-4 space-y-4 overflow-x-auto">
        {/* Index row */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#6b4d8a] w-16 shrink-0 text-right">index</span>
          <div className="flex gap-1">
            {arr.map((_, i) => (
              <div key={i}
                className="flex items-center justify-center text-xs font-mono text-[#3d2d5a]"
                style={{ width: CELL_W }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* arr row */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#a78bde] w-16 shrink-0 text-right">arr</span>
          <div className="flex gap-1">
            {arr.map((v, i) => (
              <Cell key={i} value={v} hl={arrHL[i]} size={CELL_W} />
            ))}
          </div>
        </div>

        {/* BIT row */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#a78bde] w-16 shrink-0 text-right">bit</span>
          <div className="flex gap-1">
            {arr.map((_, i) => (
              <Cell key={i} value={bit[i + 1]} hl={bitHL[i + 1]} size={CELL_W} />
            ))}
          </div>
        </div>

        {/* Responsibility range brackets */}
        <div className="flex items-start gap-2">
          <span className="text-xs font-mono text-[#6b4d8a] w-16 shrink-0 text-right pt-1">range</span>
          <div className="flex gap-1">
            {ranges.map(({ lo, hi }, i) => {
              const hl = bitHL[i + 1]
              const active = hl !== 'default'
              const span = hi - lo + 1
              const totalW = span * CELL_W + (span - 1) * 4
              return (
                <div key={i} style={{ width: CELL_W }}>
                  {span > 0 && (
                    <div
                      className="rounded-sm"
                      style={{
                        width: totalW,
                        height: 6,
                        background: active ? FILL[hl] : '#1e1630',
                        border: `1px solid ${active ? STROKE[hl] : '#2a1f3d'}`,
                        marginLeft: 0,
                        transition: 'all 0.25s',
                      }}
                    />
                  )}
                  <span className="text-[9px] font-mono text-[#3d2d5a]">
                    [{lo + 1}..{i + 1}]
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {(message || resultSum !== null) && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-4 py-2.5 flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-[#c9a0ff]">{message}</span>
          {resultSum !== null && (
            <span className="text-xs font-mono font-bold text-[#c9a0ff] shrink-0">= {resultSum}</span>
          )}
        </div>
      )}

      <Legend />
    </div>
  )
}

function Cell({ value, hl, size }: { value: number; hl: FWNodeHL; size: number }) {
  return (
    <div
      data-active={hl !== 'default' ? 'true' : undefined}
      className="flex items-center justify-center rounded-md border text-sm font-mono font-bold"
      style={{
        width: size,
        height: CELL_H,
        background: FILL[hl],
        borderColor: STROKE[hl],
        color: TEXT[hl],
        transition: 'all 0.25s',
      }}
    >
      {value}
    </div>
  )
}

function Legend() {
  const items: { hl: FWNodeHL; label: string }[] = [
    { hl: 'default', label: 'Default' },
    { hl: 'querying', label: 'Query chain' },
    { hl: 'updating', label: 'Update chain' },
    { hl: 'result', label: 'Result' },
  ]
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {items.map(({ hl, label }) => (
        <div key={hl} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded border" style={{ background: FILL[hl], borderColor: STROKE[hl] }} />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
