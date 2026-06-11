import { AnimatePresence, motion } from 'framer-motion'
import { useArrayStore } from '@/store/arrayStore'
import type { ArrayElement } from '@/types'
import { useEffect } from 'react'

// Box classes only (bg + border + text color). Font weight is set on the element itself.
const HIGHLIGHT_STYLES: Record<NonNullable<ArrayElement['highlight']>, string> = {
  default:  'bg-[#1c1530] border-[#744cae] text-[#f0eaf8]',
  active:   'bg-[#9b6fd4] border-[#9b6fd4] text-[#ffffff]',
  inserted: 'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  deleted:  'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
}

export function ArrayVisualizer() {
  const { elements, pop, clearHighlights } = useArrayStore()

  useEffect(() => {
    const highlighted = elements.some((el) => el.highlight !== 'default')
    if (!highlighted) return

    const isPopping = elements[elements.length - 1]?.highlight === 'deleted'

    const timer = setTimeout(
      () => {
        if (isPopping) {
          useArrayStore.setState((state) => ({
            elements: state.elements.slice(0, -1).map((el) => ({ ...el, highlight: 'default' as const })),
          }))
        } else {
          clearHighlights()
        }
      },
      isPopping ? 700 : 600,
    )
    return () => clearTimeout(timer)
  }, [elements, clearHighlights, pop])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div className="flex items-end gap-2 min-h-[120px] p-4 rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-x-auto">
          {elements.length === 0 && (
            <span className="text-[#3d2d5a] text-sm m-auto">Array is empty</span>
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
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
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
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-semibold text-sm transition-colors duration-300 ${HIGHLIGHT_STYLES[el.highlight ?? 'default']}`}
                >
                  {el.value}
                </motion.div>
                <span className="text-[10px] text-[#6b4d8a] font-mono">{idx}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-1">
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
    <div className="flex items-center gap-4 flex-wrap">
      {(Object.keys(HIGHLIGHT_STYLES) as NonNullable<ArrayElement['highlight']>[]).map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded border-2 ${HIGHLIGHT_STYLES[key]}`} />
          <span className="text-xs text-[#6b4d8a]">{LEGEND_LABELS[key]}</span>
        </div>
      ))}
    </div>
  )
}
