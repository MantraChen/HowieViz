import { useLCSStore } from '@/store/lcsStore'
import { cn } from '@/lib/utils'

export function LCSControls() {
  const { str1Input, str2Input, speed, isAnimating, setStr1Input, setStr2Input, setSpeed, solve, reset } = useLCSStore()

  const canSolve = str1Input.trim().length > 0 && str2Input.trim().length > 0 && !isAnimating

  const inputClass =
    'w-full h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40 font-mono uppercase tracking-wider'

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm text-[#a78bde]">String 1 (max 12)</label>
        <input type="text" value={str1Input} onChange={e => setStr1Input(e.target.value)}
          placeholder="ABCBDAB" disabled={isAnimating} className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm text-[#a78bde]">String 2 (max 12)</label>
        <input type="text" value={str2Input} onChange={e => setStr2Input(e.target.value)}
          placeholder="BDCAB" disabled={isAnimating} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={() => canSolve && solve()} disabled={!canSolve} variant="primary">Solve</Btn>
        <Btn onClick={() => !isAnimating && reset()} disabled={isAnimating} variant="neutral">Reset</Btn>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-[#6b4d8a]">Speed:</span>
        {(['slow', 'normal', 'fast'] as const).map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={cn('text-xs w-14 h-7 rounded capitalize transition-all duration-200',
              speed === s ? 'bg-[#744cae] text-white font-medium' : 'text-[#6b4d8a] hover:text-[#a78bde]')}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function Btn({ onClick, disabled, variant, children }: { onClick: () => void; disabled: boolean; variant: 'primary' | 'neutral'; children: React.ReactNode }) {
  const styles = {
    primary: 'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white',
    neutral: 'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] text-[#6b4d8a] hover:text-[#a78bde]',
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn('h-10 w-full flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200',
        styles[variant], disabled && 'opacity-30 cursor-not-allowed pointer-events-none')}>
      {children}
    </button>
  )
}
