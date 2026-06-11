import { motion } from 'framer-motion'
import type { BSElement, BSHighlight } from '@/store/binarySearchStore'

const FILL: Record<BSHighlight, string> = {
  default:    '#1c1530',
  eliminated: '#0d0b14',
  low:        '#9b6fd4',
  mid:        '#b892e8',
  high:       '#744cae',
  found:      '#c9a0ff',
  notFound:   '#ff6b8a',
}

const BORDER: Record<BSHighlight, string> = {
  default:    '#2a1f3d',
  eliminated: '#1a1428',
  low:        '#c9a0ff',
  mid:        '#d4b8ff',
  high:       '#9b6fd4',
  found:      '#e8d5ff',
  notFound:   '#ff6b8a',
}

const TEXT: Record<BSHighlight, string> = {
  default:    '#a78bde',
  eliminated: '#2a1f3d',
  low:        '#ffffff',
  mid:        '#ffffff',
  high:       '#ffffff',
  found:      '#1a0f2e',
  notFound:   '#ffffff',
}

const POINTER_LABEL: Partial<Record<BSHighlight, string>> = {
  low:     'L',
  mid:     'M',
  high:    'H',
  found:   '★',
  notFound: '✕',
}

const LEGEND_ITEMS: { key: BSHighlight; label: string }[] = [
  { key: 'low',      label: 'Low'      },
  { key: 'mid',      label: 'Mid'      },
  { key: 'high',     label: 'High'     },
  { key: 'found',    label: 'Found'    },
  { key: 'notFound', label: 'Not Found' },
  { key: 'eliminated', label: 'Eliminated' },
]

interface Props {
  elements: BSElement[]
  description: string
}

export function BinarySearchVisualizer({ elements, description }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-4">
        <div className="overflow-x-auto">
          <div className="flex gap-[3px] min-w-fit pb-1">
            {elements.map((el, i) => {
              const label = POINTER_LABEL[el.highlight]
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 36 }}>
                  {/* Pointer label above */}
                  <div className="h-4 flex items-center justify-center">
                    {label && (
                      <span
                        className="text-[10px] font-bold leading-none"
                        style={{ color: FILL[el.highlight] === '#0d0b14' ? '#2a1f3d' : BORDER[el.highlight] }}
                      >
                        {label}
                      </span>
                    )}
                  </div>

                  {/* Value box */}
                  <motion.div
                    className="w-full h-9 flex items-center justify-center rounded border font-mono text-xs font-semibold"
                    animate={{
                      backgroundColor: FILL[el.highlight],
                      borderColor: BORDER[el.highlight],
                      color: TEXT[el.highlight],
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    {el.value}
                  </motion.div>

                  {/* Index below */}
                  <span className="text-[8px] font-mono text-[#3d2d5a]">{i}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step description */}
      <div className="rounded-lg border border-[#2a1f3d] bg-[#090710] px-4 py-2.5 min-h-[36px]">
        <span className="text-xs font-mono text-[#c9a0ff]">
          {description || <span className="text-[#3d2d5a]">Enter a target and press Search</span>}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {LEGEND_ITEMS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-[2px] border"
              style={{ background: FILL[key], borderColor: BORDER[key] }}
            />
            <span className="text-xs text-[#6b4d8a]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
