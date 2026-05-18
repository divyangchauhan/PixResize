import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Navbar } from '@/components/Navbar'
import { Layout } from '@/components/Layout'
import { UploadZone } from '@/components/UploadZone'
import { ImageList } from '@/components/ImageList'
import { ControlStyles } from '@/components/controls/primitives'
import { ResizeSection } from '@/components/controls/ResizeSection'
import { OutputSection } from '@/components/controls/OutputSection'
import { useSizeEstimate } from '@/hooks/useSizeEstimate'
import type { ImageItem, Settings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

const MAX_IMAGES = 20

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

  const selectedImage = images.find((img) => img.id === selectedId) ?? null
  const sizeEstimate = useSizeEstimate(
    selectedImage?.src ?? null,
    selectedImage?.settings ?? null,
  )

  const addImages = async (files: File[]) => {
    const available = MAX_IMAGES - images.length
    let batch = files
    if (batch.length > available) {
      alert(`Maximum ${MAX_IMAGES} images. Only the first ${available} were added.`)
      batch = batch.slice(0, available)
    }
    if (!batch.length) return
    const newItems = await Promise.all(batch.map(loadImageFile))
    setImages((prev) => [...prev, ...newItems])
    if (!selectedId) setSelectedId(newItems[0].id)
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const updateSettings = async (next: Settings) => {
    if (!selectedImage) return
    let resolved = next
    if (next.output.format === 'avif' && selectedImage.settings.output.format !== 'avif') {
      const supported = await checkAvifSupport()
      if (!supported) {
        console.warn('AVIF encode not supported in this browser; falling back to webp.')
        resolved = { ...next, output: { ...next.output, format: 'webp' } }
      }
    }
    setImages((prev) =>
      prev.map((img) => (img.id === selectedImage.id ? { ...img, settings: resolved } : img)),
    )
  }

  const sidebarContent = selectedImage ? (
    <>
      <ControlStyles />
      <ResizeSection
        settings={selectedImage.settings}
        onChange={updateSettings}
        imgW={selectedImage.width}
        imgH={selectedImage.height}
      />
      <OutputSection
        settings={selectedImage.settings}
        onChange={updateSettings}
        sizeEstimate={sizeEstimate}
      />
    </>
  ) : (
    <p className="p-4 text-sm text-[var(--text3)]">
      Select an image to edit.
    </p>
  )

  const mainContent =
    images.length === 0 ? (
      <div className="flex items-center justify-center h-full">
        <UploadZone onFiles={addImages} />
      </div>
    ) : (
      <div className="flex flex-col h-full">
        <ImageList
          images={images}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRemove={removeImage}
          onAdd={addImages}
        />
        <div className="flex-1 flex items-center justify-center text-[var(--text3)] text-sm">
          Preview coming in PR 7
        </div>
      </div>
    )

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar theme={theme} onToggleTheme={toggle} />
      <Layout sidebar={sidebarContent} main={mainContent} />
    </div>
  )
}
