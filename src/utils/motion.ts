import type { CSSProperties } from 'react'

const DEFAULT_STAGGER_STEP_MS = 45
const DEFAULT_STAGGER_MAX_MS = 360

export const motionClassNames = {
  pageEntry: 'motion-page-entry',
  sectionEntry: 'motion-section-entry',
  listItemEntry: 'motion-list-item-entry',
  fadeIn: 'motion-fade-in',
} as const

export const shellMotionClassNames = {
  header: motionClassNames.fadeIn,
  headerLink: motionClassNames.fadeIn,
} as const

export function getStaggerDelayMs(
  index: number,
  stepMs: number = DEFAULT_STAGGER_STEP_MS,
  maxMs: number = DEFAULT_STAGGER_MAX_MS,
): number {
  if (!Number.isFinite(index) || index <= 0) {
    return 0
  }
  return Math.min(Math.floor(index) * stepMs, maxMs)
}

export function getStaggerDelay(
  index: number,
  stepMs: number = DEFAULT_STAGGER_STEP_MS,
  maxMs: number = DEFAULT_STAGGER_MAX_MS,
): string {
  return `${getStaggerDelayMs(index, stepMs, maxMs)}ms`
}

export function getStaggerStyle(
  index: number,
  stepMs: number = DEFAULT_STAGGER_STEP_MS,
  maxMs: number = DEFAULT_STAGGER_MAX_MS,
): CSSProperties {
  return {
    '--motion-delay': getStaggerDelay(index, stepMs, maxMs),
  } as CSSProperties
}
