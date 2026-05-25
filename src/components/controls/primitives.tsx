// PixResize — shared control-panel primitives (ported from handoff controls.jsx)

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}

export function Slider({ label, value, min, max, step = 1, unit = '', onChange }: SliderProps) {
  return (
    <div className="ctrl-row">
      <label className="ctrl-label">{label}</label>
      <div className="ctrl-slider-wrap">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ctrl-slider"
        />
        <span className="ctrl-value">
          {value}
          {unit}
        </span>
      </div>
    </div>
  )
}

interface NumberInputProps {
  value: string | number
  onChange: (v: string) => void
  min?: number
  max?: number
  placeholder?: string | number
}

export function NumberInput({ value, onChange, min, max, placeholder }: NumberInputProps) {
  return (
    <input
      type="number"
      className="num-input"
      value={value}
      min={min}
      max={max}
      placeholder={placeholder === undefined ? undefined : String(placeholder)}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="ctrl-row">
      <label className="ctrl-label">{label}</label>
      <button
        className={`toggle-btn ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob"></span>
      </button>
    </div>
  )
}

interface SectionTitleProps {
  label: string
  icon: React.ReactNode
  open: boolean
  onToggle: () => void
}

export function SectionTitle({ label, icon, open, onToggle }: SectionTitleProps) {
  return (
    <button className={`section-title ${open ? 'open' : ''}`} onClick={onToggle}>
      <span className="section-icon">{icon}</span>
      <span>{label}</span>
      <svg className="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M3 4.5l3 3 3-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// Canonical control-panel CSS, copied verbatim from the design handoff
// (PixResize.html <style> block). Rendered once at the top of the controls panel.
export function ControlStyles() {
  return (
    <style>{`
      .ctrl-section {
        border-bottom: 1px solid var(--border);
      }

      .section-title {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: transparent;
        border: none;
        color: var(--text);
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background 0.1s;
      }
      .section-title:hover { background: var(--bg3); }
      .section-title .section-icon { color: var(--text2); flex-shrink: 0; }
      .section-title .chevron { margin-left: auto; color: var(--text3); transition: transform 0.2s; }
      .section-title.open .chevron { transform: rotate(180deg); }

      .ctrl-body {
        padding: 8px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .ctrl-row {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 26px;
      }

      .ctrl-label {
        font-size: 11px;
        color: var(--text2);
        width: 70px;
        flex-shrink: 0;
      }

      .ctrl-slider-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .ctrl-slider {
        flex: 1;
        -webkit-appearance: none;
        height: 3px;
        border-radius: 2px;
        background: var(--border2);
        outline: none;
        cursor: pointer;
      }
      .ctrl-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 13px; height: 13px;
        border-radius: 50%;
        background: var(--accent);
        cursor: pointer;
        border: 2px solid var(--bg2);
        box-shadow: 0 0 0 1px var(--accent);
      }
      .ctrl-slider::-moz-range-thumb {
        width: 13px; height: 13px;
        border-radius: 50%;
        background: var(--accent);
        cursor: pointer;
        border: 2px solid var(--bg2);
      }

      .ctrl-value {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: var(--text2);
        width: 38px;
        text-align: right;
        flex-shrink: 0;
      }

      .toggle-btn {
        position: relative;
        width: 32px; height: 18px;
        border-radius: 9px;
        border: 1px solid var(--border2);
        background: var(--bg3);
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
        flex-shrink: 0;
      }
      .toggle-btn.on {
        background: var(--accent);
        border-color: var(--accent);
      }
      .toggle-knob {
        position: absolute;
        top: 2px; left: 2px;
        width: 12px; height: 12px;
        border-radius: 50%;
        background: var(--text3);
        transition: transform 0.15s, background 0.15s;
      }
      .toggle-btn.on .toggle-knob {
        transform: translateX(14px);
        background: white;
      }

      .seg-ctrl {
        display: flex;
        gap: 2px;
        background: var(--bg3);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 2px;
        flex: 1;
      }
      .seg-ctrl.small { flex: none; }
      .seg-ctrl button {
        flex: 1;
        padding: 3px 6px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: var(--text2);
        font-family: 'DM Sans', sans-serif;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.1s;
        white-space: nowrap;
      }
      .seg-ctrl button.active {
        background: var(--bg2);
        color: var(--text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }

      .dim-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dim-field {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .dim-field label {
        font-size: 10px;
        color: var(--text3);
        font-family: 'DM Mono', monospace;
        width: 10px;
      }

      .num-input, .text-input, .select-input {
        background: var(--bg3);
        border: 1px solid var(--border);
        border-radius: 5px;
        color: var(--text);
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        padding: 4px 7px;
        outline: none;
        transition: border-color 0.15s;
        width: 100%;
      }
      .num-input:focus, .text-input:focus, .select-input:focus {
        border-color: var(--accent);
      }
      .num-input { width: 70px; text-align: right; }

      .lock-btn {
        width: 24px; height: 24px;
        border-radius: 5px;
        border: 1px solid var(--border);
        background: var(--bg3);
        color: var(--text2);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: all 0.1s;
      }
      .lock-btn.locked { border-color: var(--accent); color: var(--accent); }
      .lock-btn:hover { background: var(--bg2); }

      .preset-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
      }
      .preset-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 6px 8px;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--bg3);
        color: var(--text);
        cursor: pointer;
        transition: all 0.1s;
        gap: 1px;
        text-align: left;
      }
      .preset-btn:hover { border-color: var(--border2); background: var(--bg); }
      .preset-btn.active { border-color: var(--accent); background: var(--accent-dim); }
      .preset-name { font-size: 11px; font-weight: 500; }
      .preset-dim { font-size: 9px; font-family: 'DM Mono', monospace; color: var(--text3); }

      .action-btn {
        padding: 4px 10px;
        border-radius: 5px;
        border: 1px solid var(--border);
        background: var(--bg3);
        color: var(--text2);
        font-family: 'DM Sans', sans-serif;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.1s;
        white-space: nowrap;
      }
      .action-btn:hover { border-color: var(--border2); color: var(--text); background: var(--bg); }
      .action-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
      .action-btn.full-width { width: 100%; text-align: center; }

      .btn-group { display: flex; gap: 4px; flex: 1; }

      .ctrl-hint { font-size: 10px; color: var(--text3); font-family: 'DM Mono', monospace; }

      .sub-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        background: var(--bg3);
        border-radius: 6px;
        border: 1px solid var(--border);
      }

      .color-input {
        width: 32px; height: 26px;
        border-radius: 5px;
        border: 1px solid var(--border);
        background: transparent;
        cursor: pointer;
        padding: 2px;
      }

      .select-input {
        font-family: 'DM Sans', sans-serif;
        font-size: 11px;
        cursor: pointer;
      }
    `}</style>
  )
}
