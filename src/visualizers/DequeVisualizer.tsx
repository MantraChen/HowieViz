import { AnimatePresence, motion } from 'framer-motion'
import { useDequeStore, type DequeHighlight, type DequeElement } from '@/store/dequeStore'

const STYLES: Record<DequeHighlight, string> = {
  'default':    'bg-[#1c1530] border-[#744cae] text-[#f0eaf8]',
  'push-front': 'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  'push-rear':  'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  'pop-front':  'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
  'pop-rear':   'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
  'peek':       'bg-[#9b6fd4] border-[#9b6fd4] text-[#ffffff]',
}

function getAnimate(h: DequeHighlight) {
  switch (h) {
    case 'push-front':
    case 'push-rear':
      return { x: 0, opacity: 1, scale: [0.7, 1.18, 1] }
    case 'pop-front':
      return { x: -50, opacity: 0, scale: 0.7 }
    case 'pop-rear':
      return { x: 50, opacity: 0, scale: 0.7 }
    case 'peek':
      return { x: 0, opacity: 1, scale: [1, 1.15, 1, 1.15, 1] }
    default:
      return { x: 0, opacity: 1, scale: 1 }
  }
}

function getInitial(h: DequeHighlight) {
  if (h === 'push-front') return { x: -28, opacity: 0, scale: 0.8 }
  if (h === 'push-rear')  return { x: 28, opacity: 0, scale: 0.8 }
  return undefined
}

export function DequeVisualizer() {
  const { elements } = useDequeStore()

  const n = elements.length
  const boxSize = n > 16 ? 36 : 48
  const fontSize = boxSize < 40 ? '11px' : '14px'

  const isFront = (idx: number) => idx === 0
  const isRear  = (idx: number) => idx === elements.length - 1

  return (
    <div className="flex flex-col gap-5">
      {/* End labels */}
      <div className="flex justify-between px-2">
        <span className="text-[10px] font-bold text-[#c9a0ff] uppercase tracking-wider">◀ Front</span>
        <span className="text-[10px] font-bold text-[#9b6fd4] uppercase tracking-wider">Rear ▶</span>
      </div>

      {/* Main strip */}
      <div className="relative">
        <div className="flex items-center justify-center gap-1.5 min-h-[80px] p-4 rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-x-auto">
          {elements.length === 0 && (
            <span className="text-[#3d2d5a] text-sm">Deque is empty</span>
          )}
          <AnimatePresence mode="popLayout">
            {elements.map((el: DequeElement, idx: number) => (
              <motion.div
                key={el.id}
                layout
                initial={getInitial(el.highlight)}
                animate={getAnimate(el.highlight)}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                {/* FRONT / REAR badges */}
                <div className="flex items-center gap-1 h-5">
                  {isFront(idx) && (
                    <span className="text-[9px] font-bold text-[#c9a0ff] uppercase tracking-wider bg-[#c9a0ff]/10 px-1.5 py-0.5 rounded">
                      FRONT
                    </span>
                  )}
                  {isRear(idx) && elements.length > 1 && (
                    <span className="text-[9px] font-bold text-[#9b6fd4] uppercase tracking-wider bg-[#9b6fd4]/10 px-1.5 py-0.5 rounded">
                      REAR
                    </span>
                  )}
                  {isFront(idx) && isRear(idx) && (
                    <span className="text-[9px] font-bold text-[#b892e8] uppercase tracking-wider bg-[#b892e8]/10 px-1.5 py-0.5 rounded">
                      F+R
                    </span>
                  )}
                </div>

                {/* Box */}
                <div
                  className={`flex items-center justify-center rounded-lg border-2 font-mono font-semibold transition-colors duration-300 ${STYLES[el.highlight]}`}
                  style={{ width: boxSize, height: boxSize, fontSize }}
                >
                  {el.value}
                </div>

                <span className="text-[10px] text-[#6b4d8a] font-mono">{idx}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-1 text-center">
          <span className="text-[10px] text-[#6b4d8a] font-mono">size: {elements.length}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {([
          { key: 'default',    label: 'Default'   },
          { key: 'push-front', label: 'Push Front' },
          { key: 'pop-front',  label: 'Pop'        },
          { key: 'peek',       label: 'Peek'       },
        ] as { key: DequeHighlight; label: string }[]).map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full border-2 ${STYLES[key]}`} />
            <span className="text-xs text-[#6b4d8a]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
