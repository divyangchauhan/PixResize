import { useRef, useEffect } from 'react'

export type CropRect = { x: number; y: number; w: number; h: number }
type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move'

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

interface Props {
  imgW: number
  imgH: number
  crop: CropRect | null
  onChange: (c: CropRect | null) => void
}

export function CropOverlay({ imgW, imgH, crop, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Stable refs so the global mousemove/mouseup effect never needs to re-run
  const imgWRef = useRef(imgW)
  const imgHRef = useRef(imgH)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    imgWRef.current = imgW
    imgHRef.current = imgH
    onChangeRef.current = onChange
  })

  const dragRef = useRef<{
    handle: Handle
    startX: number
    startY: number
    startCrop: CropRect
  } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return
      const { handle, startX, startY, startCrop } = dragRef.current
      const cr = containerRef.current.getBoundingClientRect()
      const iw = imgWRef.current
      const ih = imgHRef.current
      const rawDx = ((e.clientX - startX) / cr.width) * iw
      const rawDy = ((e.clientY - startY) / cr.height) * ih

      let { x, y, w, h } = startCrop
      const right = x + w
      const bottom = y + h

      if (handle === 'move') {
        x = clamp(x + rawDx, 0, iw - w)
        y = clamp(y + rawDy, 0, ih - h)
      } else {
        if (handle === 'nw' || handle === 'w' || handle === 'sw') {
          const nx = clamp(x + rawDx, 0, right - 1)
          w = right - nx
          x = nx
        } else if (handle === 'ne' || handle === 'e' || handle === 'se') {
          const nr = clamp(right + rawDx, x + 1, iw)
          w = nr - x
        }
        if (handle === 'nw' || handle === 'n' || handle === 'ne') {
          const ny = clamp(y + rawDy, 0, bottom - 1)
          h = bottom - ny
          y = ny
        } else if (handle === 'sw' || handle === 's' || handle === 'se') {
          const nb = clamp(bottom + rawDy, y + 1, ih)
          h = nb - y
        }
      }

      onChangeRef.current({
        x: Math.round(x),
        y: Math.round(y),
        w: Math.max(1, Math.round(w)),
        h: Math.max(1, Math.round(h)),
      })
    }

    const onUp = () => { dragRef.current = null }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const c: CropRect = crop ?? { x: 0, y: 0, w: imgW, h: imgH }

  const pctX = (c.x / imgW) * 100
  const pctY = (c.y / imgH) * 100
  const pctW = (c.w / imgW) * 100
  const pctH = (c.h / imgH) * 100

  const startDrag = (e: React.MouseEvent, handle: Handle) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startCrop: { ...c } }
  }

  const handles: { id: Handle; left: string; top: string; cursor: string }[] = [
    { id: 'nw', left: `${pctX}%`,           top: `${pctY}%`,           cursor: 'nw-resize' },
    { id: 'n',  left: `${pctX + pctW / 2}%`,top: `${pctY}%`,           cursor: 'n-resize'  },
    { id: 'ne', left: `${pctX + pctW}%`,    top: `${pctY}%`,           cursor: 'ne-resize' },
    { id: 'e',  left: `${pctX + pctW}%`,    top: `${pctY + pctH / 2}%`,cursor: 'e-resize'  },
    { id: 'se', left: `${pctX + pctW}%`,    top: `${pctY + pctH}%`,    cursor: 'se-resize' },
    { id: 's',  left: `${pctX + pctW / 2}%`,top: `${pctY + pctH}%`,    cursor: 's-resize'  },
    { id: 'sw', left: `${pctX}%`,           top: `${pctY + pctH}%`,    cursor: 'sw-resize' },
    { id: 'w',  left: `${pctX}%`,           top: `${pctY + pctH / 2}%`,cursor: 'w-resize'  },
  ]

  const mask = 'rgba(0,0,0,0.45)'

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none' }}
    >
      {/* Dark mask outside selection */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${pctY}%`, background: mask }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${100 - pctY - pctH}%`, background: mask }} />
      <div style={{ position: 'absolute', top: `${pctY}%`, left: 0, width: `${pctX}%`, height: `${pctH}%`, background: mask }} />
      <div style={{ position: 'absolute', top: `${pctY}%`, right: 0, width: `${100 - pctX - pctW}%`, height: `${pctH}%`, background: mask }} />

      {/* Selection rect — drag interior to move */}
      <div
        style={{
          position: 'absolute',
          left: `${pctX}%`,
          top: `${pctY}%`,
          width: `${pctW}%`,
          height: `${pctH}%`,
          border: '1px dashed rgba(255,255,255,0.85)',
          cursor: 'move',
          boxSizing: 'border-box',
        }}
        onMouseDown={(e) => startDrag(e, 'move')}
      />

      {/* 8 resize handles */}
      {handles.map(({ id, left, top, cursor }) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left,
            top,
            width: 8,
            height: 8,
            background: 'white',
            border: '1px solid rgba(0,0,0,0.45)',
            borderRadius: 1,
            transform: 'translate(-50%, -50%)',
            cursor,
            zIndex: 1,
          }}
          onMouseDown={(e) => startDrag(e, id)}
        />
      ))}

      {/* Dimension tooltip */}
      <div
        style={{
          position: 'absolute',
          left: `${pctX + pctW / 2}%`,
          top: `${pctY}%`,
          transform: 'translate(-50%, calc(-100% - 6px))',
          background: 'rgba(0,0,0,0.72)',
          color: 'white',
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 3,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {c.w} × {c.h}
      </div>
    </div>
  )
}
