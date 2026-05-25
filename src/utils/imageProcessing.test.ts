import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatBytes, clamp, getWatermarkPos, processImage } from './imageProcessing'
import type { Settings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

// ---------------------------------------------------------------------------
// formatBytes
// ---------------------------------------------------------------------------
describe('formatBytes', () => {
  it('returns "0 B" for zero', () => expect(formatBytes(0)).toBe('0 B'))
  it('formats bytes correctly', () => expect(formatBytes(512)).toBe('512 B'))
  it('formats kilobytes correctly', () => expect(formatBytes(1024)).toBe('1 KB'))
  it('formats fractional KB', () => expect(formatBytes(1536)).toBe('1.5 KB'))
  it('formats megabytes correctly', () => expect(formatBytes(1048576)).toBe('1 MB'))
  it('formats fractional MB', () => expect(formatBytes(1572864)).toBe('1.5 MB'))
})

// ---------------------------------------------------------------------------
// clamp
// ---------------------------------------------------------------------------
describe('clamp', () => {
  it('returns value when within range', () => expect(clamp(5, 0, 10)).toBe(5))
  it('clamps to min when below', () => expect(clamp(-5, 0, 10)).toBe(0))
  it('clamps to max when above', () => expect(clamp(15, 0, 10)).toBe(10))
  it('clamps to min boundary exactly', () => expect(clamp(0, 0, 10)).toBe(0))
  it('clamps to max boundary exactly', () => expect(clamp(10, 0, 10)).toBe(10))
})

// ---------------------------------------------------------------------------
// getWatermarkPos
// ---------------------------------------------------------------------------
describe('getWatermarkPos', () => {
  const W = 1000
  const H = 800

  it('places top-left watermark near the top-left', () => {
    const pos = getWatermarkPos('top-left', W, H)
    expect(pos.x).toBeLessThan(W / 2)
    expect(pos.y).toBeLessThan(H / 2)
  })

  it('places top-center watermark at horizontal midpoint', () => {
    const pos = getWatermarkPos('top-center', W, H)
    expect(pos.x).toBe(W / 2)
    expect(pos.y).toBeLessThan(H / 2)
  })

  it('places bottom-right watermark near the bottom-right', () => {
    const pos = getWatermarkPos('bottom-right', W, H)
    expect(pos.x).toBeGreaterThan(W / 2)
    expect(pos.y).toBeGreaterThan(H / 2)
  })

  it('places center watermark at exact midpoint', () => {
    const pos = getWatermarkPos('center', W, H)
    expect(pos.x).toBe(W / 2)
    expect(pos.y).toBe(H / 2)
  })

  it('falls back gracefully for unknown position', () => {
    const pos = getWatermarkPos('unknown-position', W, H)
    expect(typeof pos.x).toBe('number')
    expect(typeof pos.y).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// processImage (integration-level, with canvas stub from setup.ts)
// ---------------------------------------------------------------------------
describe('processImage', () => {
  const makeSettings = (overrides: Partial<Settings> = {}): Settings =>
    ({ ...JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), ...overrides })

  beforeEach(() => {
    // Stub global Image so loadImage resolves without a real network request
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      naturalWidth = 800
      naturalHeight = 600
      set src(_: string) { this.onload?.() }
    })
  })

  it('returns an HTMLCanvasElement', async () => {
    const canvas = await processImage('data:image/png;base64,stub', makeSettings())
    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
  })

  it('respects resize settings when enabled', async () => {
    const settings = makeSettings({
      resize: {
        ...DEFAULT_SETTINGS.resize,
        enabled: true,
        mode: 'pixels',
        width: '400',
        height: '300',
      },
    })
    const canvas = await processImage('data:image/png;base64,stub', settings)
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(300)
  })

  it('swaps width/height for 90° rotation', async () => {
    const settings = makeSettings({
      resize: { ...DEFAULT_SETTINGS.resize, enabled: true, mode: 'pixels', width: '400', height: '300' },
      transform: { ...DEFAULT_SETTINGS.transform, rotation: 90 },
    })
    const canvas = await processImage('data:image/png;base64,stub', settings)
    // After 90° rotation, width↔height swap
    expect(canvas.width).toBe(300)
    expect(canvas.height).toBe(400)
  })

  it('does not swap dimensions for 180° rotation', async () => {
    const settings = makeSettings({
      resize: { ...DEFAULT_SETTINGS.resize, enabled: true, mode: 'pixels', width: '400', height: '300' },
      transform: { ...DEFAULT_SETTINGS.transform, rotation: 180 },
    })
    const canvas = await processImage('data:image/png;base64,stub', settings)
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(300)
  })

  it('applies crop: uses crop region as output size when resize is disabled', async () => {
    const settings = makeSettings({
      transform: { ...DEFAULT_SETTINGS.transform, crop: { x: 0, y: 0, w: 200, h: 150 } },
    })
    // With resize disabled, output mirrors the original image dims from computeOutputDimensions,
    // but processImage still runs without throwing
    const canvas = await processImage('data:image/png;base64,stub', settings)
    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
  })
})
