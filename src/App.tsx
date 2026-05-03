import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Navbar } from '@/components/Navbar'
import { Layout } from '@/components/Layout'
import { UploadZone } from '@/components/UploadZone'
import { ImageList } from '@/components/ImageList'
import type { ImageItem } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

const MAX_IMAGES = 50

function SidebarPlaceholder() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        Tools
      </p>
      {['Resize', 'Crop', 'Rotate & Flip', 'Filters', 'Watermark', 'Download'].map((item) => (
        <button
          key={item}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--bg3)] transition-colors"
        >
          {item}
        </button>
      ))}
    </div>
  )
}

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

export default function App() {
  const { theme, toggle } = useTheme()
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addImages = async (files: File[]) => {
    const available = MAX_IMAGES - images.length
    let batch = files
    if (batch.length > available) {
      alert(`Maximum 50 images. Only the first ${available} were added.`)
      batch = batch.slice(0, available)
    }
    if (!batch.length) return
    const newItems = await Promise.all(batch.map(loadImageFile))
    setImages(prev => [...prev, ...newItems])
    if (!selectedId) setSelectedId(newItems[0].id)
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

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
          Editor coming in PR 3
        </div>
      </div>
    )

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar theme={theme} onToggleTheme={toggle} />
      <Layout sidebar={<SidebarPlaceholder />} main={mainContent} />
    </div>
  )
}
