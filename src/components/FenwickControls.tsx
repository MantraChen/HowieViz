import { useFWStore } from '@/store/fenwickStore'
import { cn } from '@/lib/utils'

export function FenwickControls() {
  const {
    arr, isAnimating, speed,
    queryIdx, updateIdx, updateDelta,
    setSpeed, setQueryIdx, setUpdateIdx, setUpdateDelta,
    query, update, reset,
  } = useFWStore()

  const n = arr.length

  const inputClass =
    'h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

  function doQuery() {
    const i = parseInt(queryIdx)
    if (!isNaN(i)) query(i)
  }

  function doUpdate() {
    const i = parseInt(updateIdx)
    const d = parseInt(updateDelta)
    if (!isNaN(i) && !isNaN(d)) update(i, d)
  }

  return (
    <div className="space-y-5">
      {/* Prefix Query */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Prefix Sum Query(i)</label>
        <p className="text-xs text-[#6b4d8a]">1-indexed, 1 – {n}</p>
        <div className="flex gap-2 items-center">
          <input
            type="number" min={1} max={n}
            value={queryIdx}
            onChange={e => setQueryIdx(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doQuery()}
            placeholder="i"
            disabled={isAnimating}
            className={cn(inputClass, 'min-w-[80px] flex-1')}
          />
          <Btn onClick={doQuery} disabled={isAnimating || !queryIdx.trim()} variant="primary" full={false}>
            Query
          </Btn>
        </div>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      {/* Update */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Update(i, delta)</label>
        <p className="text-xs text-[#6b4d8a]">Add delta to arr[i] (1-indexed)</p>
        <div className="flex flex-col gap-2">
          <input
            type="number" min={1} max={n}
            value={updateIdx}
            onChange={e => setUpdateIdx(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doUpdate()}
            placeholder="i"
            disabled={isAnimating}
            className={cn(inputClass, 'w-full')}
          />
          <input
            type="number"
            value={updateDelta}
            onChange={e => setUpdateDelta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doUpdate()}
            placeholder="Δ"
            disabled={isAnimating}
            className={cn(inputClass, 'w-full')}
          />
          <Btn onClick={doUpdate} disabled={isAnimating || !updateIdx.trim() || !updateDelta.trim()} variant="active">
            Update
          </Btn>
        </div>
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
  full?: boolean
  children: React.ReactNode
}

function Btn({ onClick, disabled, variant, full = true, children }: BtnProps) {
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
        'h-10 px-4 flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200 shrink-0',
        full && 'w-full',
        styles[variant],
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}
