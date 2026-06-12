import { useRadixSortStore } from '@/store/radixSortStore'
import { cn } from '@/lib/utils'

export function RadixSortControls() {
  const { arraySize, speed, isAnimating, isSorted, setArraySize, setSpeed, randomize, sort, reset } =
    useRadixSortStore()

  return (
    <div className="space-y-5">
      {/* Array size */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm text-[#a78bde]">Array Size</label>
          <span className="text-sm font-mono text-[#c9a0ff] font-semibold">{arraySize}</span>
        </div>
        <input
          type="range"
          min={5}
          max={20}
          value={arraySize}
          onChange={e => !isAnimating && setArraySize(Number(e.target.value))}
          disabled={isAnimating}
          className="w-full h-1.5 rounded-full appearance-none bg-[#2a1f3d] accent-[#744cae] disabled:opacity-40 cursor-pointer"
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-[#3d2d5a] font-mono">5</span>
          <span className="text-[10px] text-[#3d2d5a] font-mono">20</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={randomize} disabled={isAnimating} variant="neutral">Randomize</Btn>
          <Btn onClick={reset} disabled={isAnimating} variant="neutral">Reset</Btn>
        </div>
        <Btn onClick={sort} disabled={isAnimating || isSorted} variant="primary" full>
          {isAnimating ? 'Sorting…' : isSorted ? 'Sorted ✓' : 'Sort'}
        </Btn>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#6b4d8a]">Speed:</span>
        {(['slow', 'normal', 'fast'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={cn(
              'text-xs w-14 h-7 rounded capitalize transition-all duration-200',
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
  variant: 'primary' | 'neutral'
  full?: boolean
  children: React.ReactNode
}

function Btn({ onClick, disabled, variant, full, children }: BtnProps) {
  const styles = {
    primary: 'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    neutral: 'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] hover:border-[#3d2d5a] text-[#6b4d8a] hover:text-[#a78bde]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-10 px-4 flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200',
        full && 'w-full',
        styles[variant],
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}
