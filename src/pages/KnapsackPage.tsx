import { useState, useRef, useEffect } from 'react'
import { ChevronDown, PanelRight, X } from 'lucide-react'
import { KnapsackVisualizer } from '@/visualizers/KnapsackVisualizer'
import { KnapsackControls } from '@/components/KnapsackControls'
import { useKnapsackStore } from '@/store/knapsackStore'
import { cn } from '@/lib/utils'

// ─── Pseudocode ──────────────────────────────────────────────────────────────

const PSEUDOCODE_LINES = [
  'function knapsack(items, W):',
  '  dp = array[n+1][W+1] filled with 0',
  '  for i = 1 to n:',
  '    for w = 1 to W:',
  '      if items[i].weight > w:',
  '        dp[i][w] = dp[i-1][w]',
  '      else:',
  '        dp[i][w] = max(dp[i-1][w],',
  '                   dp[i-1][w-wi] + vi)',
  '  return dp[n][W]',
  '  // Backtrack for selected items',
  '  i = n, w = W',
  '  while i > 0 and w > 0:',
  '    if dp[i][w] != dp[i-1][w]:',
  '      select item i',
  '      w -= items[i].weight',
]

function PseudocodePanel() {
  const currentLine = useKnapsackStore(s => s.currentSnap?.currentLine ?? 0)
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentLine])

  return (
    <div className="rounded-lg bg-[#090710] border border-[#2a1f3d] overflow-hidden">
      <div className="overflow-x-auto">
        {PSEUDOCODE_LINES.map((line, idx) => {
          const lineNum = idx + 1
          const isActive = lineNum === currentLine
          return (
            <div
              key={idx}
              ref={isActive ? activeRef : undefined}
              className={cn(
                'flex items-center gap-2 px-3 py-[3px] transition-colors duration-150',
                isActive ? 'bg-[#744cae]' : 'hover:bg-[#1a1428]',
              )}
            >
              <span
                className={cn(
                  'text-[10px] w-5 text-right flex-none select-none font-mono',
                  isActive ? 'text-[#e9d5ff]' : 'text-[#3d2d5a]',
                )}
              >
                {lineNum}
              </span>
              <span
                className={cn(
                  'text-[11px] font-mono whitespace-pre',
                  isActive ? 'text-white font-semibold' : 'text-[#a78bde]',
                )}
              >
                {line}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Steps log ───────────────────────────────────────────────────────────────

function StepsPanel() {
  const steps = useKnapsackStore(s => s.steps)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps])

  if (steps.length === 0) {
    return (
      <p className="text-xs text-[#3d2d5a] italic font-mono">
        No steps yet — press Solve.
      </p>
    )
  }

  const stepColors = ['text-[#744cae]', 'text-[#744cae]', 'text-[#7a52b8]', 'text-[#a78bde]', 'text-[#b892e8]']

  return (
    <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
      {steps.map((step, i) => {
        const age = steps.length - 1 - i
        const colorClass = stepColors[Math.min(age, stepColors.length - 1)]
        const isNewest = age === 0
        return (
          <div
            key={i}
            className={cn(
              'rounded px-2 py-1.5 text-[11px] font-mono leading-snug transition-colors',
              isNewest ? 'bg-[#b892e8]/10 border border-[#b892e8]/30' : 'bg-[#1a1428]',
            )}
          >
            <span className="text-[#3d2d5a] text-[10px]">{step.time} </span>
            <span className={colorClass}>{step.text}</span>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

// ─── Complexity + Benchmark ───────────────────────────────────────────────────

function ComplexityPanel() {
  const { benchmarkData, isBenchmarking, runBenchmark } = useKnapsackStore()
  const maxTime = benchmarkData ? Math.max(...benchmarkData.map(d => d.timeMs), 0.001) : 1

  return (
    <div className="space-y-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#2a1f3d]">
            <th className="text-left pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Metric</th>
            <th className="text-right pb-2 text-[#6b4d8a] font-medium uppercase tracking-[0.06em]">Bound</th>
          </tr>
        </thead>
        <tbody>
          {[{ op: 'Time', val: 'O(n × W)' }, { op: 'Space', val: 'O(n × W)' }].map(({ op, val }) => (
            <tr key={op} className="border-b border-[#1e1630] last:border-0">
              <td className="py-2 text-[#e1d2e9]">{op}</td>
              <td className="py-2 text-right font-mono text-[#b892e8] font-semibold">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[#6b4d8a]">n = items, W = capacity</p>

      <button
        onClick={runBenchmark}
        disabled={isBenchmarking}
        className={cn(
          'w-full h-8 rounded-md border text-xs font-medium transition-all duration-200',
          'bg-[#744cae]/20 hover:bg-[#744cae] border-[#744cae]/50 text-[#d4a8ff] hover:text-white',
          isBenchmarking && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
      >
        {isBenchmarking ? 'Running…' : 'Run Benchmark'}
      </button>

      {benchmarkData && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] text-[#3d2d5a] uppercase tracking-widest">W=100, randomized items</p>
          {benchmarkData.map(({ n, timeMs }) => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-[11px] text-[#6b4d8a] w-8 font-mono flex-none">n={n}</span>
              <div className="flex-1 h-3.5 bg-[#1a1428] rounded-sm overflow-hidden">
                <div
                  className="h-full bg-[#744cae] rounded-sm transition-all duration-500"
                  style={{ width: `${Math.max(3, (timeMs / maxTime) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-[#b892e8] w-16 text-right font-mono flex-none">
                {timeMs < 0.001 ? '<0.001' : timeMs.toFixed(3)}ms
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Accordion section ────────────────────────────────────────────────────────

type SectionKey = 'controls' | 'pseudocode' | 'steps' | 'complexity'

function AccordionSection({
  title, sectionKey, openSections, toggle, children,
}: {
  title: string
  sectionKey: SectionKey
  openSections: Set<SectionKey>
  toggle: (k: SectionKey) => void
  children: React.ReactNode
}) {
  const isOpen = openSections.has(sectionKey)
  return (
    <div className="border-b border-[#2a1f3d]">
      <button
        onClick={() => toggle(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#e1d2e9] hover:bg-[#1a1428] transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#6b4d8a] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

// ─── Mode switcher ────────────────────────────────────────────────────────────

const MODES = [
  { key: 'visualize', label: 'Visualize', available: true },
  { key: 'quiz', label: 'Quiz', available: false },
  { key: 'compare', label: 'Compare', available: false },
  { key: 'embed', label: 'Embed', available: false },
] as const

type ModeKey = (typeof MODES)[number]['key']

function ModeSwitcher({ active, setActive }: { active: ModeKey; setActive: (m: ModeKey) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-[#1a1428] rounded-lg p-1">
      {MODES.map(mode => (
        <div key={mode.key} className="relative group">
          <button
            onClick={() => mode.available && setActive(mode.key)}
            className={cn(
              'px-3 h-7 rounded-md text-xs font-medium transition-all duration-150',
              mode.key === active
                ? 'bg-[#744cae] text-white'
                : mode.available
                  ? 'text-[#6b4d8a] hover:text-[#a78bde]'
                  : 'text-[#3d2d5a] cursor-default',
            )}
          >
            {mode.label}
          </button>
          {!mode.available && (
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex whitespace-nowrap">
              <span className="bg-[#1e1630] border border-[#2a1f3d] text-[#a78bde] text-[10px] px-2 py-1 rounded-md shadow-lg">
                Coming Soon
              </span>
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#2a1f3d]" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function KnapsackPage() {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['controls']))
  const [activeMode, setActiveMode] = useState<ModeKey>('visualize')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const statusText = useKnapsackStore(s => s.statusText)
  const isAnimating = useKnapsackStore(s => s.isAnimating)

  const toggleSection = (key: SectionKey) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const sidebarContent = (
    <>
      <AccordionSection title="Controls" sectionKey="controls" openSections={openSections} toggle={toggleSection}>
        <KnapsackControls />
      </AccordionSection>
      <AccordionSection title="Pseudocode" sectionKey="pseudocode" openSections={openSections} toggle={toggleSection}>
        <PseudocodePanel />
      </AccordionSection>
      <AccordionSection title="Steps" sectionKey="steps" openSections={openSections} toggle={toggleSection}>
        <StepsPanel />
      </AccordionSection>
      <AccordionSection title="Complexity" sectionKey="complexity" openSections={openSections} toggle={toggleSection}>
        <ComplexityPanel />
      </AccordionSection>
    </>
  )

  return (
    <div className="h-full flex flex-col bg-[#090710]">

      {/* ── Top bar ── */}
      <div className="flex-none flex items-center justify-between px-5 h-14 border-b border-[#2a1f3d] bg-[#0f0b17]">
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-bold text-[#f0eaf8] leading-tight">0/1 Knapsack</h1>
          <p className="text-[11px] text-[#6b4d8a] leading-tight">Dynamic programming</p>
        </div>
        <ModeSwitcher active={activeMode} setActive={setActiveMode} />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Visualization panel */}
        <div className="flex-1 min-w-0 overflow-y-auto p-5">
          <KnapsackVisualizer />
        </div>

        {/* Right sidebar — desktop only */}
        <div className="w-[280px] flex-none border-l border-[#2a1f3d] overflow-y-auto hidden md:block bg-[#0c0916]">
          {sidebarContent}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex-none h-9 border-t border-[#2a1f3d] bg-[#0f0b17] px-4 flex items-center gap-2">
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-none',
            isAnimating ? 'bg-[#b892e8] animate-pulse' : 'bg-[#3d2d5a]',
          )}
        />
        <span className="text-[11px] text-[#e1d2e9] font-mono truncate">{statusText}</span>
      </div>

      {/* ── Mobile FAB ── */}
      <button
        className="md:hidden fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-[#744cae] shadow-lg flex items-center justify-center text-white hover:bg-[#8b5cc8] transition-colors"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open panel"
      >
        <PanelRight className="w-5 h-5" />
      </button>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-[#0c0916] border-t border-[#2a1f3d] rounded-t-2xl max-h-[78vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a1f3d] flex-none">
              <span className="text-sm font-medium text-[#e1d2e9]">Controls & Info</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#6b4d8a] hover:text-[#a78bde] hover:bg-[#1a1428]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
