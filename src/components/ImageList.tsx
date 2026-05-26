import { useRef } from 'react'
import type { ImageItem } from '@/types'

interface ImageThumbProps {
  item: ImageItem
  selected: boolean
  onClick: () => void
  onRemove: (id: string) => void
}

function ImageThumb({ item, selected, onClick, onRemove }: ImageThumbProps) {
  const name = item.name.length > 14 ? item.name.slice(0, 12) + '…' : item.name
  return (
    <>
      <style>{`
        .img-thumb {
          position: relative;
          aspect-ratio: 1;
          border-radius: 6px;
          overflow: hidden;
          border: 1.5px solid var(--border);
          cursor: pointer;
          transition: border-color 0.1s;
          background: var(--bg3);
        }
        .img-thumb:hover { border-color: var(--border2); }
        .img-thumb.selected { border-color: var(--accent); }
        .img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .img-thumb-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          padding: 4px 5px 4px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .img-thumb-name { font-size: 9px; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .img-thumb-badge { font-size: 9px; color: var(--success); font-weight: 600; }
        .img-thumb-remove {
          position: absolute;
          top: 3px; right: 3px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          border: none;
          color: #fff;
          font-size: 11px;
          line-height: 1;
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          transition: background 0.1s;
        }
        .img-thumb:hover .img-thumb-remove { display: flex; }
        .img-thumb-remove:hover { background: var(--danger); }
      `}</style>
      <div className={`img-thumb${selected ? ' selected' : ''}`} onClick={onClick}>
        <img src={item.src} alt={item.name} />
        <div className="img-thumb-overlay">
          <span className="img-thumb-name">{name}</span>
          {item.processed && <span className="img-thumb-badge">✓</span>}
        </div>
        <button
          className="img-thumb-remove"
          onClick={e => { e.stopPropagation(); onRemove(item.id) }}
          title="Remove"
        >
          ×
        </button>
      </div>
    </>
  )
}

interface ImageListProps {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onAdd: (files: File[]) => void
}

export function ImageList({ images, selectedId, onSelect, onRemove, onAdd }: ImageListProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'))
    if (files.length) onAdd(files)
    e.target.value = ''
  }

  return (
    <>
      <style>{`
        .image-list {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 12px 8px;
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text3);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .count-badge {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0 6px;
          font-size: 10px;
          color: var(--text2);
          margin-left: 4px;
        }
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text2);
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
        }
        .icon-btn:hover { background: var(--bg3); color: var(--accent); }
        .thumb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-content: start;
          gap: 6px;
          padding: 8px;
          overflow-y: auto;
          flex: 1;
        }
        .thumb-grid::-webkit-scrollbar { width: 3px; }
        .thumb-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
      `}</style>
      <div className="image-list">
        <div className="panel-header">
          <span>
            Images <span className="count-badge">{images.length}</span>
          </span>
          <button className="icon-btn" onClick={() => inputRef.current?.click()} title="Add more images">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInput}
        />
        <div className="thumb-grid">
          {images.map(img => (
            <ImageThumb
              key={img.id}
              item={img}
              selected={img.id === selectedId}
              onClick={() => onSelect(img.id)}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </>
  )
}
