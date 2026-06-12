import { motion } from 'framer-motion'
import type { RSStep, RSHighlight, RSElement } from '@/store/radixSortStore'

const FILL: Record<RSHighlight, string> = {
  default:   '#1c1530',
  active:    '#9b6fd4',
  'in-bucket': '#2a1f3d',
  sorted:    '#c9a0ff',
}
const BORDER: Record<RSHighlight, string> = {
  default:   '#744cae',
  active:    '#d4a8ff',
  'in-bucket': '#3d2d5a',
  sorted:    '#e8d5ff',
}
const TEXT: Record<RSHighlight, string> = {
  default:   '#a78bde',
  active:    '#ffffff',
  'in-bucket': '#6b4d8a',
  sorted:    '#1a0f2e',
}

function highlightDigit(value: number, digitPos: number): { pre: string; digit: string; post: string } {
  const s = String(value)
  // digitPos 0 = units (rightmost), 1 = tens, etc.
  const idx = s.length - 1 - digitPos
  if (idx < 0 || idx >= s.length) return { pre: s, digit: '', post: '' }
  return {
    pre:   s.slice(0, idx),
    digit: s[idx],
    post:  s.slice(idx + 1),
  }
}

function ArrayCell({ el }: { el: RSElement }) {
  const { pre, digit, post } = highlightDigit(el.value, Math.round(el.digitPos))
  const showDigitHighlight = el.digitPos >= 0 && el.highlight !== 'in-bucket'

  return (
    <motion.div
      className="flex items-center justify-center rounded border-2 font-mono font-semibold flex-shrink-0"
      style={{ width: 40, height: 32, fontSize: 12 }}
      animate={{
        backgroundColor: FILL[el.highlight],
        borderColor: BORDER[el.highlight],
        color: TEXT[el.highlight],
      }}
      transition={{ duration: 0.15 }}
    >
      {showDigitHighlight && digit ? (
        <span>
          <span style={{ opacity: 0.5 }}>{pre}</span>
          <span style={{ color: '#f0eaf8', fontWeight: 800 }}>{digit}</span>
          <span style={{ opacity: 0.5 }}>{post}</span>
        </span>
      ) : (
        el.value
      )}
    </motion.div>
  )
}

interface Props { step: RSStep; description: string }

export function RadixSortVisualizer({ step, description }: Props) {
  const { array, buckets, phase, passNumber, digitPlace } = step

  const placeLabel = (p: number) => {
    if (p === 1) return '1s'
    if (p === 10) return '10s'
    if (p === 100) return '100s'
    return `${p}s`
  }

  const maxBucketSize = Math.max(...buckets.map(b => b.length), 1)

  return (
    <div className="flex flex-col gap-4">
      {/* Pass counter */}
      {passNumber > 0 && (
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#9b6fd4]/20 text-[#c9a0ff] border border-[#9b6fd4]/30">
            Pass {passNumber}: sorting by {placeLabel(digitPlace)} digit
          </div>
          {phase === 'done' && (
            <div className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#c9a0ff]/20 text-[#e8d5ff] border border-[#c9a0ff]/30">
              Sorted ✓
            </div>
          )}
        </div>
      )}

      {/* Current array */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-3">
        <p className="text-[9px] text-[#6b4d8a] uppercase tracking-widest mb-2 font-medium">Current Array</p>
        <div className="flex gap-[3px] flex-wrap">
          {array.map((el, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <ArrayCell el={el} />
              <span className="text-[8px] font-mono text-[#3d2d5a]">{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buckets */}
      <div className="rounded-xl border border-[#2a1f3d] bg-[#090710] p-3">
        <p className="text-[9px] text-[#6b4d8a] uppercase tracking-widest mb-2 font-medium">Buckets</p>
        <div className="flex gap-[3px]">
          {buckets.map((bucket, digit) => (
            <div key={digit} className="flex flex-col flex-1 min-w-0">
              {/* Digit header */}
              <div className="flex items-center justify-center h-6 rounded-t border border-b-0 border-[#2a1f3d] bg-[#1a1428]">
                <span className="text-[10px] font-mono font-bold text-[#9b6fd4]">{digit}</span>
              </div>

              {/* Slots */}
              <div
                className="border border-[#2a1f3d] rounded-b"
                style={{ minHeight: Math.max(maxBucketSize, 1) * 26 + 8 }}
              >
                {bucket.map((val, j) => (
                  <motion.div
                    key={`${digit}-${j}-${val}`}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center font-mono font-semibold rounded-sm m-[2px]"
                    style={{
                      height: 22,
                      fontSize: 10,
                      backgroundColor: '#2a1f3d',
                      border: '1px solid #3d2d5a',
                      color: '#c9a0ff',
                    }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step description */}
      <div className="rounded-lg border border-[#2a1f3d] bg-[#090710] px-4 py-2.5 min-h-[36px]">
        <span className="text-xs font-mono text-[#c9a0ff]">
          {description || <span className="text-[#3d2d5a]">Press Sort to begin</span>}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {(
          [
            { key: 'default',   label: 'Default'    },
            { key: 'active',    label: 'Distributing' },
            { key: 'in-bucket', label: 'In Bucket'  },
            { key: 'sorted',    label: 'Sorted'     },
          ] as { key: RSHighlight; label: string }[]
        ).map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-[2px] border-2"
              style={{ background: FILL[key], borderColor: BORDER[key] }}
            />
            <span className="text-xs text-[#6b4d8a]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
