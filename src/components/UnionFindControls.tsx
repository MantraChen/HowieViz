import { useUFStore } from '@/store/unionFindStore'
import { cn } from '@/lib/utils'

export function UnionFindControls() {
  const {
    n, isAnimating,
    unionX, unionY, findX,
    setUnionX, setUnionY, setFindX,
    union, find, reset,
  } = useUFStore()

  const inputClass =
    'h-9 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

  function doUnion() {
    const x = parseInt(unionX)
    const y = parseInt(unionY)
    if (!isNaN(x) && !isNaN(y)) { union(x, y); setUnionX(''); setUnionY('') }
  }

  function doFind() {
    const x = parseInt(findX)
    if (!isNaN(x)) { find(x); setFindX('') }
  }

  return (
    <div className="space-y-5">
      {/* Union */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Union(x, y)</label>
        <p className="text-xs text-[#6b4d8a]">Values 0 – {n - 1}</p>
        <div className="flex gap-2">
          <input
            type="number" min={0} max={n - 1}
            value={unionX}
            onChange={e => setUnionX(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doUnion()}
            placeholder="x"
            disabled={isAnimating}
            className={cn(inputClass, 'flex-1 min-w-0')}
          />
          <input
            type="number" min={0} max={n - 1}
            value={unionY}
            onChange={e => setUnionY(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doUnion()}
            placeholder="y"
            disabled={isAnimating}
            className={cn(inputClass, 'flex-1 min-w-0')}
          />
        </div>
        <Btn onClick={doUnion} disabled={isAnimating || !unionX.trim() || !unionY.trim()} variant="primary">
          Union
        </Btn>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      {/* Find */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Find(x)</label>
        <div className="flex gap-2">
          <input
            type="number" min={0} max={n - 1}
            value={findX}
            onChange={e => setFindX(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && doFind()}
            placeholder="x"
            disabled={isAnimating}
            className={cn(inputClass, 'flex-1 min-w-0')}
          />
          <Btn onClick={doFind} disabled={isAnimating || !findX.trim()} variant="active">
            Find
          </Btn>
        </div>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      <Btn onClick={() => !isAnimating && reset()} disabled={isAnimating} variant="neutral">
        Reset
      </Btn>
    </div>
  )
}

interface BtnProps {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'active' | 'danger' | 'neutral'
  children: React.ReactNode
}

function Btn({ onClick, disabled, variant, children }: BtnProps) {
  const styles = {
    primary:
      'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    active:
      'bg-[#9b6fd4]/15 hover:bg-[#9b6fd4] border-[#9b6fd4]/40 text-[#c9a0ff] hover:text-white hover:shadow-[0_0_12px_rgba(155,111,212,0.4)]',
    danger:
      'bg-[#ff6b8a]/10 hover:bg-[#ff6b8a] border-[#ff6b8a]/35 text-[#ff6b8a] hover:text-white hover:shadow-[0_0_12px_rgba(255,107,138,0.35)]',
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
