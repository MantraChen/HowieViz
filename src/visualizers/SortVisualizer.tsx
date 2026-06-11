import { motion } from 'framer-motion'
import type { SortBar, BarHighlight } from '@/store/sortStore'

const BAR_MAX_H = 176

const FILL: Record<BarHighlight, string> = {
  default:   '#1c1530',
  comparing: '#9b6fd4',
  pivot:     '#b892e8',
  sorted:    '#c9a0ff',
  swapping:  '#ff6b8a',
}
const STROKE: Record<BarHighlight, string> = {
  default:   '#744cae',
  comparing: '#c9a0ff',
  pivot:     '#d4b8ff',
  sorted:    '#e8d5ff',
  swapping:  '#ff6b8a',
}
const LABEL: Record<BarHighlight, string> = {
  default:   '#6b4d8a',
  comparing: '#e0d0ff',
  pivot:     '#d4b8ff',
  sorted:    '#c9a0ff',
  swapping:  '#ff6b8a',
}

interface Props {
  bars: SortBar[]
  description: string
}

export function SortVisualizer({ bars, description }: Props) {
  const maxVal = Math.max(...bars.map(b => b.value), 1)
  const showLabels = bars.length <= 64
  const thinBorder = bars.length > 128
  const smallFont = bars.length > 32

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] px-3 pt-3 pb-1">
        {/* Bars */}
        <div className="flex items-end gap-[2px]" style={{ height: `${BAR_MAX_H + 22}px`, overflow: 'hidden' }}>
          {bars.map((bar, i) => {
            const barH = Math.max(4, Math.round((bar.value / maxVal) * BAR_MAX_H))
            return (
              <div key={i} className="flex flex-col items-center flex-1 min-w-0">
                {showLabels && (
                  <span
                    className="font-mono truncate leading-none mb-[2px]"
                    style={{ fontSize: smallFont ? '6px' : '9px', color: LABEL[bar.highlight] }}
                  >
                    {bar.value}
                  </span>
                )}
                <motion.div
                  className={`w-full rounded-t-[1px] ${thinBorder ? 'border-[0.5px]' : 'border-[1.5px]'}`}
                  animate={{
                    height: `${barH}px`,
                    backgroundColor: FILL[bar.highlight],
                    borderColor: STROKE[bar.highlight],
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )
          })}
        </div>

        {/* Index labels */}
        <div className="flex gap-[3px] mt-[3px]">
          {bars.map((_, i) => (
            <div key={i} className="flex-1 flex justify-center">
              <span className="font-mono text-[#3d2d5a]" style={{ fontSize: '7px' }}>{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step description */}
      <div className="rounded-lg border border-[#2a1f3d] bg-[#090710] px-4 py-2.5 min-h-[36px]">
        <span className="text-xs font-mono text-[#c9a0ff]">
          {description || <span className="text-[#3d2d5a]">Press Sort to begin</span>}
        </span>
      </div>

      <Legend />
    </div>
  )
}

const LEGEND_ITEMS: { key: BarHighlight; label: string }[] = [
  { key: 'default',   label: 'Default'      },
  { key: 'comparing', label: 'Comparing'    },
  { key: 'pivot',     label: 'Pivot / Merge' },
  { key: 'swapping',  label: 'Swapping'     },
  { key: 'sorted',    label: 'Sorted'       },
]

function Legend() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {LEGEND_ITEMS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-[2px] border-[1.5px]"
            style={{ background: FILL[key], borderColor: STROKE[key] }}
          />
          <span className="text-xs text-[#6b4d8a]">{label}</span>
        </div>
      ))}
    </div>
  )
}
