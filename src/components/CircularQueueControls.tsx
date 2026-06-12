import { useState } from 'react'
import { useCircularQueueStore } from '@/store/circularQueueStore'
import { cn } from '@/lib/utils'

export function CircularQueueControls({ mode: _mode }: { mode?: string }) {
  const {
    size, capacity, inputValue,
    setInputValue, setCapacity, enqueue, dequeue, reset, loadCustom,
  } = useCircularQueueStore()

  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset')
  const [customText, setCustomText] = useState('')
  const [customError, setCustomError] = useState('')

  const parsedValue = parseInt(inputValue, 10)
  const hasValid  = !isNaN(parsedValue)
  const isFull    = size >= capacity
  const isEmpty   = size === 0

  const inputClass =
    'w-full h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors'

  function applyCustom() {
    setCustomError('')
    const vals = customText.split(',').map(s => parseInt(s.trim(), 10))
    if (vals.some(isNaN) || vals.length === 0) {
      setCustomError('Enter comma-separated integers, e.g. 5,3,8,1')
      return
    }
    loadCustom(vals)
    setCustomText('')
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-md overflow-hidden border border-[#2a1f3d] text-xs">
        {(['preset', 'custom'] as const).map(m => (
          <button key={m} onClick={() => { setInputMode(m); setCustomError('') }}
            className={cn('flex-1 h-7 capitalize transition-all duration-150',
              inputMode === m ? 'bg-[#744cae] text-white font-medium' : 'bg-[#0c0916] text-[#6b4d8a] hover:text-[#a78bde]')}>
            {m}
          </button>
        ))}
      </div>

      {inputMode === 'custom' && (
        <div className="space-y-2">
          <input value={customText} onChange={e => { setCustomText(e.target.value); setCustomError('') }}
            placeholder="e.g. 5,3,8,1,9"
            className="w-full h-9 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors" />
          {customError && <p className="text-[11px] text-[#ff6b8a] font-mono">{customError}</p>}
          <button onClick={applyCustom} disabled={!customText.trim()}
            className={cn('w-full h-9 rounded-md border text-sm font-medium transition-all duration-200',
              'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white',
              !customText.trim() && 'opacity-30 cursor-not-allowed pointer-events-none')}>
            Load Values
          </button>
          <p className="text-[10px] text-[#3d2d5a]">Comma-separated integers</p>
        </div>
      )}

      {/* Value input */}
      <div className="space-y-1.5">
        <label className="text-sm text-[#a78bde]">Value</label>
        <input
          type="number"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && hasValid && !isFull && enqueue(parsedValue)}
          placeholder="e.g. 42"
          className={inputClass}
        />
      </div>

      {/* Enqueue / Dequeue */}
      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={() => hasValid && !isFull && enqueue(parsedValue)} disabled={!hasValid || isFull} variant="primary">
          Enqueue
        </Btn>
        <Btn onClick={() => !isEmpty && dequeue()} disabled={isEmpty} variant="danger">
          Dequeue
        </Btn>
      </div>

      {isFull  && <p className="text-[10px] text-[#ff6b8a] font-mono">Queue is full</p>}
      {isEmpty && <p className="text-[10px] text-[#6b4d8a] font-mono">Queue is empty</p>}

      <Btn onClick={reset} disabled={false} variant="neutral">Reset</Btn>

      {/* Capacity slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-sm text-[#a78bde]">Capacity</label>
          <span className="text-sm font-mono text-[#c9a0ff] font-semibold">{capacity}</span>
        </div>
        <input
          type="range"
          min={4}
          max={12}
          value={capacity}
          onChange={e => setCapacity(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-[#2a1f3d] accent-[#744cae] cursor-pointer"
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-[#3d2d5a] font-mono">4</span>
          <span className="text-[10px] text-[#3d2d5a] font-mono">12</span>
        </div>
      </div>
    </div>
  )
}

interface BtnProps {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'danger' | 'neutral'
  children: React.ReactNode
}

function Btn({ onClick, disabled, variant, children }: BtnProps) {
  const styles = {
    primary: 'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    danger:  'bg-[#ff6b8a]/10 hover:bg-[#ff6b8a] border-[#ff6b8a]/35 text-[#ff6b8a] hover:text-white hover:shadow-[0_0_12px_rgba(255,107,138,0.35)]',
    neutral: 'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] hover:border-[#3d2d5a] text-[#6b4d8a] hover:text-[#a78bde]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-10 px-4 w-full flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200',
        styles[variant],
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}
