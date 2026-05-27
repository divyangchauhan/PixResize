import { useState, useRef, useCallback, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Navbar } from '@/components/Navbar'
import { Layout } from '@/components/Layout'
import { UploadZone } from '@/components/UploadZone'
import { ImageList } from '@/components/ImageList'
import { CropOverlay } from '@/components/CropOverlay'
import type { CropRect } from '@/components/CropOverlay'
import { PreviewPanel } from '@/components/PreviewPanel'
import { ActionBar } from '@/components/ActionBar'
import { ControlStyles } from '@/components/controls/primitives'
import { ResizeSection } from '@/components/controls/ResizeSection'
import { OutputSection } from '@/components/controls/OutputSection'
import { TransformSection } from '@/components/controls/TransformSection'
import { AdjustmentsSection } from '@/components/controls/AdjustmentsSection'
import { WatermarkSection } from '@/components/controls/WatermarkSection'
import { useSizeEstimate } from '@/hooks/useSizeEstimate'
import { processImage } from '@/utils/imageProcessing'
import type { ImageItem, Settings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

const MAX_IMAGES = 20
const MAX_HISTORY = 50

function loadImageFile(file: File): Promise<ImageItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const img = new Image()
      img.onload = () => {
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          src,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          processed: false,
          settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
        })
      }
      img.onerror = reject
      img.src = src
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function checkAvifSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    canvas.toBlob((blob) => resolve(!!blob && blob.size > 0), 'image/avif')
  })
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cropActive, setCropActive] = useState(false)

  // Per-image undo/redo history: keyed by image id
  const historyRef = useRef<Record<string, { stack: Settings[]; idx: number }>>({})

  // Canvas preview state
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null)
  const [processing, setProcessing] = useState(false)
  const processTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Force re-render for undo/redo availability
  const [, forceUpdate] = useState(0)

  const selectedImage = images.find((img) => img.id === selectedId) ?? null
  const sizeEstimate = useSizeEstimate(
    selectedImage?.src ?? null,
    selectedImage?.settings ?? null,
  )

  // Trigger canvas processing whenever selected image or its settings change
  useEffect(() => {
    if (!selectedImage) {
      setProcessedCanvas(null)
      return
    }
    if (processTimerRef.current) clearTimeout(processTimerRef.current)
    setProcessing(true)
    processTimerRef.current = setTimeout(async () => {
      try {
        const canvas = await processImage(selectedImage.src, selectedImage.settings)
        setProcessedCanvas(canvas)
      } catch {
        setProcessedCanvas(null)
      } finally {
        setProcessing(false)
      }
    }, 200)
    return () => {
      if (processTimerRef.current) clearTimeout(processTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage?.id, selectedImage?.settings])

  const addImages = async (files: File[]) => {
    const available = MAX_IMAGES - images.length
    let batch = files
    if (batch.length > available) {
      alert(`Maximum ${MAX_IMAGES} images. Only the first ${available} were added.`)
      batch = batch.slice(0, available)
    }
    if (!batch.length) return
    const newItems = await Promise.all(batch.map(loadImageFile))
    // Initialise history for each new image
    newItems.forEach((item) => {
      historyRef.current[item.id] = {
        stack: [JSON.parse(JSON.stringify(item.settings))],
        idx: 0,
      }
    })
    setImages((prev) => [...prev, ...newItems])
    if (!selectedId) setSelectedId(newItems[0].id)
  }

  const removeImage = (id: string) => {
    delete historyRef.current[id]
    setImages((prev) => prev.filter((img) => img.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const onToggleCrop = () => {
    const next = !cropActive
    setCropActive(next)
    if (!selectedImage) return
    if (next) {
      if (!selectedImage.settings.transform.crop) {
        const w = Math.round(selectedImage.width * 0.8)
        const h = Math.round(selectedImage.height * 0.8)
        const x = Math.round((selectedImage.width - w) / 2)
        const y = Math.round((selectedImage.height - h) / 2)
        updateSettings({
          ...selectedImage.settings,
          transform: { ...selectedImage.settings.transform, crop: { x, y, w, h } },
        })
      }
    } else {
      updateSettings({
        ...selectedImage.settings,
        transform: { ...selectedImage.settings.transform, crop: null },
      })
    }
  }

  const onCropChange = (c: CropRect | null) => {
    if (!selectedImage) return
    updateSettings({
      ...selectedImage.settings,
      transform: { ...selectedImage.settings.transform, crop: c },
    })
  }

  const updateSettings = useCallback(
    async (next: Settings) => {
      if (!selectedImage) return
      let resolved = next
      if (next.output.format === 'avif' && selectedImage.settings.output.format !== 'avif') {
        const supported = await checkAvifSupport()
        if (!supported) {
          console.warn('AVIF encode not supported in this browser; falling back to webp.')
          resolved = { ...next, output: { ...next.output, format: 'webp' } }
        }
      }

      // Push to history
      const hist = historyRef.current[selectedImage.id]
      if (hist) {
        const truncated = hist.stack.slice(0, hist.idx + 1)
        truncated.push(JSON.parse(JSON.stringify(resolved)))
        if (truncated.length > MAX_HISTORY) truncated.shift()
        hist.stack = truncated
        hist.idx = truncated.length - 1
      }

      setImages((prev) =>
        prev.map((img) => (img.id === selectedImage.id ? { ...img, settings: resolved } : img)),
      )
      forceUpdate((n) => n + 1)
    },
    [selectedImage],
  )

  const undo = useCallback(() => {
    if (!selectedImage) return
    const hist = historyRef.current[selectedImage.id]
    if (!hist || hist.idx <= 0) return
    hist.idx -= 1
    const settings = JSON.parse(JSON.stringify(hist.stack[hist.idx])) as Settings
    setImages((prev) =>
      prev.map((img) => (img.id === selectedImage.id ? { ...img, settings } : img)),
    )
    forceUpdate((n) => n + 1)
  }, [selectedImage])

  const redo = useCallback(() => {
    if (!selectedImage) return
    const hist = historyRef.current[selectedImage.id]
    if (!hist || hist.idx >= hist.stack.length - 1) return
    hist.idx += 1
    const settings = JSON.parse(JSON.stringify(hist.stack[hist.idx])) as Settings
    setImages((prev) =>
      prev.map((img) => (img.id === selectedImage.id ? { ...img, settings } : img)),
    )
    forceUpdate((n) => n + 1)
  }, [selectedImage])

  const reset = useCallback(() => {
    if (!selectedImage) return
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as Settings
    updateSettings(fresh)
    setCropActive(false)
  }, [selectedImage, updateSettings])

  // Copy the selected image's settings to every other image in the batch.
  // Each target gets its own deep-clone so state is never shared.
  const applyToAll = useCallback(() => {
    if (!selectedImage || images.length < 2) return
    const settingsCopy = JSON.parse(JSON.stringify(selectedImage.settings)) as Settings
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === selectedImage.id) return img
        // Push a new history entry for each affected image
        const hist = historyRef.current[img.id]
        if (hist) {
          const truncated = hist.stack.slice(0, hist.idx + 1)
          truncated.push(JSON.parse(JSON.stringify(settingsCopy)))
          if (truncated.length > MAX_HISTORY) truncated.shift()
          hist.stack = truncated
          hist.idx = truncated.length - 1
        }
        return { ...img, settings: JSON.parse(JSON.stringify(settingsCopy)) }
      }),
    )
    forceUpdate((n) => n + 1)
  }, [selectedImage, images])

  const markProcessed = useCallback((ids: string[]) => {
    const set = new Set(ids)
    setImages((prev) => prev.map((img) => (set.has(img.id) ? { ...img, processed: true } : img)))
  }, [])

  const hist = selectedImage ? historyRef.current[selectedImage.id] : null
  const canUndo = !!hist && hist.idx > 0
  const canRedo = !!hist && hist.idx < hist.stack.length - 1

  // ── Left panel: image list (or upload zone when empty) ────────────────────
  const leftContent =
    images.length === 0 ? (
      <div className="flex items-center justify-center h-full p-3">
        <UploadZone onFiles={addImages} />
      </div>
    ) : (
      <ImageList
        images={images}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRemove={removeImage}
        onAdd={addImages}
      />
    )

  // ── Center panel: preview canvas ──────────────────────────────────────────
  const previewRef = useRef<HTMLDivElement | null>(null)
  const roRef = useRef<ResizeObserver | null>(null)
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 })

  const previewCallback = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect()
    if (!node) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setPreviewSize({ w: width, h: height })
    })
    ro.observe(node)
    roRef.current = ro
    previewRef.current = node
  }, [])

  const centerContent =
    images.length === 0 ? null : cropActive && selectedImage && previewSize.w > 0 ? (
      (() => {
        const scale = Math.min(
          previewSize.w / selectedImage.width,
          previewSize.h / selectedImage.height,
        )
        const frameW = Math.floor(selectedImage.width * scale)
        const frameH = Math.floor(selectedImage.height * scale)
        return (
          <div
            ref={previewCallback}
            className="flex-1 min-h-0 flex items-center justify-center overflow-hidden"
          >
            <div style={{ position: 'relative', width: frameW, height: frameH, flexShrink: 0 }}>
              {/* Image sits behind the crop overlay */}
              <img
                src={selectedImage.src}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  display: 'block',
                  userSelect: 'none',
                }}
              />
              <CropOverlay
                imgW={selectedImage.width}
                imgH={selectedImage.height}
                crop={selectedImage.settings.transform.crop}
                onChange={onCropChange}
              />
            </div>
          </div>
        )
      })()
    ) : (
      <div ref={previewCallback} className="flex-1 min-h-0 overflow-hidden">
        <PreviewPanel
          image={selectedImage}
          processedCanvas={processedCanvas}
          processing={processing}
        />
      </div>
    )

  // ── Right panel: controls ─────────────────────────────────────────────────
  const rightContent = selectedImage ? (
    <>
      <ControlStyles />
      <ResizeSection
        settings={selectedImage.settings}
        onChange={updateSettings}
        imgW={selectedImage.width}
        imgH={selectedImage.height}
      />
      <TransformSection
        settings={selectedImage.settings}
        onChange={updateSettings}
        cropActive={cropActive}
        onToggleCrop={onToggleCrop}
      />
      <AdjustmentsSection settings={selectedImage.settings} onChange={updateSettings} />
      <WatermarkSection settings={selectedImage.settings} onChange={updateSettings} />
      <OutputSection
        settings={selectedImage.settings}
        onChange={updateSettings}
        sizeEstimate={sizeEstimate}
      />
    </>
  ) : (
    <p className="p-4 text-sm" style={{ color: 'var(--text3)' }}>
      Select an image to edit.
    </p>
  )

  // ── Bottom bar: action bar ────────────────────────────────────────────────
  const bottomContent = (
    <ActionBar
      image={selectedImage}
      images={images}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={undo}
      onRedo={redo}
      onReset={reset}
      onApplyToAll={applyToAll}
      onMarkProcessed={markProcessed}
    />
  )

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <Navbar theme={theme} onToggleTheme={toggle} />
      <Layout
        left={leftContent}
        center={centerContent}
        right={rightContent}
        bottom={bottomContent}
      />
    </div>
  )
}
