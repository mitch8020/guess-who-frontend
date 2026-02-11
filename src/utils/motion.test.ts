import { describe, expect, it } from 'vitest'
import { getStaggerDelay, getStaggerDelayMs, getStaggerStyle, motionClassNames } from '@/utils/motion'

describe('motion utilities', () => {
  it('returns zero delay for non-positive indexes', () => {
    expect(getStaggerDelayMs(-1)).toBe(0)
    expect(getStaggerDelayMs(0)).toBe(0)
  })

  it('applies step and max caps for stagger delays', () => {
    expect(getStaggerDelayMs(3, 40, 500)).toBe(120)
    expect(getStaggerDelayMs(20, 40, 500)).toBe(500)
  })

  it('formats delay values and style objects for CSS vars', () => {
    expect(getStaggerDelay(2, 35, 200)).toBe('70ms')
    expect(getStaggerStyle(2, 35, 200)).toEqual({ '--motion-delay': '70ms' })
  })

  it('exposes shared class name tokens', () => {
    expect(motionClassNames.pageEntry).toBe('motion-page-entry')
    expect(motionClassNames.sectionEntry).toBe('motion-section-entry')
    expect(motionClassNames.listItemEntry).toBe('motion-list-item-entry')
    expect(motionClassNames.fadeIn).toBe('motion-fade-in')
  })
})
