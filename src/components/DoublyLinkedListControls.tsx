import { useState } from 'react'
import { useDLLStore } from '@/store/doublyLinkedListStore'
import { cn } from '@/lib/utils'

export function DoublyLinkedListControls({ mode: _mode }: { mode?: string }) {
  const {
    nodes, inputValue, inputIndex, speed, isSearching,
    setInputValue, setInputIndex, setSpeed,
    insertHead, insertTail, insertAt,
    deleteHead, deleteTail, deleteAt,
    search, cancelSearch, reset, loadCustom,
  } = useDLLStore()

  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset')
  const [customText, setCustomText] = useState('')
  const [customError, setCustomError] = useState('')

  const MAX_SIZE = 32
  const parsedValue = parseInt(inputValue, 10)
  const parsedIndex = parseInt(inputIndex, 10)
  const hasValidValue = !isNaN(parsedValue)
  const hasValidInsertIndex = !isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex <= nodes.length
  const hasValidDeleteIndex = !isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < nodes.length
  const isEmpty = nodes.length === 0
  const isFull = nodes.length >= MAX_SIZE

  const inputClass =
    'w-full h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

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
          <p className="text-[10px] text-[#3d2d5a]">Comma-separated integers (head to tail)</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm text-[#a78bde]">Value</label>
          <input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="e.g. 42"
            disabled={isSearching}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-[#a78bde]">Index</label>
          <input
            type="number"
            value={inputIndex}
            onChange={e => setInputIndex(e.target.value)}
            placeholder={`0–${nodes.length}`}
            disabled={isSearching}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest text-[#744cae] uppercase mb-2 mt-4">Insert</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            onClick={() => hasValidValue && !isSearching && !isFull && insertHead(parsedValue)}
            disabled={!hasValidValue || isSearching || isFull}
            variant="primary"
          >Head</ActionButton>
          <ActionButton
            onClick={() => hasValidValue && !isSearching && !isFull && insertTail(parsedValue)}
            disabled={!hasValidValue || isSearching || isFull}
            variant="primary"
          >Tail</ActionButton>
          <ActionButton
            onClick={() => hasValidValue && hasValidInsertIndex && !isSearching && !isFull && insertAt(parsedIndex, parsedValue)}
            disabled={!hasValidValue || !hasValidInsertIndex || isSearching || isFull}
            variant="primary"
          >At Index</ActionButton>
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest text-[#744cae] uppercase mb-2 mt-4">Delete</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            onClick={() => !isEmpty && !isSearching && deleteHead()}
            disabled={isEmpty || isSearching}
            variant="danger"
          >Head</ActionButton>
          <ActionButton
            onClick={() => !isEmpty && !isSearching && deleteTail()}
            disabled={isEmpty || isSearching}
            variant="danger"
          >Tail</ActionButton>
          <ActionButton
            onClick={() => hasValidDeleteIndex && !isSearching && deleteAt(parsedIndex)}
            disabled={!hasValidDeleteIndex || isSearching}
            variant="danger"
          >At Index</ActionButton>
        </div>
      </div>

      {isFull && (
        <p className="text-[10px] text-[#ff6b8a] font-mono">max size ({MAX_SIZE}) reached</p>
      )}

      {isSearching ? (
        <ActionButton onClick={cancelSearch} disabled={false} variant="active">
          Cancel Search
        </ActionButton>
      ) : (
        <ActionButton
          onClick={() => hasValidValue && search(parsedValue)}
          disabled={!hasValidValue || isEmpty}
          variant="active"
        >
          Search
        </ActionButton>
      )}

      <ActionButton
        onClick={() => !isSearching && reset()}
        disabled={isSearching}
        variant="neutral"
      >
        Reset
      </ActionButton>

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

interface ActionButtonProps {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'danger' | 'active' | 'neutral'
  children: React.ReactNode
}

function ActionButton({ onClick, disabled, variant, children }: ActionButtonProps) {
  const styles = {
    primary: 'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    active:  'bg-[#9b6fd4]/15 hover:bg-[#9b6fd4] border-[#9b6fd4]/40 text-[#c9a0ff] hover:text-white hover:shadow-[0_0_12px_rgba(155,111,212,0.4)]',
    danger:  'bg-[#ff6b8a]/10 hover:bg-[#ff6b8a] border-[#ff6b8a]/35 text-[#ff6b8a] hover:text-white hover:shadow-[0_0_12px_rgba(255,107,138,0.35)]',
    neutral: 'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] hover:border-[#3d2d5a] text-[#6b4d8a] hover:text-[#a78bde]',
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
