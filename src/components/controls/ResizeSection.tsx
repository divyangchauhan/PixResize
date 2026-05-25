// PixResize — Resize control section (ported from handoff controls.jsx)
import { useState } from 'react'
import type { Settings, ResizeSettings } from '@/types'
import { PRESETS } from '@/types'
import { SectionTitle, Toggle, NumberInput, Slider } from './primitives'

interface ResizeSectionProps {
  settings: Settings
  onChange: (s: Settings) => void
  imgW: number
  imgH: number
}

type ResizeMode = ResizeSettings['mode']
type FitMode = ResizeSettings['fitMode']

export function ResizeSection({ settings, onChange, imgW, imgH }: ResizeSectionProps) {
  const [open, setOpen] = useState(true)
  const s = settings.resize

  const setResize = (patch: Partial<ResizeSettings>) =>
    onChange({ ...settings, resize: { ...s, ...patch } })

  const handleWidthChange = (val: string) => {
    if (s.lockAspect && imgW && imgH && val) {
      const ratio = imgH / imgW
      setResize({ width: val, height: Math.round(parseInt(val) * ratio) || '' })
    } else {
      setResize({ width: val })
    }
  }

  const handleHeightChange = (val: string) => {
    if (s.lockAspect && imgW && imgH && val) {
      const ratio = imgW / imgH
      setResize({ height: val, width: Math.round(parseInt(val) * ratio) || '' })
    } else {
      setResize({ height: val })
    }
  }

  const applyPreset = (preset: { label: string; w: number; h: number }) => {
    setResize({
      enabled: true,
      mode: 'pixels',
      width: preset.w,
      height: preset.h,
      preset: preset.label,
      lockAspect: false,
    })
  }

  return (
    <div className="ctrl-section">
      <SectionTitle
        label="Resize"
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="2 1.5" />
            <path d="M10 1l3 3M1 10l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        }
        open={open}
        onToggle={() => setOpen(!open)}
      />

      {open && (
        <div className="ctrl-body">
          <Toggle label="Enable resize" checked={s.enabled} onChange={(v) => setResize({ enabled: v })} />

          {s.enabled && (
            <>
              <div className="seg-ctrl">
                {(['pixels', 'percent', 'preset'] as ResizeMode[]).map((m) => (
                  <button
                    key={m}
                    className={s.mode === m ? 'active' : ''}
                    onClick={() => setResize({ mode: m })}
                  >
                    {m === 'pixels' ? 'px' : m === 'percent' ? '%' : 'Preset'}
                  </button>
                ))}
              </div>

              {s.mode === 'pixels' && (
                <div className="dim-row">
                  <div className="dim-field">
                    <label htmlFor="resize-width">W</label>
                    <NumberInput id="resize-width" aria-label="W" value={s.width} placeholder={imgW || 'W'} min={1} max={8000} onChange={handleWidthChange} />
                  </div>
                  <button
                    className={`lock-btn ${s.lockAspect ? 'locked' : ''}`}
                    onClick={() => setResize({ lockAspect: !s.lockAspect })}
                    title={s.lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                  >
                    {s.lockAspect ? (
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <rect x="1" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                        <path d="M3 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      </svg>
                    ) : (
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <rect x="1" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                        <path d="M8 6V4a3 3 0 00-3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      </svg>
                    )}
                  </button>
                  <div className="dim-field">
                    <label htmlFor="resize-height">H</label>
                    <NumberInput id="resize-height" aria-label="H" value={s.height} placeholder={imgH || 'H'} min={1} max={8000} onChange={handleHeightChange} />
                  </div>
                </div>
              )}

              {s.mode === 'percent' && (
                <Slider
                  label="Scale"
                  value={parseFloat(String(s.percent))}
                  min={1}
                  max={400}
                  unit="%"
                  onChange={(v) => setResize({ percent: v })}
                />
              )}

              {s.mode === 'preset' && (
                <div className="preset-grid">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      className={`preset-btn ${s.preset === p.label ? 'active' : ''}`}
                      onClick={() => applyPreset(p)}
                    >
                      <span className="preset-name">{p.label}</span>
                      <span className="preset-dim">
                        {p.w}×{p.h}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {(s.mode === 'pixels' || s.mode === 'preset') && (
                <div className="ctrl-row">
                  <label className="ctrl-label">Fit mode</label>
                  <div className="seg-ctrl small">
                    {(['contain', 'cover', 'stretch'] as FitMode[]).map((m) => (
                      <button
                        key={m}
                        className={s.fitMode === m ? 'active' : ''}
                        onClick={() => setResize({ fitMode: m })}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
