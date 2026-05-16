import { useRef, useState } from 'react'

interface UploadZoneProps {
  onFiles: (files: File[]) => void
}

export function UploadZone({ onFiles }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) onFiles(files)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'))
    if (files.length) onFiles(files)
    e.target.value = ''
  }

  return (
    <>
      <style>{`
        .upload-zone {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px dashed var(--border2);
          border-radius: 10px;
          margin: 12px;
          padding: 32px 16px;
          gap: 10px;
          color: var(--text3);
          transition: all 0.15s;
          background: var(--bg3);
          cursor: pointer;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-dim);
        }
        .upload-icon { opacity: 0.7; }
        .upload-title {
          font-weight: 500;
          font-size: 13px;
          text-align: center;
        }
        .upload-sub {
          font-size: 11px;
          text-align: center;
          color: var(--text3);
        }
      `}</style>
      <div
        className={`upload-zone${dragging ? ' dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInput}
        />
        <div className="upload-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="5" y="12" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M20 8 L20 24 M14 14 L20 8 L26 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="20" r="2" fill="currentColor" />
          </svg>
        </div>
        <div className="upload-title">
          {dragging ? 'Drop images here' : 'Drop images or click to upload'}
        </div>
        <div className="upload-sub">Supports JPG, PNG, WebP, AVIF, GIF · Up to 20 images</div>
      </div>
    </>
  )
}
