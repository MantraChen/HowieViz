import { useLCSStore } from '@/store/lcsStore'

const CELL_W = 34
const CELL_H = 30

export function LCSVisualizer() {
  const { str1, str2, currentSnap, lcsString } = useLCSStore()

  if (!currentSnap) {
    return (
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] flex items-center justify-center h-32 text-[#3d2d5a] text-sm font-mono">
        Press Solve to animate
      </div>
    )
  }

  const { table, activeRow, activeCol, phase, lcsIndices1, lcsIndices2 } = currentSnap

  return (
    <div className="flex flex-col gap-4">
      {/* String display */}
      <div className="flex gap-4 flex-wrap">
        {[{ label: 'String 1', str: str1, indices: lcsIndices1 }, { label: 'String 2', str: str2, indices: lcsIndices2 }].map(({ label, str, indices }) => (
          <div key={label} className="flex-1 min-w-0 rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-3">
            <p className="text-xs text-[#6b4d8a] mb-2">{label}</p>
            <div className="flex flex-wrap gap-1">
              {str.split('').map((ch, i) => {
                const isMatch = indices.includes(i)
                return (
                  <span key={i} className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono font-bold transition-all ${
                    isMatch
                      ? 'bg-[#c9a0ff] text-[#1a0f2e] border border-[#c9a0ff]'
                      : 'bg-[#1e1630] text-[#a78bde] border border-[#2a1f3d]'
                  }`}>
                    {ch}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>

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
                  const isDone = phase === 'done'
                  const isBtCell = isDone && i > 0 && j > 0 && lcsIndices1.includes(i - 1) && lcsIndices2.includes(j - 1) && str1[i - 1] === str2[j - 1]

                  let bg = '#0f0b17'
                  let border = '#2a1f3d'
                  let color = '#a78bde'

                  if (isActive) { bg = '#9b6fd4'; color = '#fff'; border = '#c9a0ff' }
                  else if (isBacktrack) { bg = '#ff6b8a22'; border = '#ff6b8a'; color = '#ff6b8a' }
                  else if (isBtCell) { bg = '#c9a0ff22'; border = '#c9a0ff'; color = '#c9a0ff' }

                  return (
                    <td key={j} style={{
                      width: CELL_W,
                      height: CELL_H,
                      textAlign: 'center',
                      background: bg,
                      border: `1px solid ${border}`,
                      color,
                      fontWeight: isActive || isBacktrack || isBtCell ? 'bold' : 'normal',
                      transition: 'background 0.15s, border-color 0.15s',
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

      {/* LCS result */}
      {(phase === 'backtrack' || phase === 'done') && lcsString && (
        <div className="rounded-xl border border-[#2a1f3d] bg-[#0f0b17] p-3">
          <p className="text-xs text-[#6b4d8a] mb-1">
            LCS length: <span className="text-[#b892e8] font-bold">{lcsString.length}</span>
          </p>
          <div className="flex gap-1">
            {lcsString.split('').map((ch, i) => (
              <span key={i} className="w-7 h-7 flex items-center justify-center rounded bg-[#c9a0ff] text-[#1a0f2e] text-xs font-mono font-bold border border-[#c9a0ff]">
                {ch}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
