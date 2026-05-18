import { useEffect, useRef, useState } from 'react'
import { estimateSize } from '@/utils/imageProcessing'
import type { Settings } from '@/types'

export function useSizeEstimate(src: string | null, settings: Settings | null): number {
  const [estimate, setEstimate] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!src || !settings) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      const bytes = await estimateSize(src, settings, settings.output.format, settings.output.quality)
      // Only update if nonzero so we don't flash 0 on transient errors
      if (bytes > 0) setEstimate(bytes)
    }, 400)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [src, settings])

  return estimate
}
