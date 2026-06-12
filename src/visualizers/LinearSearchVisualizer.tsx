import { motion } from 'framer-motion'
import type { LSElement, LSHighlight } from '@/store/linearSearchStore'

const FILL: Record<LSHighlight, string> = {
  default:   '#1c1530',
  checking:  '#9b6fd4',
  checked:   '#2a1f3d',
  found:     '#c9a0ff',
  'not-found': '#ff6b8a',
}

const BORDER: Record<LSHighlight, string> = {
  default:   '#744cae',
  checking:  '#d4a8ff',
  checked:   '#3d2d5a',
  found:     '#e8d5ff',
  'not-found': '#ff6b8a',
}

const TEXT: Record<LSHighlight, string> = {
  default:   '#a78bde',
  checking:  '#ffffff',
  checked:   '#3d2d5a',
  found:     '#1a0f2e',
  'not-found': '#ffffff',
}

const LEGEND_ITEMS: { key: LSHighlight; label: string }[] = [
  { key: 'default',    label: 'Default'     },
  { key: 'checking',   label: 'Checking'    },
  { key: 'checked',    label: 'Checked'     },
  { key: 'found',      label: 'Found'       },
  { key: 'not-found',  label: 'Not Found'   },
]

interface Props {
  elements: LSElement[]
  description: string
  comparisons: number
  foundAt: number
}

export function LinearSearchVisualizer({ elements, description, comparisons, foundAt }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Comparison counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#6b4d8a]">Comparisons</span>
        <span className="text-sm font-mono font-bold text-[#c9a0ff]">{comparisons}</span>
      </div>

      {/* Array */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-4">
        <div className="overflow-x-auto">
          <div className="flex gap-[3px] min-w-fit pb-1">
            {elements.map((el, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 40 }}>
                {/* Pointer label */}
                <div className="h-5 flex items-center justify-center">
                  {el.highlight === 'checking' && (
                    <span className="text-[10px] font-bold text-[#d4a8ff]">▼</span>
                  )}
                  {el.highlight === 'found' && (
                    <span className="text-[10px] font-bold text-[#c9a0ff]">★</span>
                  )}
                </div>

                {/* Value box */}
                <motion.div
                  className="w-full h-9 flex items-center justify-center rounded border-2 font-mono text-xs font-semibold"
                  animate={{
                    backgroundColor: FILL[el.highlight],
                    borderColor: BORDER[el.highlight],
                    color: TEXT[el.highlight],
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {el.value}
                </motion.div>

                {/* Index */}
                <span className="text-[8px] font-mono text-[#3d2d5a]">{i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step description */}
      <div className="rounded-lg border border-[#2a1f3d] bg-[#090710] px-4 py-2.5 min-h-[36px]">
        <span className="text-xs font-mono text-[#c9a0ff]">
          {description || (
            <span className="text-[#3d2d5a]">Enter a target value and press Search</span>
          )}
        </span>
      </div>

      {/* Result badge */}
      {foundAt >= 0 && (
        <div className="rounded-lg border border-[#c9a0ff]/30 bg-[#c9a0ff]/10 px-4 py-2 text-center">
          <span className="text-xs font-mono text-[#c9a0ff]">
            Found at index {foundAt} · {comparisons} comparison{comparisons > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {LEGEND_ITEMS.map(({ key, label }) => (
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
