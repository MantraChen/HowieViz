import { useTrieStore } from '@/store/trieStore'
import { cn } from '@/lib/utils'

export function TrieControls() {
  const {
    isAnimating, wordInput, speed,
    setWordInput, setSpeed,
    insert, search, deleteTrie, reset,
  } = useTrieStore()

  const inputClass =
    'h-10 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40 w-full'

  const canAct = !isAnimating && wordInput.trim().length > 0

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Word</label>
        <input
          type="text"
          value={wordInput}
          onChange={e => setWordInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
          onKeyDown={e => { if (e.key === 'Enter' && canAct) { insert(wordInput); setWordInput('') } }}
          placeholder="e.g. apple"
          disabled={isAnimating}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Btn onClick={() => { insert(wordInput); setWordInput('') }} disabled={!canAct} variant="primary">
          Insert
        </Btn>
        <Btn onClick={() => { search(wordInput); setWordInput('') }} disabled={!canAct} variant="active">
          Search
        </Btn>
        <Btn onClick={() => { deleteTrie(wordInput); setWordInput('') }} disabled={!canAct} variant="danger">
          Delete
        </Btn>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      <Btn onClick={() => !isAnimating && reset()} disabled={isAnimating} variant="neutral">
        Reset
      </Btn>

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
        'w-full h-10 px-4 flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200',
        styles[variant],
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}
