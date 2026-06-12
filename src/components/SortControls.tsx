import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnimationSpeed } from '@/types'
import type { SortStep } from '@/store/sortStore'

interface Props {
  mode?: string
  arraySize: number
  speed: AnimationSpeed
  isAnimating: boolean
  isSorted: boolean
  onSetArraySize: (n: number) => void
  onSetSpeed: (s: AnimationSpeed) => void
  onRandomize: () => void
  onSort: () => void
  onReset: () => void
  // Manual mode
  snaps?: SortStep[]
  snapIndex?: number
  onPrepareSnaps?: () => void
  onStepForward?: () => void
  onStepBack?: () => void
  // Custom input
  onLoadCustom?: (csv: string) => void
}

export function SortControls({
  mode = 'visualize',
  arraySize, speed, isAnimating, isSorted,
  onSetArraySize, onSetSpeed, onRandomize, onSort, onReset,
  snaps = [], snapIndex = -1,
  onPrepareSnaps, onStepForward, onStepBack,
  onLoadCustom,
}: Props) {
  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset')
  const [customText, setCustomText] = useState('')

  const isManual = mode === 'manual'
  const snapsLength = snaps.length

  function handleLoadCustom() {
    if (onLoadCustom && customText.trim()) {
      onLoadCustom(customText)
    }
  }

  return (
    <div className="space-y-5">
      {/* Input mode toggle */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 bg-[#1a1428] rounded-lg p-1">
          <button
            onClick={() => setInputMode('preset')}
            className={cn(
              'flex-1 h-7 rounded-md text-xs font-medium transition-all duration-150',
              inputMode === 'preset' ? 'bg-[#744cae] text-white' : 'text-[#6b4d8a] hover:text-[#a78bde]',
            )}
          >
            Preset
          </button>
          <button
            onClick={() => setInputMode('custom')}
            className={cn(
              'flex-1 h-7 rounded-md text-xs font-medium transition-all duration-150',
              inputMode === 'custom' ? 'bg-[#744cae] text-white' : 'text-[#6b4d8a] hover:text-[#a78bde]',
            )}
          >
            Custom
          </button>
        </div>

        {inputMode === 'preset' ? (
          /* Array size slider */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#a78bde]">Array Size</label>
              <span className="text-sm font-mono text-[#c9a0ff] font-semibold">{arraySize}</span>
            </div>
            <input
              type="range"
              min={5}
              max={256}
              value={arraySize}
              onChange={e => !isAnimating && onSetArraySize(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full h-1.5 rounded-full appearance-none bg-[#2a1f3d] accent-[#744cae] disabled:opacity-40 cursor-pointer"
            />
            <div className="flex justify-between">
              <span className="text-[10px] text-[#3d2d5a] font-mono">5</span>
              <span className="text-[10px] text-[#3d2d5a] font-mono">256</span>
            </div>
          </div>
        ) : (
          /* Custom input */
          <div className="space-y-2">
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="5, 3, 8, 1, 9, 2, 7"
              rows={2}
              className="w-full rounded-md bg-[#1a1428] border border-[#2a1f3d] text-[#a78bde] text-xs font-mono px-3 py-2 placeholder-[#3d2d5a] focus:outline-none focus:border-[#744cae] resize-none"
            />
            <p className="text-[10px] text-[#3d2d5a]">Comma-separated integers (1–999, max 64)</p>
            <Btn onClick={handleLoadCustom} disabled={isAnimating || !customText.trim()} variant="neutral" full>
              Load
            </Btn>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {isManual ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Btn onClick={onRandomize} disabled={isAnimating} variant="neutral">Randomize</Btn>
            <Btn onClick={onReset} disabled={isAnimating} variant="neutral">Reset</Btn>
          </div>
          {snapsLength === 0 ? (
            <Btn onClick={onPrepareSnaps ?? (() => {})} disabled={isAnimating} variant="primary" full>
              Prepare Steps
            </Btn>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onStepBack}
                disabled={snapIndex <= 0}
                className={cn(
                  'h-10 flex items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-all duration-200',
                  'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] hover:border-[#3d2d5a] text-[#6b4d8a] hover:text-[#a78bde]',
                  snapIndex <= 0 && 'opacity-30 cursor-not-allowed pointer-events-none',
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={onStepForward}
                disabled={snapIndex >= snapsLength - 1}
                className={cn(
                  'h-10 flex items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-all duration-200',
                  'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
                  snapIndex >= snapsLength - 1 && 'opacity-30 cursor-not-allowed pointer-events-none',
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Btn onClick={onRandomize} disabled={isAnimating} variant="neutral">Randomize</Btn>
            <Btn onClick={onReset} disabled={isAnimating} variant="neutral">Reset</Btn>
          </div>
          <Btn onClick={onSort} disabled={isAnimating || isSorted} variant="primary" full>
            {isAnimating ? 'Sorting…' : isSorted ? 'Sorted ✓' : 'Sort'}
          </Btn>
        </div>
      )}

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#6b4d8a]">Speed:</span>
        {(['slow', 'normal', 'fast'] as const).map(s => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
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
