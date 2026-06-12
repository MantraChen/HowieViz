import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import type { CSStep, CSHighlight } from '@/store/countingSortStore'

const FILL: Record<CSHighlight, string> = {
  default:  '#1c1530',
  active:   '#9b6fd4',
  sorted:   '#c9a0ff',
  counting: '#b892e8',
  placed:   '#e8d5ff',
}

const BORDER: Record<CSHighlight, string> = {
  default:  '#744cae',
  active:   '#d4a8ff',
  sorted:   '#e8d5ff',
  counting: '#c9a0ff',
  placed:   '#f0eaf8',
}

const TEXT: Record<CSHighlight, string> = {
  default:  '#a78bde',
  active:   '#ffffff',
  sorted:   '#1a0f2e',
  counting: '#ffffff',
  placed:   '#1a0f2e',
}

const PHASE_LABELS: Record<number, string> = {
  0: '',
  1: 'Phase 1 — Count',
  2: 'Phase 2 — Cumulative',
  3: 'Phase 3 — Output',
}

const PHASE_COLORS: Record<number, string> = {
  0: '#3d2d5a',
  1: '#9b6fd4',
  2: '#b892e8',
  3: '#c9a0ff',
}

interface Props { step: CSStep; description: string }

function Cell({
  value,
  highlight,
  index,
  showIndex,
  width,
  isActive,
}: {
  value: number | null
  highlight: CSHighlight
  index: number
  showIndex: boolean
  width: number
  isActive?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0" style={{ width }} data-active={isActive ? 'true' : undefined}>
      <motion.div
        className="w-full flex items-center justify-center rounded border-2 font-mono font-semibold"
        style={{ height: 32, fontSize: 11 }}
        animate={{
          backgroundColor: FILL[highlight],
          borderColor: BORDER[highlight],
          color: TEXT[highlight],
        }}
        transition={{ duration: 0.15 }}
      >
        {value !== null ? value : ''}
      </motion.div>
      {showIndex && (
        <span className="text-[8px] font-mono text-[#3d2d5a]">{index}</span>
      )}
    </div>
  )
}

export function CountingSortVisualizer({ step, description }: Props) {
  const { inputElements, countArray, outputArray, phase } = step

  const inputRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollToActive = (container: HTMLDivElement | null) => {
      if (!container) return
      const el = container.querySelector<HTMLElement>('[data-active="true"]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    scrollToActive(inputRef.current)
    scrollToActive(countRef.current)
    scrollToActive(outputRef.current)
  }, [step])

  // Determine display range for count array (trim trailing zeros at start/end with small padding)
  const maxNonZeroCount = countArray.reduceRight((acc, c, i) => {
    if (acc >= 0) return acc
    return c.value > 0 || c.highlight !== 'default' ? i : acc
  }, -1)
  const showCountUpto = Math.max(maxNonZeroCount, Math.max(...inputElements.map(e => e.value)), 5)

  const countSlice = countArray.slice(0, showCountUpto + 1)
  const countCellW = Math.max(22, Math.min(28, Math.floor(560 / (showCountUpto + 1))))
  const inputCellW = 38
  const outputCellW = 38

  const phaseColor = PHASE_COLORS[phase] ?? '#3d2d5a'
  const phaseLabel = PHASE_LABELS[phase] ?? ''

  return (
    <div className="flex flex-col gap-4">
      {/* Phase badge */}
      {phase > 0 && (
        <div className="flex items-center gap-2">
          <div
            className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
            style={{ background: phaseColor + '20', color: phaseColor, border: `1px solid ${phaseColor}40` }}
          >
            {phaseLabel}
          </div>
        </div>
      )}

      {/* Input array */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-3">
        <p className="text-[9px] text-[#6b4d8a] uppercase tracking-widest mb-2 font-medium">Input Array</p>
        <div className="overflow-x-auto" ref={inputRef}>
          <div className="flex gap-[3px] min-w-fit">
            {inputElements.map((el, i) => (
              <Cell
                key={i}
                value={el.value}
                highlight={el.highlight}
                index={i}
                showIndex
                width={inputCellW}
                isActive={el.highlight !== 'default'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Count / Cumulative array */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-3">
        <p className="text-[9px] text-[#6b4d8a] uppercase tracking-widest mb-2 font-medium">
          {phase <= 1 ? 'Count Array' : 'Cumulative Array'}
        </p>
        <div className="overflow-x-auto" ref={countRef}>
          <div className="flex gap-[2px] min-w-fit">
            {countSlice.map((cell, i) => (
              <Cell
                key={i}
                value={cell.value}
                highlight={cell.highlight}
                index={i}
                showIndex
                width={countCellW}
                isActive={cell.highlight !== 'default'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Output array */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-3">
        <p className="text-[9px] text-[#6b4d8a] uppercase tracking-widest mb-2 font-medium">Output Array</p>
        <div className="overflow-x-auto" ref={outputRef}>
          <div className="flex gap-[3px] min-w-fit">
            {outputArray.map((cell, i) => (
              <Cell
                key={i}
                value={cell.value}
                highlight={cell.highlight}
                index={i}
                showIndex
                width={outputCellW}
                isActive={cell.highlight !== 'default'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step description */}
      <div className="rounded-lg border border-[#2a1f3d] bg-[#090710] px-4 py-2.5 min-h-[36px]">
        <span className="text-xs font-mono text-[#c9a0ff]">
          {description || <span className="text-[#3d2d5a]">Press Sort to begin</span>}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {(
          [
            { key: 'default',  label: 'Default'    },
            { key: 'active',   label: 'Active'     },
            { key: 'counting', label: 'Cumulating' },
            { key: 'placed',   label: 'Placed'     },
            { key: 'sorted',   label: 'Sorted'     },
          ] as { key: CSHighlight; label: string }[]
        ).map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-[2px] border-2"
              style={{ background: FILL[key], borderColor: BORDER[key] }}
            />
            <span className="text-xs text-[#6b4d8a]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
