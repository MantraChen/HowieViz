import { AnimatePresence, motion } from 'framer-motion'
import { useDLLStore, type DLLNode } from '@/store/doublyLinkedListStore'
import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const NODES_PER_ROW = 10

const HIGHLIGHT_STYLES: Record<NonNullable<DLLNode['highlight']>, string> = {
  default:  'bg-[#1c1530] border-[#744cae] text-[#f0eaf8]',
  active:   'bg-[#9b6fd4] border-[#9b6fd4] text-[#ffffff]',
  inserted: 'bg-[#c9a0ff] border-[#c9a0ff] text-[#1a0f2e]',
  deleted:  'bg-[#ff6b8a] border-[#ff6b8a] text-[#ffffff]',
}

export function DoublyLinkedListVisualizer() {
  const { nodes, isSearching, clearHighlights } = useDLLStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [nodes])

  useEffect(() => {
    const deletedIdx = nodes.findIndex(n => n.highlight === 'deleted')
    if (deletedIdx === -1) return
    const timer = setTimeout(() => {
      useDLLStore.setState(state => ({
        nodes: state.nodes
          .filter((_, i) => i !== deletedIdx)
          .map(n => ({ ...n, highlight: 'default' as const })),
      }))
    }, 700)
    return () => clearTimeout(timer)
  }, [nodes])

  useEffect(() => {
    if (isSearching) return
    const hasInserted = nodes.some(n => n.highlight === 'inserted')
    if (!hasInserted) return
    const timer = setTimeout(() => clearHighlights(), 600)
    return () => clearTimeout(timer)
  }, [nodes, isSearching, clearHighlights])

  const chunks: DLLNode[][] = []
  if (nodes.length > 0) {
    for (let i = 0; i < nodes.length; i += NODES_PER_ROW) {
      chunks.push(nodes.slice(i, i + NODES_PER_ROW))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div ref={containerRef} className="flex flex-col gap-2 p-4 rounded-xl border border-[#2a1f3d] bg-[#090710]">
          {nodes.length === 0 ? (
            <div className="flex items-center gap-1">
              <NullCap side="left" />
              <BidiArrow />
              <span className="text-[#3d2d5a] text-sm font-mono">empty</span>
              <BidiArrow />
              <NullCap side="right" />
            </div>
          ) : (
            chunks.map((chunk, chunkIdx) => {
              const startIdx = chunkIdx * NODES_PER_ROW
              const isFirstChunk = chunkIdx === 0
              const isLastChunk = chunkIdx === chunks.length - 1
              return (
                <div key={chunkIdx} className="flex items-center overflow-x-auto">
                  {isFirstChunk && <NullCap side="left" />}

                  <AnimatePresence mode="popLayout">
                    {chunk.map((node, localIdx) => {
                      const idx = startIdx + localIdx
                      return (
                        <motion.div
                          key={node.id}
                          layout
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className="flex items-start flex-shrink-0"
                          data-active={node.highlight !== 'default' ? 'true' : undefined}
                        >
                          {/* Bidirectional arrow before each node (except first node on first chunk which already has NullCap) */}
                          {!(isFirstChunk && localIdx === 0) && <BidiArrow />}

                          {/* Node column */}
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
                              {idx === 0 && (
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
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {isLastChunk && (
                    <>
                      <BidiArrow />
                      <NullCap side="right" />
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="mt-1 text-center">
          <span className="text-[10px] text-[#6b4d8a] font-mono">length: {nodes.length}</span>
        </div>
      </div>

      <Legend />
    </div>
  )
}

function BidiArrow() {
  return (
    <div className="flex flex-col items-center justify-center gap-[2px] flex-shrink-0 px-0.5">
      <ArrowRight size={11} className="text-[#3d2d5a]" />
      <ArrowLeft size={11} className="text-[#3d2d5a]" />
    </div>
  )
}

function NullCap({ side }: { side: 'left' | 'right' }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="h-12 px-2 flex items-center justify-center rounded-lg border-2 border-dashed border-[#2a1f3d] font-mono text-[10px] text-[#3d2d5a]">
        {side === 'left' ? '← NULL' : 'NULL →'}
      </div>
      <div className="h-4" />
    </div>
  )
}

const LEGEND_LABELS: Record<NonNullable<DLLNode['highlight']>, string> = {
  default:  'Default',
  active:   'Traversing',
  inserted: 'Inserted / Found',
  deleted:  'Deleted',
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {(Object.keys(HIGHLIGHT_STYLES) as NonNullable<DLLNode['highlight']>[]).map(key => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full border-2 ${HIGHLIGHT_STYLES[key]}`} />
          <span className="text-xs text-[#6b4d8a]">{LEGEND_LABELS[key]}</span>
        </div>
      ))}
    </div>
  )
}
