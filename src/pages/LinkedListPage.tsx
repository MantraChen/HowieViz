import { useState, useRef, useEffect } from 'react'
import { ChevronDown, PanelRight, X } from 'lucide-react'
import { LinkedListVisualizer } from '@/visualizers/LinkedListVisualizer'
import { LinkedListControls } from '@/components/LinkedListControls'
import { useLinkedListStore } from '@/store/linkedListStore'
import { cn } from '@/lib/utils'

type ModeKey = 'visualize' | 'manual' | 'quiz' | 'compare' | 'embed'

const PSEUDOCODE_LINES = [
  'function insertHead(val):',
  '  newNode.next = head',
  '  head = newNode',
  'function insertTail(val):',
  '  tail.next = newNode',
  '  tail = newNode',
  'function delete(val):',
  '  traverse to predecessor',
  '  prev.next = node.next',
  'function search(val):',
  '  cur = head',
  '  while cur != null:',
  '    if cur.val == val: return cur',
  '    cur = cur.next',
]

const COMPLEXITY_ROWS = [
  { op: 'Insert Head', time: 'O(1)' },
  { op: 'Insert Tail', time: 'O(1)' },
  { op: 'Delete',      time: 'O(n)' },
  { op: 'Search',      time: 'O(n)' },
]

function PseudocodePanel() {
  return (
    <div className="rounded-lg bg-[#090710] border border-[#2a1f3d] overflow-hidden">
      <div className="overflow-x-auto">
        {PSEUDOCODE_LINES.map((line, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-[3px] hover:bg-[#1a1428] transition-colors duration-150"
          >
            <span className="text-[10px] w-5 text-right flex-none select-none font-mono text-[#3d2d5a]">
              {idx + 1}
            </span>
            <span className="text-[11px] font-mono whitespace-pre text-[#a78bde]">
              {line}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepsPanel() {
  const steps = useLinkedListStore(s => s.steps)
  const clearSteps = useLinkedListStore(s => s.clearSteps)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [steps])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#3d2d5a] uppercase tracking-widest">
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>
        {steps.length > 0 && (
          <button onClick={clearSteps} className="text-[10px] text-[#6b4d8a] hover:text-[#a78bde] transition-colors">
            Clear
          </button>
        )}
      </div>
      {steps.length === 0 ? (
        <p className="text-xs text-[#3d2d5a] italic font-mono">No steps yet.</p>
      ) : (
        <div ref={containerRef} className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
          {steps.map((step, i) => {
            const isNewest = i === steps.length - 1
            return (
              <div key={i} className={cn('rounded px-2 py-1.5 text-[11px] font-mono leading-snug transition-colors', isNewest ? 'bg-[#b892e8]/10 border border-[#b892e8]/30' : 'bg-[#1a1428]')}>
                <span className="text-[#3d2d5a] text-[10px]">{step.time} </span>
                <span className="text-[#a78bde]">{step.text}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ComplexityPanel() {
  return (
    <div className="space-y-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#2a1f3d]">
            <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Operation</th>
            <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Time</th>
          </tr>
        </thead>
        <tbody>
          {COMPLEXITY_ROWS.map(({ op, time }) => (
            <tr key={op} className="border-b border-[#1e1630] last:border-0">
              <td className="py-2 text-[#e1d2e9]">{op}</td>
              <td className="py-2 text-right font-mono text-[#b892e8] font-semibold">{time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CollapsibleSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-[#2a1f3d] rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#e1d2e9] hover:bg-[#1a1428] transition-colors bg-[#0c0916]">
        <span>{title}</span>
        <ChevronDown className={cn('w-4 h-4 text-[#6b4d8a] transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 pt-3 bg-[#090710]">{children}</div>}
    </div>
  )
}

const MODES: { key: ModeKey; label: string; available: boolean }[] = [
  { key: 'visualize', label: 'Visualize', available: true },
  { key: 'manual',   label: 'Manual',    available: false },
  { key: 'quiz',     label: 'Quiz',      available: false },
  { key: 'compare',  label: 'Compare',   available: false },
  { key: 'embed',    label: 'Embed',     available: false },
]

function ModeSwitcher({ active, setActive }: { active: ModeKey; setActive: (m: ModeKey) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-[#1a1428] rounded-lg p-1">
      {MODES.map(mode => (
        <div key={mode.key} className="relative group">
          <button
            onClick={() => mode.available && setActive(mode.key)}
            className={cn(
              'px-3 h-7 rounded-md text-xs font-medium transition-all duration-150',
              mode.key === active ? 'bg-[#744cae] text-white'
                : mode.available ? 'text-[#6b4d8a] hover:text-[#a78bde]'
                : 'text-[#3d2d5a] cursor-default',
            )}
          >
            {mode.label}
          </button>
          {!mode.available && (
            <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <span className="bg-[#1e1630] border border-[#2a1f3d] text-[#a78bde] text-[10px] px-2 py-1 rounded-md shadow-lg block">Coming Soon</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function LinkedListPage() {
  const [pseudocodeOpen, setPseudocodeOpen] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [complexityOpen, setComplexityOpen] = useState(true)
  const [activeMode, setActiveMode] = useState<ModeKey>('visualize')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const statusText = useLinkedListStore(s => s.statusText)

  const rightPanelContent = (
    <div className="space-y-4 p-4">
      <LinkedListControls mode={activeMode} />
      <div className="border-t border-[#2a1f3d]" />
      <CollapsibleSection title="Complexity" open={complexityOpen} onToggle={() => setComplexityOpen(v => !v)}>
        <ComplexityPanel />
      </CollapsibleSection>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-[#090710]">
      <div className="flex-none flex items-center justify-between px-5 h-14 border-b border-[#2a1f3d] bg-[#0f0b17]">
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-bold text-[#f0eaf8] leading-tight">Linked List</h1>
          <p className="text-[11px] text-[#6b4d8a] leading-tight">Singly-linked nodes — O(1) insert at head, O(n) access</p>
        </div>
        <ModeSwitcher active={activeMode} setActive={setActiveMode} />
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-4">
          <LinkedListVisualizer />
          <CollapsibleSection title="Pseudocode" open={pseudocodeOpen} onToggle={() => setPseudocodeOpen(v => !v)}>
            <PseudocodePanel />
          </CollapsibleSection>
          <CollapsibleSection title="Steps" open={stepsOpen} onToggle={() => setStepsOpen(v => !v)}>
            <StepsPanel />
          </CollapsibleSection>
        </div>
        <div className="w-[260px] flex-none border-l border-[#2a1f3d] overflow-y-auto hidden md:block bg-[#0c0916]">
          {rightPanelContent}
        </div>
      </div>

      <div className="flex-none h-9 border-t border-[#2a1f3d] bg-[#0f0b17] px-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full flex-none bg-[#3d2d5a]" />
        <span className="text-[11px] text-[#e1d2e9] font-mono truncate">{statusText}</span>
      </div>

      <button className="md:hidden fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-[#744cae] shadow-lg flex items-center justify-center text-white hover:bg-[#8b5cc8] transition-colors" onClick={() => setDrawerOpen(true)} aria-label="Open panel">
        <PanelRight className="w-5 h-5" />
      </button>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-[#0c0916] border-t border-[#2a1f3d] rounded-t-2xl max-h-[78vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a1f3d] flex-none">
              <span className="text-sm font-medium text-[#e1d2e9]">Controls & Info</span>
              <button onClick={() => setDrawerOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-md text-[#6b4d8a] hover:text-[#a78bde] hover:bg-[#1a1428]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">{rightPanelContent}</div>
          </div>
        </div>
      )}
    </div>
  )
}
