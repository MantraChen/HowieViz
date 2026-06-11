import { useGraphStore } from '@/store/graphStore'
import { cn } from '@/lib/utils'

export function GraphControls() {
  const {
    nodes,
    isAnimating,
    speed,
    startNode,
    addNodeInput,
    fromNodeInput,
    toNodeInput,
    removeNodeInput,
    setSpeed,
    setStartNode,
    setAddNodeInput,
    setFromNodeInput,
    setToNodeInput,
    setRemoveNodeInput,
    addNode,
    addEdge,
    removeNode,
    runBFS,
    runDFS,
    clear,
    reset,
  } = useGraphStore()

  const nodeLabels = Object.values(nodes)
    .map(n => n.label)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const isEmpty = nodeLabels.length === 0

  const inputClass =
    'h-9 px-3 rounded-md bg-[#1a1428] border border-[#2a1f3d] text-sm text-[#f0eaf8] placeholder:text-[#3d2d5a] focus:outline-none focus:border-[#b892e8] transition-colors disabled:opacity-40'

  return (
    <div className="space-y-5">
      {/* Traversal */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Traversal</label>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-[#6b4d8a]">Start Node</label>
            {isEmpty ? (
              <div className={cn(inputClass, 'flex items-center opacity-40 w-full')}>
                <span className="text-[#3d2d5a]">no nodes</span>
              </div>
            ) : (
              <select
                value={startNode}
                onChange={e => setStartNode(e.target.value)}
                disabled={isAnimating}
                className={cn(inputClass, 'w-full cursor-pointer')}
              >
                {nodeLabels.map(label => (
                  <option key={label} value={label} className="bg-[#1a1428]">
                    Node {label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn
              onClick={() => !isAnimating && !isEmpty && runBFS(startNode)}
              disabled={isAnimating || isEmpty}
              variant="primary"
            >
              BFS
            </Btn>
            <Btn
              onClick={() => !isAnimating && !isEmpty && runDFS(startNode)}
              disabled={isAnimating || isEmpty}
              variant="active"
            >
              DFS
            </Btn>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      {/* Add Node */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a78bde] uppercase tracking-[0.06em]">Modify Graph</label>
        <div className="space-y-1">
          <label className="text-xs text-[#6b4d8a]">Add Node</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={addNodeInput}
              onChange={e => setAddNodeInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && addNodeInput.trim() && !isAnimating) {
                  addNode(addNodeInput.trim())
                  setAddNodeInput('')
                }
              }}
              placeholder="label"
              disabled={isAnimating}
              className={cn(inputClass, 'flex-1 min-w-0')}
            />
            <Btn
              onClick={() => {
                if (addNodeInput.trim() && !isAnimating) {
                  addNode(addNodeInput.trim())
                  setAddNodeInput('')
                }
              }}
              disabled={!addNodeInput.trim() || isAnimating}
              variant="primary"
            >
              Add
            </Btn>
          </div>
        </div>

        {/* Add Edge */}
        <div className="space-y-1">
          <label className="text-xs text-[#6b4d8a]">Add Edge</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={fromNodeInput}
              onChange={e => setFromNodeInput(e.target.value)}
              placeholder="from"
              disabled={isAnimating}
              className={cn(inputClass, 'w-0 flex-1 min-w-0')}
            />
            <input
              type="text"
              value={toNodeInput}
              onChange={e => setToNodeInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && fromNodeInput.trim() && toNodeInput.trim() && !isAnimating) {
                  addEdge(fromNodeInput.trim(), toNodeInput.trim())
                  setFromNodeInput('')
                  setToNodeInput('')
                }
              }}
              placeholder="to"
              disabled={isAnimating}
              className={cn(inputClass, 'w-0 flex-1 min-w-0')}
            />
            <Btn
              onClick={() => {
                if (fromNodeInput.trim() && toNodeInput.trim() && !isAnimating) {
                  addEdge(fromNodeInput.trim(), toNodeInput.trim())
                  setFromNodeInput('')
                  setToNodeInput('')
                }
              }}
              disabled={!fromNodeInput.trim() || !toNodeInput.trim() || isAnimating}
              variant="primary"
            >
              Add
            </Btn>
          </div>
        </div>

        {/* Remove Node */}
        <div className="space-y-1">
          <label className="text-xs text-[#6b4d8a]">Remove Node</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={removeNodeInput}
              onChange={e => setRemoveNodeInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && removeNodeInput.trim() && !isAnimating) {
                  removeNode(removeNodeInput.trim())
                  setRemoveNodeInput('')
                }
              }}
              placeholder="label"
              disabled={isAnimating}
              className={cn(inputClass, 'flex-1 min-w-0')}
            />
            <Btn
              onClick={() => {
                if (removeNodeInput.trim() && !isAnimating) {
                  removeNode(removeNodeInput.trim())
                  setRemoveNodeInput('')
                }
              }}
              disabled={!removeNodeInput.trim() || isAnimating}
              variant="danger"
            >
              Remove
            </Btn>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a1f3d]" />

      {/* Reset / Clear */}
      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={() => !isAnimating && reset()} disabled={isAnimating} variant="neutral">
          Reset
        </Btn>
        <Btn onClick={() => !isAnimating && !isEmpty && clear()} disabled={isAnimating || isEmpty} variant="danger">
          Clear
        </Btn>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-[#6b4d8a]">Speed:</span>
        {(['slow', 'normal', 'fast'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={cn(
              'text-xs w-14 h-7 rounded capitalize transition-all duration-200 text-center',
              speed === s
                ? 'bg-[#744cae] text-white font-medium shadow-[0_0_12px_rgba(180,130,232,0.4)]'
                : 'text-[#6b4d8a] hover:text-[#a78bde]',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

interface BtnProps {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'danger' | 'active' | 'neutral'
  children: React.ReactNode
}

function Btn({ onClick, disabled, variant, children }: BtnProps) {
  const styles = {
    primary:
      'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white hover:shadow-[0_0_12px_rgba(180,130,232,0.4)]',
    active:
      'bg-[#9b6fd4]/15 hover:bg-[#9b6fd4] border-[#9b6fd4]/40 text-[#c9a0ff] hover:text-white hover:shadow-[0_0_12px_rgba(155,111,212,0.4)]',
    danger:
      'bg-[#ff6b8a]/10 hover:bg-[#ff6b8a] border-[#ff6b8a]/35 text-[#ff6b8a] hover:text-white hover:shadow-[0_0_12px_rgba(255,107,138,0.35)]',
    neutral:
      'bg-transparent hover:bg-[#1e1630] border-[#2a1f3d] hover:border-[#3d2d5a] text-[#6b4d8a] hover:text-[#a78bde]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-9 px-3 flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200 whitespace-nowrap',
        styles[variant],
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  )
}
