import { AnimatePresence, motion } from 'framer-motion'
import { useLinkedListStore, type ListNode } from '@/store/linkedListStore'
import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

const HIGHLIGHT_STYLES: Record<NonNullable<ListNode['highlight']>, string> = {
  default:  'bg-[#1c1530] border-[#744cae] text-[#f0eaf8]',
  active:   'bg-[#9b6fd4] border-[#9b6fd4] text-[#ffffff]',
  inserted: 'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  deleted:  'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
}

export function LinkedListVisualizer() {
  const { nodes, isSearching, clearHighlights } = useLinkedListStore()

  // Remove deleted node after exit animation plays
  useEffect(() => {
    const deletedIdx = nodes.findIndex((n) => n.highlight === 'deleted')
    if (deletedIdx === -1) return

    const timer = setTimeout(() => {
      useLinkedListStore.setState((state) => ({
        nodes: state.nodes
          .filter((_, i) => i !== deletedIdx)
          .map((n) => ({ ...n, highlight: 'default' as const })),
      }))
    }, 700)
    return () => clearTimeout(timer)
  }, [nodes])

  // Clear 'inserted' highlight from insert operations (not from search — search manages its own cleanup)
  useEffect(() => {
    if (isSearching) return
    const hasInserted = nodes.some((n) => n.highlight === 'inserted')
    if (!hasInserted) return

    const timer = setTimeout(() => clearHighlights(), 600)
    return () => clearTimeout(timer)
  }, [nodes, isSearching, clearHighlights])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div className="flex items-center min-h-[88px] p-4 rounded-xl border border-[#2a1f3d] bg-[#090710] overflow-x-auto gap-0">
          {nodes.length === 0 ? (
            <div className="flex items-center gap-1 m-auto">
              <span className="text-[#3d2d5a] text-sm font-mono">empty</span>
              <ArrowRight size={14} className="text-[#2a1f3d] mx-1" />
              <NullNode />
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {nodes.map((node, idx) => (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="flex items-start flex-shrink-0"
                  >
                    {/* Node column: box + head/tail label */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        animate={
                          node.highlight === 'inserted'
                            ? { scale: [1, 1.15, 1] }
                            : node.highlight === 'deleted'
                              ? { scale: [1, 1.1, 1], x: [0, -4, 4, 0] }
                              : node.highlight === 'active'
                                ? { scale: [1, 1.08, 1] }
                                : { scale: 1 }
                        }
                        transition={{ duration: 0.35 }}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-semibold text-sm transition-colors duration-300 ${HIGHLIGHT_STYLES[node.highlight ?? 'default']}`}
                      >
                        {node.value}
                      </motion.div>
                      <div className="h-4 flex items-center justify-center">
                        {idx === 0 && nodes.length > 0 && (
                          <span className="text-[9px] font-bold text-[#c9a0ff] uppercase tracking-wider">
                            HEAD
                          </span>
                        )}
                        {idx === nodes.length - 1 && nodes.length > 1 && (
                          <span className="text-[9px] font-bold text-[#9b6fd4] uppercase tracking-wider">
                            TAIL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow — h-12 ensures it aligns with the node box, not the label below */}
                    <div className="h-12 flex items-center px-1">
                      <ArrowRight size={16} className="text-[#3d2d5a]" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <NullNode />
            </>
          )}
        </div>

        <div className="mt-1">
          <span className="text-[10px] text-[#6b4d8a] font-mono">length: {nodes.length}</span>
        </div>
      </div>

      <Legend />
    </div>
  )
}

function NullNode() {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="h-12 px-3 flex items-center justify-center rounded-lg border-2 border-dashed border-[#2a1f3d] font-mono text-xs text-[#3d2d5a]">
        NULL
      </div>
      <div className="h-4" />
    </div>
  )
}

const LEGEND_LABELS: Record<NonNullable<ListNode['highlight']>, string> = {
  default:  'Default',
  active:   'Traversing',
  inserted: 'Inserted / Found',
  deleted:  'Deleted',
}

function Legend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {(Object.keys(HIGHLIGHT_STYLES) as NonNullable<ListNode['highlight']>[]).map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded border-2 ${HIGHLIGHT_STYLES[key]}`} />
          <span className="text-xs text-[#6b4d8a]">{LEGEND_LABELS[key]}</span>
        </div>
      ))}
    </div>
  )
}
