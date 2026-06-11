import { useStackStore } from '@/store/stackStore'
import { cn } from '@/lib/utils'

export function StackControls() {
  const { elements, inputValue, speed, setInputValue, setSpeed, push, pop, peek, clear, reset } =
    useStackStore()

  const parsedValue = parseInt(inputValue, 10)
  const hasValidValue = !isNaN(parsedValue)

  const inputClass =
    'w-full h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors'

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-2 gap-2">
        <ActionButton onClick={() => hasValidValue && push(parsedValue)} disabled={!hasValidValue} variant="primary">
          Push
        </ActionButton>
        <ActionButton onClick={() => elements.length > 0 && pop()} disabled={elements.length === 0} variant="danger">
          Pop
        </ActionButton>
        <ActionButton onClick={() => elements.length > 0 && peek()} disabled={elements.length === 0} variant="active">
          Peek
        </ActionButton>
        <ActionButton onClick={() => elements.length > 0 && clear()} disabled={elements.length === 0} variant="danger">
          Clear
        </ActionButton>
      </div>

      <ActionButton onClick={reset} disabled={false} variant="neutral">
        Reset
      </ActionButton>

      <div className="flex items-center gap-2 pt-1">
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
