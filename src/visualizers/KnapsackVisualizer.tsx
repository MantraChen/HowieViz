import { useKnapsackStore } from '@/store/knapsackStore'

export function KnapsackVisualizer() {
  const { items, currentSnap, capacityInput } = useKnapsackStore()
  const rawW = parseInt(capacityInput, 10) || 8
  const W = Math.min(rawW, 20)
  const capped = rawW > 20

  // Scale cell width: bigger cells when capacity is small
  const cellW = Math.max(28, Math.min(52, Math.floor(580 / (W + 2))))
  const cellH = 30

  if (!currentSnap) {
    return (
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] flex items-center justify-center h-40 text-[#3d2d5a] text-sm font-mono">
        Press Solve to animate
      </div>
    )
  }

  const { table, activeRow, activeCol, phase, selectedItems } = currentSnap

  const totalWeight = items.reduce((s, item, i) => s + (selectedItems[i] ? item.weight : 0), 0)
  const totalValue = items.reduce((s, item, i) => s + (selectedItems[i] ? item.value : 0), 0)

  return (
    <div className="flex flex-col gap-4">
      {capped && (
        <p className="text-xs text-[#6b4d8a] italic">Capacity capped at 20 for visualization</p>
      )}

      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-x-auto p-3">
        <table className="border-collapse" style={{ fontSize: 11, fontFamily: 'monospace' }}>
          <thead>
            <tr>
              <th className="text-[#6b4d8a] text-xs pr-2 pb-1 text-right whitespace-nowrap">
                item\W
              </th>
              {Array.from({ length: W + 1 }, (_, j) => (
                <th
                  key={j}
                  style={{ width: cellW, height: cellH, textAlign: 'center', color: '#6b4d8a', fontSize: 10 }}
                >
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => {
              const isSelectedRow = i > 0 && selectedItems[i - 1]
              return (
                <tr key={i} style={isSelectedRow ? { borderLeft: '3px solid #744cae' } : undefined}>
                  <td className="text-right pr-2 text-[#6b4d8a] text-xs whitespace-nowrap">
                    {i === 0 ? '∅' : `i${i}(w${items[i - 1]?.weight},v${items[i - 1]?.value})`}
                  </td>
                  {row.map((val, j) => {
                    const isActive = i === activeRow && j === activeCol
                    const isBacktrack = phase === 'backtrack' && isActive
                    const isDone = phase === 'done'

                    let bg = '#0f0b17'
                    let border = '#2a1f3d'
                    let color = '#a78bde'

                    if (isActive && phase === 'fill') {
                      bg = '#9b6fd4'; color = '#fff'; border = '#c9a0ff'
                    } else if (isBacktrack) {
                      bg = '#c9a0ff'; border = '#9b6fd4'; color = '#1a0a2e'
                    } else if (isDone && i > 0 && selectedItems[i - 1] && j === W) {
                      bg = '#c9a0ff22'; border = '#c9a0ff'; color = '#c9a0ff'
                    }

                    return (
                      <td
                        key={j}
                        style={{
                          width: cellW,
                          height: cellH,
                          textAlign: 'center',
                          background: bg,
                          border: `1px solid ${border}`,
                          color,
                          fontWeight: isActive || isBacktrack ? 'bold' : 'normal',
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                      >
                        {val}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {[
          { label: 'Default', bg: '#0f0b17', border: '#2a1f3d', color: '#a78bde' },
          { label: 'Active', bg: '#9b6fd4', border: '#c9a0ff', color: '#fff' },
          { label: 'Backtrack', bg: '#c9a0ff', border: '#9b6fd4', color: '#1a0a2e' },
          { label: 'Done', bg: '#c9a0ff22', border: '#c9a0ff', color: '#c9a0ff' },
        ].map(({ label, bg, border, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <span className="text-[10px] text-[#6b4d8a] font-mono">{label}</span>
          </div>
        ))}
      </div>

      {(phase === 'backtrack' || phase === 'done') && selectedItems.some(Boolean) && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-3">
          <p className="text-xs text-[#a78bde] font-semibold mb-2">Selected Items</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) =>
              selectedItems[i] ? (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-[#c9a0ff]/15 border border-[#c9a0ff]/40 text-xs text-[#c9a0ff] font-mono"
                >
                  w:{item.weight} v:{item.value}
                </span>
              ) : null
            )}
          </div>
          <p className="text-xs text-[#6b4d8a] mt-2">
            Total weight: <span className="text-[#b892e8]">{totalWeight}</span>
            {' '}/ Total value: <span className="text-[#c9a0ff] font-bold">{totalValue}</span>
          </p>
        </div>
      )}
    </div>
  )
}
