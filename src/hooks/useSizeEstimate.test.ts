import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSizeEstimate } from './useSizeEstimate'
import { DEFAULT_SETTINGS } from '@/types'
import type { Settings } from '@/types'

// Stub estimateSize so we don't run the full canvas pipeline
vi.mock('@/utils/imageProcessing', () => ({
  estimateSize: vi.fn(),
  formatBytes: (n: number) => `${n} B`,
  processImage: vi.fn(),
  canvasToBlob: vi.fn(),
  getWatermarkPos: vi.fn(),
  clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
}))

const { estimateSize } = await import('@/utils/imageProcessing')
const mockEstimate = vi.mocked(estimateSize)

const settings: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

describe('useSizeEstimate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEstimate.mockResolvedValue(12_000)
  })

  it('returns 0 initially before the debounce resolves', () => {
    // The hook initialises to 0 and only updates after the 400ms debounce
    const { result } = renderHook(() => useSizeEstimate('data:stub', settings))
    expect(result.current).toBe(0)
  })

  it('returns the estimated size after debounce completes', async () => {
    const { result } = renderHook(() => useSizeEstimate('data:stub', settings))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 600))
    })
    expect(result.current).toBe(12_000)
  })

  it('returns 0 and does not call estimateSize when src is null', async () => {
    const { result } = renderHook(() => useSizeEstimate(null, settings))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 600))
    })
    expect(result.current).toBe(0)
    expect(mockEstimate).not.toHaveBeenCalled()
  })

  it('returns 0 and does not call estimateSize when settings is null', async () => {
    const { result } = renderHook(() => useSizeEstimate('data:stub', null))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 600))
    })
    expect(result.current).toBe(0)
    expect(mockEstimate).not.toHaveBeenCalled()
  })

  it('re-estimates when settings change', async () => {
    mockEstimate.mockResolvedValueOnce(10_000).mockResolvedValueOnce(5_000)

    const { result, rerender } = renderHook(
      ({ s }: { s: Settings }) => useSizeEstimate('data:stub', s),
      { initialProps: { s: settings } },
    )

    await act(async () => { await new Promise((r) => setTimeout(r, 600)) })
    expect(result.current).toBe(10_000)

    // Change format → triggers re-estimate
    const updated: Settings = {
      ...settings,
      output: { ...settings.output, format: 'png' },
    }
    rerender({ s: updated })

    await act(async () => { await new Promise((r) => setTimeout(r, 600)) })
    expect(result.current).toBe(5_000)
    expect(mockEstimate).toHaveBeenCalledTimes(2)
  })
})
