import { useKnapsackStore } from '@/store/knapsackStore'
import { cn } from '@/lib/utils'

export function KnapsackControls() {
  const {
    items, capacityInput, weightInput, valueInput, speed, isAnimating,
    setCapacityInput, setWeightInput, setValueInput, addItem, removeItem, setSpeed, solve, reset,
  } = useKnapsackStore()

  const inputClass =
    'w-full h-9 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

  const W = parseInt(capacityInput, 10)
  const canSolve = !isNaN(W) && W > 0 && items.length > 0 && !isAnimating

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm text-[#a78bde]">Capacity</label>
        <input type="number" value={capacityInput} onChange={e => setCapacityInput(e.target.value)}
          placeholder="e.g. 8" disabled={isAnimating} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-[#a78bde]">Add Item</label>
        <div className="flex gap-2">
          <input type="number" value={weightInput} onChange={e => setWeightInput(e.target.value)}
            placeholder="wt" disabled={isAnimating} className={cn(inputClass, 'w-1/2')} />
          <input type="number" value={valueInput} onChange={e => setValueInput(e.target.value)}
            placeholder="val" disabled={isAnimating} className={cn(inputClass, 'w-1/2')} />
        </div>
        <button onClick={addItem} disabled={isAnimating || items.length >= 8}
          className={cn('w-full h-9 rounded-md border text-sm font-medium transition-all duration-200',
            'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white',
            (isAnimating || items.length >= 8) && 'opacity-30 cursor-not-allowed pointer-events-none')}>
          + Add Item
        </button>
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-[#6b4d8a]">Items ({items.length}/8)</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1630] border border-[#2a1f3d]">
              <span className="text-xs font-mono text-[#b892e8]">w:{item.weight} v:{item.value}</span>
              <button onClick={() => removeItem(i)} disabled={isAnimating}
                className="text-xs text-[#ff6b8a] hover:text-[#ff8fa3] disabled:opacity-30">×</button>
            </div>
          ))}
        </div>
      )}

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
