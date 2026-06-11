import { useArrayStore } from '@/store/arrayStore'
import { cn } from '@/lib/utils'

export function ArrayControls() {
  const {
    elements,
    inputValue,
    inputIndex,
    speed,
    setInputValue,
    setInputIndex,
    setSpeed,
    push,
    pop,
    insert,
    remove,
    reset,
  } = useArrayStore()

  const parsedValue = parseInt(inputValue, 10)
  const parsedIndex = parseInt(inputIndex, 10)
  const hasValidValue = !isNaN(parsedValue)
  const hasValidIndex = !isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < elements.length

  const inputClass =
    'w-full h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm text-[#a78bde]">Value</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 42"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-[#a78bde]">Index</label>
          <input
            type="number"
            value={inputIndex}
            onChange={(e) => setInputIndex(e.target.value)}
            placeholder={`0–${Math.max(0, elements.length - 1)}`}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest text-[#744cae] uppercase mb-2 mt-4">Insert</p>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton onClick={() => hasValidValue && push(parsedValue)} disabled={!hasValidValue} variant="primary">
            Push
          </ActionButton>
          <ActionButton
            onClick={() => hasValidValue && insert(isNaN(parsedIndex) ? elements.length : parsedIndex, parsedValue)}
            disabled={!hasValidValue}
            variant="success"
          >
            Insert at Index
          </ActionButton>
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest text-[#744cae] uppercase mb-2 mt-4">Delete</p>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton onClick={() => elements.length > 0 && pop()} disabled={elements.length === 0} variant="danger">
            Pop
          </ActionButton>
          <ActionButton onClick={() => hasValidIndex && remove(parsedIndex)} disabled={!hasValidIndex} variant="danger">
            Remove at Index
          </ActionButton>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6b4d8a]">Speed:</span>
          {(['slow', 'normal', 'fast'] as const).map((s) => (
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
        <button onClick={reset} className="text-xs text-[#3d2d5a] hover:text-[#a78bde] transition-colors">
          Reset
        </button>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'danger' | 'success'
  children: React.ReactNode
}

function ActionButton({ onClick, disabled, variant, children }: ActionButtonProps) {
  const styles = {
    primary:
      'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    success:
      'bg-[#744cae]/12 hover:bg-[#744cae] border-[#b892e8]/35 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    danger:
      'bg-[#ff6b8a]/10 hover:bg-[#ff6b8a] border-[#ff6b8a]/35 text-[#ff6b8a] hover:text-white hover:shadow-[0_0_12px_rgba(255,107,138,0.35)]',
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
