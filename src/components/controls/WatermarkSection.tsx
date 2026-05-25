import { useState, useRef } from 'react'
import type { Settings } from '@/types'
import { SectionTitle, Slider, Toggle } from './primitives'

interface Props {
  settings: Settings
  onChange: (s: Settings) => void
}

const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const

export function WatermarkSection({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { watermark } = settings
  const setWM = (patch: Partial<typeof watermark>) =>
    onChange({ ...settings, watermark: { ...watermark, ...patch } })
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setWM({ logoSrc: ev.target?.result as string })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="ctrl-section">
      <SectionTitle
        label="Watermark"
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 10L6 4l3 4 2-2.5 3 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <rect
              x="1"
              y="1"
              width="12"
              height="12"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        }
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div className="ctrl-body">
          <Toggle
            label="Text watermark"
            checked={watermark.textEnabled}
            onChange={(v) => setWM({ textEnabled: v })}
          />
          {watermark.textEnabled && (
            <div className="sub-section">
              <input
                className="text-input"
                type="text"
                placeholder="Watermark text…"
                value={watermark.text}
                onChange={(e) => setWM({ text: e.target.value })}
              />
              <Slider
                label="Size"
                value={watermark.textSize}
                min={8}
                max={120}
                unit="px"
                onChange={(v) => setWM({ textSize: v })}
              />
              <Slider
                label="Opacity"
                value={watermark.textOpacity}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => setWM({ textOpacity: v })}
              />
              <div className="ctrl-row">
                <label className="ctrl-label">Color</label>
                <input
                  type="color"
                  className="color-input"
                  value={watermark.textColor}
                  onChange={(e) => setWM({ textColor: e.target.value })}
                />
              </div>
              <div className="ctrl-row">
                <label className="ctrl-label">Position</label>
                <select
                  className="select-input"
                  value={watermark.textPosition}
                  onChange={(e) => setWM({ textPosition: e.target.value })}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Toggle
            label="Logo watermark"
            checked={watermark.logoEnabled}
            onChange={(v) => setWM({ logoEnabled: v })}
          />
          {watermark.logoEnabled && (
            <div className="sub-section">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoUpload}
              />
              <button
                className="action-btn full-width"
                onClick={() => logoInputRef.current?.click()}
              >
                {watermark.logoSrc ? '↺ Replace logo' : '+ Upload logo image'}
              </button>
              {watermark.logoSrc && (
                <>
                  <Slider
                    label="Size"
                    value={watermark.logoSize}
                    min={5}
                    max={80}
                    unit="%"
                    onChange={(v) => setWM({ logoSize: v })}
                  />
                  <Slider
                    label="Opacity"
                    value={watermark.logoOpacity}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => setWM({ logoOpacity: v })}
                  />
                  <div className="ctrl-row">
                    <label className="ctrl-label">Position</label>
                    <select
                      className="select-input"
                      value={watermark.logoPosition}
                      onChange={(e) => setWM({ logoPosition: e.target.value })}
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>
                          {p.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
