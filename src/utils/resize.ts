import type { ResizeSettings } from '@/types'

/**
 * Computes the output canvas dimensions for the given resize settings,
 * without running the full canvas pipeline. This is the single source of
 * truth shared by `processImage` and the preview's "Output:" label.
 */
export function computeOutputDimensions(
  settings: ResizeSettings,
  originalW: number,
  originalH: number,
): { w: number; h: number } {
  let w = originalW
  let h = originalH

  if (settings.enabled) {
    if (settings.mode === 'pixels' || settings.mode === 'preset') {
      w = parseInt(String(settings.width)) || originalW
      h = parseInt(String(settings.height)) || originalH
    } else if (settings.mode === 'percent') {
      const pct = parseFloat(String(settings.percent)) / 100
      w = Math.round(originalW * pct)
      h = Math.round(originalH * pct)
    }
  }

  return { w, h }
}
