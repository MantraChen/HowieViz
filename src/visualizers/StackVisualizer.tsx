import { AnimatePresence, motion } from 'framer-motion'
import { useStackStore, type StackElement } from '@/store/stackStore'
import { useEffect, useRef } from 'react'

const HIGHLIGHT_STYLES: Record<NonNullable<StackElement['highlight']>, string> = {
  default:  'bg-[#1c1530] border-[#744cae] text-[#f0eaf8]',
  active:   'bg-[#9b6fd4] border-[#9b6fd4] text-[#ffffff]',
  inserted: 'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  deleted:  'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
}

export function StackVisualizer() {
  const { elements, clearHighlights } = useStackStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }, [elements])

  useEffect(() => {
    const hasHighlighted = elements.some((el) => el.highlight !== 'default')
    if (!hasHighlighted) return

    const allDeleted = elements.length > 0 && elements.every((el) => el.highlight === 'deleted')
    const topDeleted = !allDeleted && elements[elements.length - 1]?.highlight === 'deleted'

    if (allDeleted) {
      const timer = setTimeout(() => {
        useStackStore.setState({ elements: [] })
      }, 900)
      return () => clearTimeout(timer)
    }

    if (topDeleted) {
      const timer = setTimeout(() => {
        useStackStore.setState((state) => ({
          elements: state.elements.slice(0, -1).map((el) => ({ ...el, highlight: 'default' as const })),
        }))
      }, 700)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => clearHighlights(), 600)
    return () => clearTimeout(timer)
  }, [elements, clearHighlights])

  // Reverse so top of stack renders at top of screen
  const displayed = [...elements].reverse()
  const compact = elements.length > 32
  const boxSize = compact ? 36 : 48
  const boxFont = compact ? '11px' : '14px'

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div ref={scrollRef} className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-[#2a1f3d] bg-[#090710] max-h-[480px] overflow-y-auto">
          {elements.length === 0 && (
            <span className="text-[#3d2d5a] text-sm m-auto">Stack is empty</span>
          )}
          <AnimatePresence mode="popLayout">
            {displayed.map((el, displayIdx) => {
              const indexFromBottom = elements.length - 1 - displayIdx
              const isTop = displayIdx === 0
              return (
                <motion.div
                  key={el.id}
                  layout
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 28,
                    delay: el.highlight === 'deleted' ? displayIdx * 0.05 : 0,
                  }}
                  className="flex items-center gap-3 flex-shrink-0"
                  data-active={el.highlight !== 'default' ? 'true' : undefined}
                >
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
                    style={{ width: boxSize, height: boxSize, fontSize: boxFont }}
                  >
                    {el.value}
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#6b4d8a] font-mono">{indexFromBottom}</span>
                    {isTop && (
                      <span className="text-[10px] font-bold text-[#c9a0ff] uppercase tracking-wider bg-[#c9a0ff]/10 px-1.5 py-0.5 rounded">
                        TOP
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
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

const LEGEND_LABELS: Record<NonNullable<StackElement['highlight']>, string> = {
  default: 'Default',
  active: 'Active (Peek)',
  inserted: 'Inserted',
  deleted: 'Deleted',
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {(Object.keys(HIGHLIGHT_STYLES) as NonNullable<StackElement['highlight']>[]).map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full border-2 ${HIGHLIGHT_STYLES[key]}`} />
          <span className="text-xs text-[#6b4d8a]">{LEGEND_LABELS[key]}</span>
        </div>
      ))}
    </div>
  )
}
