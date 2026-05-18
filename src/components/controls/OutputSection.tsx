import { useState } from 'react'
import { SectionTitle, Slider, Toggle } from '@/components/controls/primitives'
import { formatBytes } from '@/utils/imageProcessing'
import type { Settings } from '@/types'

interface OutputSectionProps {
  settings: Settings
  onChange: (s: Settings) => void
  sizeEstimate: number
}

const FORMATS = ['jpg', 'png', 'webp', 'avif'] as const

export function OutputSection({ settings, onChange, sizeEstimate }: OutputSectionProps) {
  const [open, setOpen] = useState(true)
  const { output } = settings
  const setOut = (patch: Partial<typeof output>) =>
    onChange({ ...settings, output: { ...output, ...patch } })

  const lossy = output.format === 'jpg' || output.format === 'webp' || output.format === 'avif'

  return (
    <div className="ctrl-section">
      <SectionTitle
        label="Output"
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v8M4 6l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 11h10"
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
          <div className="ctrl-row">
            <label className="ctrl-label">Format</label>
            <div className="seg-ctrl">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  className={output.format === f ? 'active' : ''}
                  onClick={() => setOut({ format: f })}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {lossy && (
            <Slider
              label="Quality"
              value={output.quality}
              min={1}
              max={100}
              unit="%"
              onChange={(v) => setOut({ quality: v })}
            />
          )}

          <Toggle
            label="Strip EXIF"
            checked={output.stripExif}
            onChange={(v) => setOut({ stripExif: v })}
          />

          <div className="ctrl-row">
            <label className="ctrl-label">Filename</label>
            <input
              className="text-input small"
              type="text"
              value={output.filename}
              onChange={(e) => setOut({ filename: e.target.value })}
              placeholder="{name}_{index}"
            />
          </div>

          {sizeEstimate > 0 && (
            <div className="size-estimate">
              <span className="size-dot" />
              Est. size: <strong>{formatBytes(sizeEstimate)}</strong>
            </div>
          )}
        </div>
      )}

      <style>{`
        .size-estimate {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text2);
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 8px;
        }
        .size-estimate strong { color: var(--text); font-family: 'DM Mono', monospace; }
        .size-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--success);
          flex-shrink: 0;
        }
        .text-input.small { flex: 1; }
      `}</style>
    </div>
  )
}
