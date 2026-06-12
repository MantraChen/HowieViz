import { motion } from 'framer-motion'
import { useCircularQueueStore, type CQHighlight } from '@/store/circularQueueStore'

const SLOT_STYLES: Record<CQHighlight, { bg: string; border: string; text: string }> = {
  empty:    { bg: '#0d0b14', border: '#1e1630', text: '#3d2d5a' },
  filled:   { bg: '#1c1530', border: '#744cae', text: '#f0eaf8' },
  inserted: { bg: '#c9a0ff', border: '#c9a0ff', text: '#1a0f2e' },
  deleted:  { bg: '#ff6b8a', border: '#ff6b8a', text: '#ffffff' },
}

const LEGEND_ITEMS: { key: CQHighlight; label: string }[] = [
  { key: 'empty',    label: 'Empty'    },
  { key: 'filled',   label: 'Filled'   },
  { key: 'inserted', label: 'Inserted' },
  { key: 'deleted',  label: 'Deleted'  },
]

export function CircularQueueVisualizer() {
  const { slots, front, rear, size, capacity } = useCircularQueueStore()

  const isFull  = size === capacity
  const isEmpty = size === 0

  const W = 300, H = 300
  const cx = W / 2, cy = H / 2
  const slotSize = capacity <= 6 ? 46 : capacity <= 9 ? 42 : 38
  const radius   = 105

  const slotAngle  = (i: number) => (i / capacity) * 2 * Math.PI - Math.PI / 2
  const slotCenter = (i: number) => ({
    x: cx + radius * Math.cos(slotAngle(i)),
    y: cy + radius * Math.sin(slotAngle(i)),
  })

  const arrowEnd = (i: number) => {
    const a = slotAngle(i)
    return {
      x1: cx + 20 * Math.cos(a),
      y1: cy + 20 * Math.sin(a),
      x2: cx + (radius - slotSize / 2 - 5) * Math.cos(a),
      y2: cy + (radius - slotSize / 2 - 5) * Math.sin(a),
    }
  }

  const labelPos = (i: number) => {
    const a = slotAngle(i)
    const r = radius + slotSize / 2 + 12
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  // Last inserted element = (rear-1+capacity)%capacity when not empty
  const rearElemIdx = isEmpty ? -1 : (rear - 1 + capacity) % capacity

  return (
    <div className="flex flex-col items-center gap-5">
      <div style={{ position: 'relative', width: W, height: H }}>
        {/* SVG layer: dashed circle, arrows, labels, center text */}
        <svg
          width={W}
          height={H}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
        >
          <defs>
            <marker id="cq-f" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 1 L7 4 L0 7 z" fill="#c9a0ff" />
            </marker>
            <marker id="cq-r" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 1 L7 4 L0 7 z" fill="#9b6fd4" />
            </marker>
          </defs>

          {/* Guide circle */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none" stroke="#2a1f3d" strokeWidth={1} strokeDasharray="4 4"
          />

          {/* Front pointer */}
          {!isEmpty && (() => {
            const { x1, y1, x2, y2 } = arrowEnd(front)
            const { x: lx, y: ly } = labelPos(front)
            return (
              <>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a0ff" strokeWidth={2} markerEnd="url(#cq-f)" />
                <text x={lx} y={ly + 4} textAnchor="middle" fill="#c9a0ff" fontSize={8}
                  fontFamily="system-ui" fontWeight="700" letterSpacing="0.1em">
                  FRONT
                </text>
              </>
            )
          })()}

          {/* Rear pointer (last filled slot) */}
          {!isEmpty && rearElemIdx !== front && (() => {
            const { x1, y1, x2, y2 } = arrowEnd(rearElemIdx)
            const { x: lx, y: ly } = labelPos(rearElemIdx)
            return (
              <>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9b6fd4" strokeWidth={1.5}
                  strokeDasharray="4 3" markerEnd="url(#cq-r)" />
                <text x={lx} y={ly + 4} textAnchor="middle" fill="#9b6fd4" fontSize={8}
                  fontFamily="system-ui" fontWeight="700" letterSpacing="0.1em">
                  REAR
                </text>
              </>
            )
          })()}

          {/* Center label */}
          {isEmpty && (
            <text x={cx} y={cy + 5} textAnchor="middle" fill="#3d2d5a" fontSize={12}
              fontFamily="monospace" fontWeight="bold">
              EMPTY
            </text>
          )}
          {isFull && (
            <text x={cx} y={cy + 5} textAnchor="middle" fill="#ff6b8a" fontSize={13}
              fontFamily="monospace" fontWeight="bold">
              FULL
            </text>
          )}
          {!isEmpty && !isFull && (
            <>
              <text x={cx} y={cy + 3} textAnchor="middle" fill="#c9a0ff" fontSize={14}
                fontFamily="monospace" fontWeight="bold">
                {size}/{capacity}
              </text>
              <text x={cx} y={cy + 16} textAnchor="middle" fill="#3d2d5a" fontSize={9}
                fontFamily="monospace">
                slots
              </text>
            </>
          )}
        </svg>

        {/* Slots */}
        {slots.map((slot, i) => {
          const { x, y } = slotCenter(i)
          const style = SLOT_STYLES[slot.highlight]

          return (
            <motion.div
              key={slot.id}
              style={{
                position: 'absolute',
                left: x - slotSize / 2,
                top: y - slotSize / 2,
                width: slotSize,
                height: slotSize,
                backgroundColor: style.bg,
                borderColor: style.border,
                color: style.text,
                borderWidth: 2,
                borderStyle: 'solid',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: slotSize < 42 ? 11 : 13,
                transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
              }}
              animate={
                slot.highlight === 'inserted'
                  ? { scale: [1, 1.22, 1] }
                  : slot.highlight === 'deleted'
                    ? { scale: [1, 1.1, 0.85], opacity: [1, 1, 0.5] }
                    : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.45 }}
            >
              {slot.value !== null ? slot.value : ''}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {LEGEND_ITEMS.map(({ key, label }) => {
          const s = SLOT_STYLES[key]
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm border-2"
                style={{ background: s.bg, borderColor: s.border }}
              />
              <span className="text-xs text-[#6b4d8a]">{label}</span>
            </div>
          )
        })}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] bg-[#c9a0ff]" />
          <span className="text-xs text-[#6b4d8a]">Front ptr</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] bg-[#9b6fd4]" style={{ borderTop: '2px dashed #9b6fd4', background: 'none' }} />
          <span className="text-xs text-[#6b4d8a]">Rear ptr</span>
        </div>
      </div>
    </div>
  )
}
