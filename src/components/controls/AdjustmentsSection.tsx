import { useState } from 'react'
import type { Settings } from '@/types'
import { SectionTitle, Slider, Toggle } from './primitives'

interface Props {
  settings: Settings
  onChange: (s: Settings) => void
}

export function AdjustmentsSection({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { adjustments } = settings
  const setAdj = (patch: Partial<typeof adjustments>) =>
    onChange({ ...settings, adjustments: { ...adjustments, ...patch } })

  return (
    <div className="ctrl-section">
      <SectionTitle
        label="Adjustments"
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path
              d="M1 4h2M6 4h7M1 10h7M12 10h1M4 2v2M10 8v2"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        }
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div className="ctrl-body">
          <Slider
            label="Brightness"
            value={adjustments.brightness}
            min={0}
            max={200}
            unit="%"
            onChange={(v) => setAdj({ brightness: v })}
          />
          <Slider
            label="Contrast"
            value={adjustments.contrast}
            min={0}
            max={200}
            unit="%"
            onChange={(v) => setAdj({ contrast: v })}
          />
          <Slider
            label="Blur"
            value={adjustments.blur}
            min={0}
            max={20}
            step={0.5}
            unit="px"
            onChange={(v) => setAdj({ blur: v })}
          />
          <Toggle
            label="Grayscale"
            checked={adjustments.grayscale}
            onChange={(v) => setAdj({ grayscale: v })}
          />
        </div>
      )}
    </div>
  )
}
