import { useEditDistanceStore, type EditOp } from '@/store/editDistanceStore'

const CELL_W = 34
const CELL_H = 30

const OP_COLORS: Record<EditOp, string> = {
  match: '#5a3d8a',
  insert: '#c9a0ff',
  delete: '#ff6b8a',
  replace: '#9b6fd4',
  none: '#2a1f3d',
}

const OP_LABEL: Record<EditOp, string> = {
  match: 'Match',
  insert: 'Insert',
  delete: 'Delete',
  replace: 'Replace',
  none: '',
}

export function EditDistanceVisualizer() {
  const { str1, str2, currentSnap } = useEditDistanceStore()

  if (!currentSnap) {
    return (
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] flex items-center justify-center h-32 text-[#3d2d5a] text-sm font-mono">
        Press Solve to animate
      </div>
    )
  }

  const { table, activeRow, activeCol, phase, ops, cellOp } = currentSnap

  return (
    <div className="flex flex-col gap-4">
      {/* DP Table */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-auto p-3">
        <table className="border-collapse" style={{ fontSize: 11, fontFamily: 'monospace' }}>
          <thead>
            <tr>
              <th style={{ width: CELL_W, height: CELL_H, color: '#6b4d8a', fontSize: 10 }}></th>
              <th style={{ width: CELL_W, height: CELL_H, color: '#6b4d8a', fontSize: 10 }}>ε</th>
              {str2.split('').map((ch, j) => (
                <th key={j} style={{ width: CELL_W, height: CELL_H, color: '#9b6fd4', fontSize: 11 }}>{ch}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center', color: i === 0 ? '#6b4d8a' : '#9b6fd4', fontSize: i === 0 ? 10 : 11, paddingRight: 4 }}>
                  {i === 0 ? 'ε' : str1[i - 1]}
                </td>
                {row.map((val, j) => {
                  const isActive = i === activeRow && j === activeCol && phase === 'fill'
                  const isBacktrack = phase !== 'fill' && i === activeRow && j === activeCol
                  const op = cellOp?.[i]?.[j] ?? 'none'

                  let bg = '#0f0b17'
                  let border = '#2a1f3d'
                  let color = '#a78bde'

                  if (isActive) { bg = '#9b6fd4'; color = '#fff'; border = '#c9a0ff' }
                  else if (isBacktrack) { bg = '#ff6b8a22'; border = '#ff6b8a'; color = '#ff6b8a' }
                  else if (phase === 'done' && op !== 'none' && op !== 'match' && i > 0 && j > 0) {
                    bg = OP_COLORS[op] + '22'
                    border = OP_COLORS[op]
                    color = OP_COLORS[op]
                  }

                  return (
                    <td key={j} style={{
                      width: CELL_W,
                      height: CELL_H,
                      textAlign: 'center',
                      background: bg,
                      border: `1px solid ${border}`,
                      color,
                      fontWeight: isActive || isBacktrack ? 'bold' : 'normal',
                      transition: 'background 0.15s',
                    }}>
                      {val}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Operation list */}
      {ops.length > 0 && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-3">
          <p className="text-xs text-[#a78bde] font-semibold mb-2">
            Operations ({ops.length} total)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ops.map((step, i) => {
              const col = OP_COLORS[step.op]
              const label = step.op === 'insert'
                ? `Insert '${step.to}'`
                : step.op === 'delete'
                  ? `Delete '${step.from}'`
                  : `Replace '${step.from}'→'${step.to}'`
              return (
                <span key={i} className="px-2 py-1 rounded text-xs font-mono" style={{
                  background: col + '22',
                  border: `1px solid ${col}60`,
                  color: col,
                }}>
                  {label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        {(['insert', 'delete', 'replace'] as EditOp[]).map(op => (
          <div key={op} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: OP_COLORS[op] }} />
            <span className="text-[#6b4d8a]">{OP_LABEL[op]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
