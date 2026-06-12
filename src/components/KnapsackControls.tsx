import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useKnapsackStore } from '@/store/knapsackStore'
import { cn } from '@/lib/utils'

type ControlMode = 'visualize' | 'manual' | 'quiz' | 'compare' | 'embed'

export function KnapsackControls({ mode }: { mode: ControlMode }) {
  const {
    items, capacityInput, weightInput, valueInput, speed, isAnimating,
    snaps, snapIndex,
    setCapacityInput, setWeightInput, setValueInput, addItem, removeItem,
    setSpeed, solve, prepareSnaps, stepForward, stepBack, reset, setItems,
  } = useKnapsackStore()

  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset')
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  const inputClass =
    'w-full h-9 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

  const W = parseInt(capacityInput, 10)
  const canSolve = !isNaN(W) && W > 0 && items.length > 0 && !isAnimating
  const isManual = mode === 'manual'
  const canStepBack = isManual && snapIndex > 0
  const canStepForward = isManual && (snaps.length === 0 ? canSolve : snapIndex < snaps.length - 1)

  function applyJson() {
    setJsonError('')
    try {
      const parsed = JSON.parse(jsonText)
      const cap = parsed.capacity
      const rawItems = parsed.items
      if (typeof cap !== 'number' || cap <= 0 || !Number.isInteger(cap)) {
        setJsonError('capacity must be a positive integer')
        return
      }
      if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 8) {
        setJsonError('items must be an array of 1–8 objects')
        return
      }
      const mapped = rawItems.map((it: unknown, idx: number) => {
        if (typeof it !== 'object' || it === null) throw new Error(`item ${idx} is not an object`)
        const obj = it as Record<string, unknown>
        const w = obj.w
        const v = obj.v
        if (typeof w !== 'number' || typeof v !== 'number' || w <= 0 || v <= 0 || !Number.isInteger(w) || !Number.isInteger(v)) {
          throw new Error(`item ${idx}: w and v must be positive integers`)
        }
        return { weight: w as number, value: v as number }
      })
      setItems(mapped, String(cap))
      setJsonText('')
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div className="space-y-4">
      {/* Input mode toggle */}
      <div className="flex rounded-md overflow-hidden border border-[#2a1f3d] text-xs">
        {(['preset', 'custom'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setInputMode(m); setJsonError('') }}
            className={cn(
              'flex-1 h-7 capitalize transition-all duration-150',
              inputMode === m
                ? 'bg-[#744cae] text-white font-medium'
                : 'bg-[#0c0916] text-[#6b4d8a] hover:text-[#a78bde]',
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {inputMode === 'preset' ? (
        <>
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
        </>
      ) : (
        <div className="space-y-2">
          <label className="text-sm text-[#a78bde]">JSON Input</label>
          <textarea
            value={jsonText}
            onChange={e => { setJsonText(e.target.value); setJsonError('') }}
            placeholder={'{"capacity":8,"items":[{"w":2,"v":6},{"w":3,"v":10}]}'}
            rows={5}
            className="w-full px-3 py-2 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-xs font-mono text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors resize-none"
          />
          {jsonError && (
            <p className="text-[11px] text-[#ff6b8a] font-mono">{jsonError}</p>
          )}
          <button
            onClick={applyJson}
            disabled={!jsonText.trim()}
            className={cn(
              'w-full h-9 rounded-md border text-sm font-medium transition-all duration-200',
              'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white',
              !jsonText.trim() && 'opacity-30 cursor-not-allowed pointer-events-none',
            )}
          >
            Apply
          </button>
          <p className="text-[10px] text-[#3d2d5a] leading-relaxed">
            Format: {`{"capacity": N, "items": [{"w":W,"v":V}, ...]}`}
          </p>
        </div>
      )}

      {/* Action buttons */}
      {isManual ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={stepBack}
              disabled={!canStepBack}
              className={cn(
                'h-10 w-full flex items-center justify-center gap-1 rounded-md border text-sm font-medium transition-all duration-200',
                'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] text-[#6b4d8a] hover:text-[#a78bde]',
                !canStepBack && 'opacity-30 cursor-not-allowed pointer-events-none',
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              onClick={() => snaps.length === 0 ? prepareSnaps() : stepForward()}
              disabled={!canStepForward}
              className={cn(
                'h-10 w-full flex items-center justify-center gap-1 rounded-md border text-sm font-medium transition-all duration-200',
                'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white',
                !canStepForward && 'opacity-30 cursor-not-allowed pointer-events-none',
              )}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Btn onClick={() => !isAnimating && reset()} disabled={isAnimating} variant="neutral">Reset</Btn>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => canSolve && solve()} disabled={!canSolve} variant="primary">Solve</Btn>
          <Btn onClick={() => !isAnimating && reset()} disabled={isAnimating} variant="neutral">Reset</Btn>
        </div>
      )}

      {/* Speed selector — hidden in manual mode */}
      {!isManual && (
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
      )}
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
