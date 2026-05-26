import { useState, useRef } from 'react'
import { zipSync } from 'fflate'
import type { ImageItem, Settings } from '@/types'
import { processImage, canvasToBlob, formatBytes } from '@/utils/imageProcessing'

interface Props {
  image: ImageItem | null
  images: ImageItem[]
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onApplyToAll: () => void
}

function getFilename(img: ImageItem, index: number, settings: Settings): string {
  const tpl = settings.output.filename || '{name}_{index}'
  const base = img.name.replace(/\.[^.]+$/, '')
  return (
    tpl
      .replace('{name}', base)
      .replace('{index}', String(index + 1).padStart(2, '0')) +
    '.' +
    settings.output.format
  )
}

export function ActionBar({ image, images, canUndo, canRedo, onUndo, onRedo, onReset, onApplyToAll }: Props) {
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [base64Modal, setBase64Modal] = useState(false)
  const [base64String, setBase64String] = useState('')
  const base64CopiedRef = useRef(false)
  const [base64Copied, setBase64Copied] = useState(false)

  const downloadSingle = async () => {
    if (!image || busy) return
    setBusy(true)
    try {
      const canvas = await processImage(image.src, image.settings)
      const blob = await canvasToBlob(canvas, image.settings.output.format, image.settings.output.quality)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getFilename(image, 0, image.settings)
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  const downloadAllZip = async () => {
    if (!images.length || busy) return
    setBusy(true)
    try {
      const files: Record<string, Uint8Array> = {}
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const canvas = await processImage(img.src, img.settings)
        const blob = await canvasToBlob(canvas, img.settings.output.format, img.settings.output.quality)
        if (!blob) continue
        const ab = await blob.arrayBuffer()
        files[getFilename(img, i, img.settings)] = new Uint8Array(ab)
      }
      const zipped = zipSync(files, { level: 1 })
      const zipBlob = new Blob([zipped], { type: 'application/zip' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pixresize_export.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  const copyToClipboard = async () => {
    if (!image || busy) return
    setBusy(true)
    try {
      const canvas = await processImage(image.src, image.settings)
      canvas.toBlob(async (blob) => {
        if (!blob) return
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          alert('Clipboard copy failed. Try a different browser.')
        }
      }, 'image/png')
    } finally {
      setBusy(false)
    }
  }

  const exportBase64 = async () => {
    if (!image || busy) return
    setBusy(true)
    try {
      const canvas = await processImage(image.src, image.settings)
      const fmt = image.settings.output.format
      const mime =
        fmt === 'jpg' ? 'image/jpeg'
        : fmt === 'png' ? 'image/png'
        : fmt === 'webp' ? 'image/webp'
        : 'image/avif'
      const dataUrl = canvas.toDataURL(mime, image.settings.output.quality / 100)
      setBase64String(dataUrl)
      setBase64Modal(true)
    } finally {
      setBusy(false)
    }
  }

  const copyBase64 = () => {
    navigator.clipboard.writeText(base64String).catch(() => {})
    base64CopiedRef.current = true
    setBase64Copied(true)
    setTimeout(() => {
      base64CopiedRef.current = false
      setBase64Copied(false)
    }, 1500)
  }

  return (
    <>
      <div className="action-bar">
        <div className="action-group">
          <button
            className="action-btn-sm icon-only"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 5h7a4 4 0 010 8H6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M5 2L2 5l3 3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="action-btn-sm icon-only"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M12 5H5a4 4 0 000 8h3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M9 2l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="action-btn-sm" onClick={onReset} title="Reset to defaults">
            Reset
          </button>
          <button
            className="action-btn-sm"
            onClick={onApplyToAll}
            disabled={!image || images.length < 2}
            title="Apply current settings to all images"
          >
            Apply to All
          </button>
        </div>

        <div className="action-group">
          <button
            className="action-btn-sm"
            onClick={copyToClipboard}
            disabled={!image || busy}
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            className="action-btn-sm"
            onClick={exportBase64}
            disabled={!image || busy}
            title="Export as Base64"
          >
            Base64
          </button>
          <button
            className="action-btn-sm"
            onClick={downloadSingle}
            disabled={!image || busy}
            title="Download current image"
          >
            {busy ? '…' : '↓ Download'}
          </button>
          <button
            className="action-btn-primary"
            onClick={downloadAllZip}
            disabled={!images.length || busy}
            title="Bulk download as ZIP"
          >
            {busy ? 'Zipping…' : `↓ ZIP (${images.length})`}
          </button>
        </div>
      </div>

      {base64Modal && (
        <div className="modal-overlay" onClick={() => setBase64Modal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Base64 Export</span>
              <button className="modal-close" onClick={() => setBase64Modal(false)}>
                ×
              </button>
            </div>
            <textarea className="base64-area" readOnly value={base64String} rows={6} />
            <div className="modal-footer">
              <button className="action-btn-primary" onClick={copyBase64}>
                {base64Copied ? '✓ Copied!' : 'Copy to clipboard'}
              </button>
              <span className="modal-info">{formatBytes(base64String.length)} string</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          gap: 10px;
        }
        .action-group { display: flex; align-items: center; gap: 6px; }
        .action-btn-sm {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg3);
          color: var(--text2);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }
        .action-btn-sm:hover:not(:disabled) { border-color: var(--border2); color: var(--text); background: var(--bg); }
        .action-btn-sm:disabled { opacity: 0.4; cursor: default; }
        .action-btn-sm.icon-only { padding: 6px 8px; }
        .action-btn-primary {
          padding: 6px 16px;
          border-radius: 6px;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }
        .action-btn-primary:hover:not(:disabled) { background: var(--accent-hover); border-color: var(--accent-hover); }
        .action-btn-primary:disabled { opacity: 0.4; cursor: default; }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }
        .modal {
          background: var(--bg2);
          border: 1px solid var(--border2);
          border-radius: 10px;
          width: 520px;
          max-width: 90vw;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 500;
          font-size: 14px;
        }
        .modal-close {
          width: 24px; height: 24px;
          border-radius: 5px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text2);
          font-size: 16px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-close:hover { background: var(--bg3); color: var(--text); }
        .base64-area {
          width: 100%;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text2);
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          padding: 10px;
          resize: vertical;
          outline: none;
        }
        .modal-footer { display: flex; align-items: center; gap: 12px; }
        .modal-info {
          font-size: 11px;
          color: var(--text3);
          font-family: 'DM Mono', monospace;
        }
      `}</style>
    </>
  )
}
