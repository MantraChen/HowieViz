import { useSTStore } from '@/store/segmentTreeStore'
import { cn } from '@/lib/utils'

export function SegmentTreeControls() {
  const {
    arr, isAnimating, speed,
    queryL, queryR, updateIdx, updateVal,
    setSpeed, setQueryL, setQueryR, setUpdateIdx, setUpdateVal,
    query, update, reset,
  } = useSTStore()

  const n = arr.length

  const inputClass =
    'h-9 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

  function doQuery() {
    const l = parseInt(queryL)
    const r = parseInt(queryR)
    if (!isNaN(l) && !isNaN(r)) query(l, r)
  }

  function doUpdate() {
    const i = parseInt(updateIdx)
    const v = parseInt(updateVal)
    if (!isNaN(i) && !isNaN(v)) update(i, v)
  }

  return (
    <div className="space-y-5">
      {/* Query */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Range Query [l, r]</label>
        <p className="text-xs text-[#6b4d8a]">0-indexed, max {n - 1}</p>
        <div className="flex gap-2">
          <input
            type="number" min={0} max={n - 1}
            value={queryL}
            onChange={e => setQueryL(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doQuery()}
            placeholder="l"
            disabled={isAnimating}
            className={cn(inputClass, 'flex-1 min-w-0')}
          />
          <input
            type="number" min={0} max={n - 1}
            value={queryR}
            onChange={e => setQueryR(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doQuery()}
            placeholder="r"
            disabled={isAnimating}
            className={cn(inputClass, 'flex-1 min-w-0')}
          />
        </div>
        <Btn onClick={doQuery} disabled={isAnimating || !queryL.trim() || !queryR.trim()} variant="primary">
          Query Sum
        </Btn>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      {/* Update */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Point Update</label>
        <p className="text-xs text-[#6b4d8a]">Set arr[index] = value</p>
        <div className="flex gap-2">
          <input
            type="number" min={0} max={n - 1}
            value={updateIdx}
            onChange={e => setUpdateIdx(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doUpdate()}
            placeholder="idx"
            disabled={isAnimating}
            className={cn(inputClass, 'flex-1 min-w-0')}
          />
          <input
            type="number"
            value={updateVal}
            onChange={e => setUpdateVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doUpdate()}
            placeholder="val"
            disabled={isAnimating}
            className={cn(inputClass, 'flex-1 min-w-0')}
          />
        </div>
        <Btn onClick={doUpdate} disabled={isAnimating || !updateIdx.trim() || !updateVal.trim()} variant="active">
          Update
        </Btn>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      <Btn onClick={() => !isAnimating && reset()} disabled={isAnimating} variant="neutral">
        Reset
      </Btn>

      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-[#6b4d8a]">Speed:</span>
        {(['slow', 'normal', 'fast'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={cn(
              'text-xs w-14 h-7 rounded capitalize transition-all duration-200 text-center',
              speed === s
                ? 'bg-[#744cae] text-white font-medium shadow-[0_0_12px_rgba(180,130,232,0.4)]'
                : 'text-[#6b4d8a] hover:text-[#a78bde]',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

interface BtnProps {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'active' | 'neutral'
  children: React.ReactNode
}

function Btn({ onClick, disabled, variant, children }: BtnProps) {
  const styles = {
    primary:
      'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    active:
      'bg-[#9b6fd4]/15 hover:bg-[#9b6fd4] border-[#9b6fd4]/40 text-[#c9a0ff] hover:text-white hover:shadow-[0_0_12px_rgba(155,111,212,0.4)]',
    neutral:
      'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] hover:border-[#3d2d5a] text-[#6b4d8a] hover:text-[#a78bde]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-9 px-3 flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200',
        styles[variant],
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}
