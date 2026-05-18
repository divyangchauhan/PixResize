import { useState } from 'react'
import type { Settings } from '@/types'
import { SectionTitle, Toggle } from './primitives'

interface Props {
  settings: Settings
  onChange: (s: Settings) => void
  cropActive: boolean
  onToggleCrop: () => void
}

export function TransformSection({ settings, onChange, cropActive, onToggleCrop }: Props) {
  const [open, setOpen] = useState(false)
  const { transform } = settings
  const setTransform = (patch: Partial<typeof transform>) =>
    onChange({ ...settings, transform: { ...transform, ...patch } })

  return (
    <div className="ctrl-section">
      <SectionTitle
        label="Transform"
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a6 6 0 11-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M1 4V1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        open={open}
        onToggle={() => setOpen(!open)}
      />

      {open && (
        <div className="ctrl-body">
          <Toggle label="Crop" checked={cropActive} onChange={() => onToggleCrop()} />

          <div className="ctrl-row">
            <label className="ctrl-label">Rotate</label>
            <div className="btn-group">
              {(['CCW', '180°', 'CW'] as const).map((lbl) => {
                const deg = lbl === 'CCW' ? -90 : lbl === 'CW' ? 90 : 180
                return (
                  <button
                    key={lbl}
                    className="action-btn"
                    onClick={() =>
                      setTransform({ rotation: ((transform.rotation + deg) % 360 + 360) % 360 })
                    }
                  >
                    {lbl}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="ctrl-row">
            <label className="ctrl-label">Flip</label>
            <div className="btn-group">
              <button
                className={`action-btn ${transform.flipH ? 'active' : ''}`}
                onClick={() => setTransform({ flipH: !transform.flipH })}
              >
                Horizontal
              </button>
              <button
                className={`action-btn ${transform.flipV ? 'active' : ''}`}
                onClick={() => setTransform({ flipV: !transform.flipV })}
              >
                Vertical
              </button>
            </div>
          </div>

          {transform.rotation !== 0 && (
            <div className="ctrl-hint">Rotation: {transform.rotation}°</div>
          )}
        </div>
      )}
    </div>
  )
}
