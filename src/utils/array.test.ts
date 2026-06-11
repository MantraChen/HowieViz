import { describe, it, expect } from 'vitest'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

describe('array utilities', () => {
  it('clamps insert index within bounds', () => {
    expect(clamp(-1, 0, 5)).toBe(0)
    expect(clamp(10, 0, 5)).toBe(5)
    expect(clamp(3, 0, 5)).toBe(3)
  })
})
