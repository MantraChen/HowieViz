import { useState } from 'react'
import { useHeapStore } from '@/store/heapStore'
import { cn } from '@/lib/utils'

export function HeapControls({ mode: _mode }: { mode?: string }) {
  const {
    heap,
    inputValue,
    buildInput,
    speed,
    isAnimating,
    setInputValue,
    setBuildInput,
    setSpeed,
    insert,
    extractMin,
    peek,
    buildHeap,
    clear,
    reset,
    loadFromCSV,
  } = useHeapStore()

  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset')
  const [csvInput, setCsvInput] = useState('')

  const parsed = parseInt(inputValue, 10)
  const hasValue = !isNaN(parsed)
  const isEmpty = heap.length === 0
  const isFull = heap.length >= 64

  const inputClass =
    'w-full h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

  function handleBuild() {
    const values = buildInput
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n))
    if (values.length === 0) return
    buildHeap(values)
  }

  return (
    <div className="space-y-4">
      {/* Preset / Custom toggle */}
      <div className="flex gap-1 bg-[#1a1428] rounded-md p-0.5">
        {(['preset', 'custom'] as const).map(m => (
          <button
            key={m}
            onClick={() => setInputMode(m)}
            className={cn(
              'flex-1 h-7 rounded text-xs font-medium capitalize transition-all duration-150',
              inputMode === m ? 'bg-[#744cae] text-white' : 'text-[#6b4d8a] hover:text-[#a78bde]',
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {inputMode === 'custom' ? (
        <div className="space-y-2">
          <label className="text-xs text-[#a78bde]">Comma-separated integers</label>
          <input
            type="text"
            value={csvInput}
            onChange={e => setCsvInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isAnimating) { loadFromCSV(csvInput); setCsvInput('') } }}
            placeholder="e.g. 1,3,6,5,9,8"
            disabled={isAnimating}
            className={inputClass}
          />
          <Btn
            onClick={() => { loadFromCSV(csvInput); setCsvInput('') }}
            disabled={isAnimating || csvInput.trim() === ''}
            variant="primary"
          >
            Load
          </Btn>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-sm text-[#a78bde]">Value</label>
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && hasValue && !isAnimating && !isFull && insert(parsed)}
              placeholder="e.g. 42"
              disabled={isAnimating}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Btn
              onClick={() => hasValue && !isAnimating && !isFull && insert(parsed)}
              disabled={!hasValue || isAnimating || isFull}
              variant="primary"
            >
              Insert
            </Btn>
            <Btn
              onClick={() => !isEmpty && !isAnimating && extractMin()}
              disabled={isEmpty || isAnimating}
              variant="danger"
            >
              Extract
            </Btn>
            <Btn
              onClick={() => !isEmpty && !isAnimating && peek()}
              disabled={isEmpty || isAnimating}
              variant="active"
            >
              Peek
            </Btn>
          </div>

          {isFull && (
            <p className="text-[10px] text-[#ff6b8a] font-mono">max size (64) reached</p>
          )}

          <div>
            <p className="text-xs tracking-widest text-[#744cae] uppercase mb-2 mt-4">Build Heap</p>
            <input
              type="text"
              value={buildInput}
              onChange={e => setBuildInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isAnimating && handleBuild()}
              placeholder="e.g. 9,3,7,1,4"
              disabled={isAnimating}
              className={inputClass}
            />
            <div className="mt-2">
              <Btn
                onClick={() => !isAnimating && handleBuild()}
                disabled={isAnimating || buildInput.trim() === ''}
                variant="primary"
              >
                Build Heap
              </Btn>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Btn
              onClick={() => !isAnimating && reset()}
              disabled={isAnimating}
              variant="neutral"
            >
              Reset
            </Btn>
            <Btn
              onClick={() => !isAnimating && !isEmpty && clear()}
              disabled={isAnimating || isEmpty}
              variant="danger"
            >
              Clear
            </Btn>
          </div>
        </>
      )}

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
  variant: 'primary' | 'danger' | 'active' | 'neutral'
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
        'h-10 px-4 w-full flex items-center justify-center rounded-md border text-sm font-medium text-center transition-all duration-200',
        styles[variant],
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}
