import { useState, useEffect, useCallback, useRef } from 'react'
import type { ImageItem } from '@/types'
import { formatBytes } from '@/utils/imageProcessing'

interface Props {
  image: ImageItem | null
  processedCanvas: HTMLCanvasElement | null
  processing: boolean
}

export function PreviewPanel({ image, processedCanvas, processing }: Props) {
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const [sliderX, setSliderX] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Single display canvas — we blit the off-screen processedCanvas into it
  // directly rather than going through toDataURL() → <img>, which would
  // re-encode and lose quality (especially for JPEG output).
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const display = displayCanvasRef.current
    if (!display) return

    if (!processedCanvas) {
      // Clear the canvas when there is nothing to show
      const ctx = display.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, display.width, display.height)
      display.width = 0
      display.height = 0
      return
    }

    display.width = processedCanvas.width
    display.height = processedCanvas.height
    const ctx = display.getContext('2d')
    if (ctx) ctx.drawImage(processedCanvas, 0, 0)
  }, [processedCanvas])

  // ── Before/After drag ────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      setSliderX(pct)
    },
    [dragging],
  )

  const handleMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!image) {
    return (
      <div className="preview-empty">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
          <rect
            x="4"
            y="8"
            width="40"
            height="32"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path
            d="M4 34l10-10 8 8 6-6 10 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>No image selected</span>
      </div>
    )
  }

  // The "after" view — canvas if processing has completed, original img otherwise
  const afterElement = processedCanvas
    ? <canvas ref={displayCanvasRef} className="preview-img" aria-label="Processed image" />
    : <img src={image.src} alt="preview" className="preview-img" />

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <div className="preview-info">
          <span className="info-chip">
            {image.width} × {image.height}
          </span>
          <span className="info-chip">{formatBytes(image.size)}</span>
        </div>
        <div className="preview-actions">
          <button
            className={`preview-btn ${showBeforeAfter ? 'active' : ''}`}
            onClick={() => setShowBeforeAfter((v) => !v)}
            title="Before/After comparison"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2v10M2 2h3v10H2zM9 2h3v10H9z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            Before/After
          </button>
        </div>
      </div>

      <div
        className="preview-canvas-wrap"
        ref={containerRef}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {processing && (
          <div className="processing-overlay">
            <div className="spinner" />
            <span>Processing…</span>
          </div>
        )}

        {showBeforeAfter ? (
          <div
            className="ba-container"
            style={{ position: 'relative', width: '100%', height: '100%' }}
          >
            {/* After (processed) — sits underneath, full width */}
            <div
              className="ba-after"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {afterElement}
              <span className="ba-label ba-label-after">After</span>
            </div>

            {/* Before (original) — clipped to the left of the slider */}
            <div
              className="ba-before"
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(0 ${100 - sliderX}% 0 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src={image.src} alt="before" className="preview-img" />
              <span className="ba-label ba-label-before">Before</span>
            </div>

            {/* Drag handle */}
            <div
              className="ba-slider"
              style={{ left: `${sliderX}%` }}
              onMouseDown={() => setDragging(true)}
            >
              <div className="ba-slider-line" />
              <div className="ba-slider-handle">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5 8l-3-3v6l3-3zM11 8l3-3v6l-3-3z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="single-preview"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {afterElement}
          </div>
        )}
      </div>

      <style>{`
        .preview-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .preview-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          gap: 10px;
        }
        .preview-info { display: flex; gap: 6px; }
        .info-chip {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--text3);
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 2px 6px;
        }
        .preview-actions { display: flex; gap: 6px; }
        .preview-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 5px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text2);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.1s;
        }
        .preview-btn:hover { background: var(--bg3); color: var(--text); }
        .preview-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
        .preview-canvas-wrap {
          flex: 1;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(45deg, var(--bg3) 25%, transparent 25%),
            linear-gradient(-45deg, var(--bg3) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, var(--bg3) 75%),
            linear-gradient(-45deg, transparent 75%, var(--bg3) 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
          background-color: var(--bg);
        }
        .preview-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text3);
          background: var(--bg);
          font-size: 12px;
          height: 100%;
        }
        .preview-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }
        .processing-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          z-index: 10;
          font-size: 12px;
          color: var(--text2);
          backdrop-filter: blur(2px);
        }
        .spinner {
          width: 24px; height: 24px;
          border: 2px solid var(--border2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ba-container { user-select: none; }
        .ba-label {
          position: absolute;
          top: 10px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(0,0,0,0.55);
          color: #fff;
          padding: 3px 8px;
          border-radius: 4px;
          pointer-events: none;
        }
        .ba-label-before { left: 10px; }
        .ba-label-after { right: 10px; }
        .ba-slider {
          position: absolute;
          top: 0; bottom: 0;
          width: 2px;
          transform: translateX(-50%);
          cursor: col-resize;
          z-index: 5;
        }
        .ba-slider-line {
          position: absolute;
          top: 0; bottom: 0; left: 0; right: 0;
          background: white;
          opacity: 0.8;
        }
        .ba-slider-handle {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 32px; height: 32px;
          border-radius: 50%;
          background: white;
          color: #333;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  )
}
