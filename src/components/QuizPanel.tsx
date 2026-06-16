import { useState } from 'react'
import type { QuizQuestion } from '@/types'
import { cn } from '@/lib/utils'

interface QuizPanelProps {
  questions: QuizQuestion[]
  onComplete?: () => void
}

const DIFFICULTY_COLORS = {
  easy:   'bg-emerald-900/40 text-emerald-400 border-emerald-800',
  medium: 'bg-amber-900/40 text-amber-400 border-amber-800',
  hard:   'bg-rose-900/40 text-rose-400 border-rose-800',
}

function ScoreMessage(score: number, total: number): string {
  const pct = score / total
  if (pct === 1) return 'Perfect!'
  if (pct >= 0.8) return 'Great job!'
  if (pct >= 0.6) return 'Good effort!'
  return 'Keep practicing!'
}

export function QuizPanel({ questions, onComplete }: QuizPanelProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [fillValue, setFillValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const [breakdown, setBreakdown] = useState({ easy: [0, 0], medium: [0, 0], hard: [0, 0] })

  const q = questions[current]
  const total = questions.length

  function normalise(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  function checkAnswer(choice: string) {
    if (answered) return
    const correct = normalise(q.correct) === normalise(choice)
    setSelected(choice)
    setAnswered(true)
    if (correct) {
      setScore(s => s + 1)
      setStreak(s => s + 1)
      setBreakdown(b => ({ ...b, [q.difficulty]: [b[q.difficulty][0] + 1, b[q.difficulty][1] + 1] }))
    } else {
      setStreak(0)
      setBreakdown(b => ({ ...b, [q.difficulty]: [b[q.difficulty][0], b[q.difficulty][1] + 1] }))
    }
  }

  function handleFillSubmit() {
    if (!fillValue.trim()) return
    checkAnswer(fillValue)
  }

  function next() {
    if (current + 1 >= total) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setFillValue('')
      setAnswered(false)
    }
  }

  function restart() {
    setCurrent(0)
    setSelected(null)
    setFillValue('')
    setAnswered(false)
    setScore(0)
    setStreak(0)
    setFinished(false)
    setBreakdown({ easy: [0, 0], medium: [0, 0], hard: [0, 0] })
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    return (
      <div className="p-5 space-y-5">
        <div className="text-center space-y-1">
          <div className="text-3xl font-bold text-[#d4a8ff]">{score} / {total}</div>
          <div className="text-lg font-semibold text-[#e1d2e9]">{ScoreMessage(score, total)}</div>
          <div className="text-sm text-[#6b4d8a]">{pct}% correct</div>
        </div>

        <div className="space-y-2">
          {(['easy', 'medium', 'hard'] as const).map(d => {
            const [got, tried] = breakdown[d]
            if (tried === 0) return null
            return (
              <div key={d} className="flex items-center justify-between text-xs">
                <span className={cn('px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-wide', DIFFICULTY_COLORS[d])}>{d}</span>
                <span className="text-[#a78bde] font-mono">{got}/{tried}</span>
                <div className="flex-1 mx-3 h-1.5 bg-[#1a1428] rounded-full overflow-hidden">
                  <div className="h-full bg-[#744cae] rounded-full" style={{ width: tried ? `${(got/tried)*100}%` : '0%' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={restart}
            className="flex-1 h-9 rounded-lg bg-[#744cae] text-white text-sm font-medium hover:bg-[#8b5cc8] transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onComplete}
            className="flex-1 h-9 rounded-lg border border-[#2a1f3d] text-[#a78bde] text-sm font-medium hover:bg-[#1a1428] transition-colors"
          >
            Back to Visualize
          </button>
        </div>
      </div>
    )
  }

  const isCorrect = answered && normalise(selected ?? '') === normalise(q.correct)

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="space-y-2 flex-none">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-[#6b4d8a] font-mono">Question {current + 1} / {total}</span>
          <span className={cn('px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-wide', DIFFICULTY_COLORS[q.difficulty])}>{q.difficulty}</span>
          <span className="text-[10px] text-[#6b4d8a] font-mono">{score} correct{streak >= 2 ? ` · 🔥 ${streak}` : ''}</span>
        </div>
        <div className="h-1 bg-[#1a1428] rounded-full overflow-hidden">
          <div className="h-full bg-[#744cae] rounded-full transition-all duration-300" style={{ width: `${(current / total) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-[#e1d2e9] leading-snug flex-none">{q.question}</p>

      {/* Answer area */}
      <div className="flex-1 space-y-2">
        {q.type === 'multiple_choice' && q.options && (
          <div className="grid grid-cols-2 gap-2">
            {q.options.map(opt => {
              const isSelected = selected === opt
              const isRight = normalise(opt) === normalise(q.correct)
              let cls = 'border border-[#2a1f3d] text-[#a78bde] hover:bg-[#1a1428]'
              if (answered) {
                if (isRight) cls = 'border border-[#c9a0ff] bg-[#c9a0ff]/10 text-[#c9a0ff]'
                else if (isSelected && !isRight) cls = 'border border-[#ff6b8a] bg-[#ff6b8a]/10 text-[#ff6b8a]'
                else cls = 'border border-[#1e1630] text-[#3d2d5a]'
              }
              return (
                <button
                  key={opt}
                  onClick={() => checkAnswer(opt)}
                  disabled={answered}
                  className={cn('rounded-lg p-2.5 text-xs text-left transition-colors duration-150 leading-snug', cls)}
                >
                  {isSelected && answered && (isRight ? '✓ ' : '✗ ')}{opt}
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'true_false' && (
          <div className="grid grid-cols-2 gap-2">
            {['True', 'False'].map(opt => {
              const isSelected = selected === opt
              const isRight = normalise(opt) === normalise(q.correct)
              let cls = 'border border-[#2a1f3d] text-[#a78bde] hover:bg-[#1a1428]'
              if (answered) {
                if (isRight) cls = 'border border-[#c9a0ff] bg-[#c9a0ff]/10 text-[#c9a0ff]'
                else if (isSelected && !isRight) cls = 'border border-[#ff6b8a] bg-[#ff6b8a]/10 text-[#ff6b8a]'
                else cls = 'border border-[#1e1630] text-[#3d2d5a]'
              }
              return (
                <button
                  key={opt}
                  onClick={() => checkAnswer(opt)}
                  disabled={answered}
                  className={cn('rounded-lg py-4 text-sm font-medium transition-colors duration-150', cls)}
                >
                  {isSelected && answered && (isRight ? '✓ ' : '✗ ')}{opt}
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'fill_in' && (
          <div className="space-y-2">
            <input
              type="text"
              value={fillValue}
              onChange={e => setFillValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !answered && handleFillSubmit()}
              disabled={answered}
              placeholder="Type your answer…"
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-sm bg-[#090710] outline-none transition-colors',
                answered
                  ? isCorrect
                    ? 'border-[#c9a0ff] text-[#c9a0ff]'
                    : 'border-[#ff6b8a] text-[#ff6b8a]'
                  : 'border-[#2a1f3d] text-[#e1d2e9] focus:border-[#744cae]',
              )}
            />
            {!answered && (
              <button
                onClick={handleFillSubmit}
                className="w-full h-9 rounded-lg bg-[#744cae] text-white text-sm font-medium hover:bg-[#8b5cc8] transition-colors"
              >
                Submit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {answered && (
        <div className={cn('rounded-lg p-3 text-xs leading-relaxed flex-none', isCorrect ? 'bg-[#c9a0ff]/8 border border-[#c9a0ff]/30 text-[#d4a8ff]' : 'bg-[#ff6b8a]/8 border border-[#ff6b8a]/30 text-[#ff8fa3]')}>
          {!isCorrect && q.type !== 'fill_in' && (
            <div className="font-semibold mb-1">Correct: {q.correct}</div>
          )}
          {!isCorrect && q.type === 'fill_in' && (
            <div className="font-semibold mb-1">Correct answer: {q.correct}</div>
          )}
          {q.explanation}
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button
          onClick={next}
          className="w-full h-9 rounded-lg bg-[#744cae] text-white text-sm font-medium hover:bg-[#8b5cc8] transition-colors flex-none"
        >
          {current + 1 >= total ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  )
}
