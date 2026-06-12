import { AnimatePresence, motion } from 'framer-motion'
import { useQueueStore, type QueueElement } from '@/store/queueStore'
import { useEffect, useRef } from 'react'

const HIGHLIGHT_STYLES: Record<NonNullable<QueueElement['highlight']>, string> = {
  default:  'bg-[#1c1530] border-[#744cae] text-[#f0eaf8]',
  active:   'bg-[#9b6fd4] border-[#9b6fd4] text-[#ffffff]',
  inserted: 'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  deleted:  'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
}

export function QueueVisualizer() {
  const { elements, clearHighlights } = useQueueStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [elements])

  useEffect(() => {
    const hasHighlighted = elements.some((el) => el.highlight !== 'default')
    if (!hasHighlighted) return

    const allDeleted = elements.length > 0 && elements.every((el) => el.highlight === 'deleted')
    const frontDeleted = !allDeleted && elements[0]?.highlight === 'deleted'

    if (allDeleted) {
      const timer = setTimeout(() => {
        useQueueStore.setState({ elements: [] })
      }, 900)
      return () => clearTimeout(timer)
    }

    if (frontDeleted) {
      const timer = setTimeout(() => {
        useQueueStore.setState((state) => ({
          elements: state.elements.slice(1).map((el) => ({ ...el, highlight: 'default' as const })),
        }))
      }, 700)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => clearHighlights(), 600)
    return () => clearTimeout(timer)
  }, [elements, clearHighlights])

  const n = elements.length
  const boxSize = n > 48 ? 24 : n > 32 ? 32 : 48
  const fontSize = boxSize < 32 ? '10px' : boxSize < 48 ? '12px' : '14px'
  const showIndex = n <= 32
  const wrapElements = n > 16

  const isFront = (idx: number) => idx === 0
  const isRear = (idx: number) => idx === elements.length - 1

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div ref={scrollRef} className={`flex items-center justify-center gap-1.5 min-h-[80px] p-4 rounded-xl border border-[#2a1f3d] bg-[#090710] ${wrapElements ? 'flex-wrap' : 'overflow-x-auto'}`}>
          {elements.length === 0 && (
            <span className="text-[#3d2d5a] text-sm">Queue is empty</span>
          )}
          <AnimatePresence mode="popLayout">
            {elements.map((el, idx) => (
              <motion.div
                key={el.id}
                layout
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 28,
                  delay: el.highlight === 'deleted' ? idx * 0.05 : 0,
                }}
                className="flex flex-col items-center gap-1 flex-shrink-0"
                data-active={el.highlight !== 'default' ? 'true' : undefined}
              >
                {!wrapElements && (
                  <div className="flex items-center gap-1 h-5">
                    {isFront(idx) && (
                      <span className="text-[10px] font-bold text-[#c9a0ff] uppercase tracking-wider bg-[#c9a0ff]/10 px-1.5 py-0.5 rounded">
                        FRONT
                      </span>
                    )}
                    {isRear(idx) && (
                      <span className="text-[10px] font-bold text-[#9b6fd4] uppercase tracking-wider bg-[#9b6fd4]/10 px-1.5 py-0.5 rounded">
                        REAR
                      </span>
                    )}
                  </div>
                )}
                <motion.div
                  animate={
                    el.highlight === 'inserted'
                      ? { scale: [1, 1.15, 1] }
                      : el.highlight === 'deleted'
                        ? { scale: [1, 1.1, 1], x: [0, -4, 4, 0] }
                        : el.highlight === 'active'
                          ? { scale: [1, 1.1, 1, 1.1, 1] }
                          : { scale: 1 }
                  }
                  transition={{ duration: 0.4 }}
                  className={`flex items-center justify-center rounded-lg border-2 font-mono font-semibold transition-colors duration-300 ${HIGHLIGHT_STYLES[el.highlight ?? 'default']}`}
                  style={{ width: boxSize, height: boxSize, fontSize }}
                >
                  {el.value}
                </motion.div>
                {showIndex && <span className="text-[10px] text-[#6b4d8a] font-mono">{idx}</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-1 text-center">
          <span className="text-[10px] text-[#6b4d8a] font-mono">size: {elements.length}</span>
        </div>
      </div>

      <Legend />
    </div>
  )
}

const LEGEND_LABELS: Record<NonNullable<QueueElement['highlight']>, string> = {
  default: 'Default',
  active: 'Active (Peek)',
  inserted: 'Inserted',
  deleted: 'Deleted',
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {(Object.keys(HIGHLIGHT_STYLES) as NonNullable<QueueElement['highlight']>[]).map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full border-2 ${HIGHLIGHT_STYLES[key]}`} />
          <span className="text-xs text-[#6b4d8a]">{LEGEND_LABELS[key]}</span>
        </div>
      ))}
    </div>
  )
}
