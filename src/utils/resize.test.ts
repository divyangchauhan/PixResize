import { describe, it, expect } from 'vitest'
import { computeOutputDimensions } from './resize'
import type { ResizeSettings } from '@/types'

const base: ResizeSettings = {
  enabled: false,
  mode: 'pixels',
  width: '',
  height: '',
  percent: '100',
  preset: '',
  lockAspect: true,
  fitMode: 'contain',
}

describe('computeOutputDimensions', () => {
  it('returns original dimensions when resize is disabled', () => {
    const result = computeOutputDimensions({ ...base, enabled: false }, 800, 600)
    expect(result).toEqual({ w: 800, h: 600 })
  })

  it('pixels mode: returns specified width and height', () => {
    const result = computeOutputDimensions(
      { ...base, enabled: true, mode: 'pixels', width: '400', height: '300' },
      800,
      600,
    )
    expect(result).toEqual({ w: 400, h: 300 })
  })

  it('pixels mode: falls back to original dimension on empty/invalid value', () => {
    const result = computeOutputDimensions(
      { ...base, enabled: true, mode: 'pixels', width: '', height: '' },
      800,
      600,
    )
    expect(result).toEqual({ w: 800, h: 600 })
  })

  it('percent mode: scales proportionally', () => {
    const result = computeOutputDimensions(
      { ...base, enabled: true, mode: 'percent', percent: '50' },
      800,
      600,
    )
    expect(result).toEqual({ w: 400, h: 300 })
  })

  it('percent mode: 200% doubles dimensions', () => {
    const result = computeOutputDimensions(
      { ...base, enabled: true, mode: 'percent', percent: '200' },
      1000,
      500,
    )
    expect(result).toEqual({ w: 2000, h: 1000 })
  })

  it('percent mode: rounds fractional pixels', () => {
    // 800 * 0.333 = 266.4 → 266
    const result = computeOutputDimensions(
      { ...base, enabled: true, mode: 'percent', percent: '33.3' },
      800,
      600,
    )
    expect(result.w).toBe(Math.round(800 * 0.333))
    expect(result.h).toBe(Math.round(600 * 0.333))
  })

  it('preset mode behaves the same as pixels mode', () => {
    const result = computeOutputDimensions(
      { ...base, enabled: true, mode: 'preset', width: 1920, height: 1080 },
      800,
      600,
    )
    expect(result).toEqual({ w: 1920, h: 1080 })
  })

  it('handles numeric width/height values (not just strings)', () => {
    const result = computeOutputDimensions(
      { ...base, enabled: true, mode: 'pixels', width: 640, height: 480 },
      800,
      600,
    )
    expect(result).toEqual({ w: 640, h: 480 })
  })
})
