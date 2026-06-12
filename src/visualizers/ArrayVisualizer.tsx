import { AnimatePresence, motion } from 'framer-motion'
import { useArrayStore } from '@/store/arrayStore'
import type { ArrayElement } from '@/types'
import { useEffect, useRef } from 'react'

// Box classes only (bg + border + text color). Font weight is set on the element itself.
const HIGHLIGHT_STYLES: Record<NonNullable<ArrayElement['highlight']>, string> = {
  default:  'bg-[#1c1530] border-[#744cae] text-[#f0eaf8]',
  active:   'bg-[#9b6fd4] border-[#9b6fd4] text-[#ffffff]',
  inserted: 'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  deleted:  'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
}

export function ArrayVisualizer() {
  const { elements, clearHighlights } = useArrayStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [elements])

  useEffect(() => {
    // Handle deleted element: find and remove it after exit animation plays
    const deletedIdx = elements.findIndex(el => el.highlight === 'deleted')
    if (deletedIdx !== -1) {
      const timer = setTimeout(() => {
        useArrayStore.setState(state => ({
          elements: state.elements
            .filter((_, i) => i !== deletedIdx)
            .map(el => ({ ...el, highlight: 'default' as const })),
        }))
      }, 700)
      return () => clearTimeout(timer)
    }

    // Clear any non-default highlight (e.g. inserted, active) after a short pause
    const hasHighlight = elements.some(el => el.highlight !== 'default')
    if (hasHighlight) {
      const timer = setTimeout(clearHighlights, 600)
      return () => clearTimeout(timer)
    }
  }, [elements, clearHighlights])

  const n = elements.length
  const boxSize = n > 48 ? 24 : n > 32 ? 32 : 48
  const fontSize = boxSize < 32 ? '10px' : boxSize < 48 ? '12px' : '14px'
  const showIndex = n <= 32
  const wrapElements = n > 16

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div ref={scrollRef} className={`flex items-center justify-center gap-1.5 min-h-[80px] p-4 rounded-xl border border-[#2a1f3d] bg-[#090710] ${wrapElements ? 'flex-wrap' : 'overflow-x-auto'}`}>
          {elements.length === 0 && (
            <span className="text-[#3d2d5a] text-sm">Array is empty</span>
          )}
          <AnimatePresence mode="popLayout">
            {elements.map((el, idx) => (
              <motion.div
                key={el.id}
                layout
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="flex flex-col items-center gap-1 flex-shrink-0"
                data-active={el.highlight !== 'default' ? 'true' : undefined}
              >
                <motion.div
                  animate={
                    el.highlight === 'inserted'
                      ? { scale: [1, 1.15, 1] }
                      : el.highlight === 'deleted'
                        ? { scale: [1, 1.1, 1], x: [0, -4, 4, 0] }
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
          <span className="text-[10px] text-[#6b4d8a] font-mono">length: {elements.length}</span>
        </div>
      </div>

      <Legend />
    </div>
  )
}

const LEGEND_LABELS: Record<NonNullable<ArrayElement['highlight']>, string> = {
  default: 'Default',
  active: 'Active',
  inserted: 'Inserted',
  deleted: 'Deleted',
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {(Object.keys(HIGHLIGHT_STYLES) as NonNullable<ArrayElement['highlight']>[]).map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full border-2 ${HIGHLIGHT_STYLES[key]}`} />
          <span className="text-xs text-[#6b4d8a]">{LEGEND_LABELS[key]}</span>
        </div>
      ))}
    </div>
  )
}
