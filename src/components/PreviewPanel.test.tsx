import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { PreviewPanel } from './PreviewPanel'
import type { ImageItem } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

vi.mock('@/utils/imageProcessing', () => ({
  formatBytes: (n: number) => `${n} B`,
}))

const makeImage = (overrides: Partial<ImageItem> = {}): ImageItem => ({
  id: 'img-1',
  name: 'photo.jpg',
  src: 'data:image/jpeg;base64,stub',
  size: 20_480,
  width: 800,
  height: 600,
  processed: false,
  settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
  ...overrides,
})

function makeCanvas(w = 400, h = 300): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

describe('PreviewPanel', () => {
  it('shows empty state when no image is provided', () => {
    render(<PreviewPanel image={null} processedCanvas={null} processing={false} />)
    expect(screen.getByText('No image selected')).toBeInTheDocument()
  })

  it('shows image dimensions chip in toolbar', () => {
    render(<PreviewPanel image={makeImage()} processedCanvas={null} processing={false} />)
    expect(screen.getByText('800 × 600')).toBeInTheDocument()
  })

  it('shows file size chip in toolbar', () => {
    render(<PreviewPanel image={makeImage()} processedCanvas={null} processing={false} />)
    expect(screen.getByText('20480 B')).toBeInTheDocument()
  })

  it('renders a <canvas> element when processedCanvas is provided', async () => {
    const canvas = makeCanvas()
    render(<PreviewPanel image={makeImage()} processedCanvas={canvas} processing={false} />)

    // The display canvas should be in the DOM
    const canvases = document.querySelectorAll('canvas')
    expect(canvases.length).toBeGreaterThan(0)
  })

  it('sets display canvas dimensions to match processedCanvas', async () => {
    const canvas = makeCanvas(640, 480)
    render(<PreviewPanel image={makeImage()} processedCanvas={canvas} processing={false} />)

    const displayCanvas = document.querySelector('canvas[aria-label="Processed image"]') as HTMLCanvasElement
    expect(displayCanvas).not.toBeNull()
    expect(displayCanvas.width).toBe(640)
    expect(displayCanvas.height).toBe(480)
  })

  it('falls back to <img> when processedCanvas is null', () => {
    const img = makeImage()
    render(<PreviewPanel image={img} processedCanvas={null} processing={false} />)
    const imgEl = screen.getByRole('img', { name: 'preview' })
    expect(imgEl).toBeInTheDocument()
    expect(imgEl).toHaveAttribute('src', img.src)
  })

  it('shows processing overlay when processing=true', () => {
    render(<PreviewPanel image={makeImage()} processedCanvas={null} processing={true} />)
    expect(screen.getByText('Processing…')).toBeInTheDocument()
  })

  it('shows Before/After button', () => {
    render(<PreviewPanel image={makeImage()} processedCanvas={null} processing={false} />)
    expect(screen.getByTitle('Before/After comparison')).toBeInTheDocument()
  })

  it('toggles Before/After mode on button click', () => {
    render(<PreviewPanel image={makeImage()} processedCanvas={null} processing={false} />)
    const btn = screen.getByTitle('Before/After comparison')
    expect(btn).not.toHaveClass('active')
    act(() => btn.click())
    expect(btn).toHaveClass('active')
  })

  it('updates display canvas when processedCanvas prop changes', async () => {
    const first = makeCanvas(200, 150)
    const { rerender } = render(
      <PreviewPanel image={makeImage()} processedCanvas={first} processing={false} />,
    )
    const displayCanvas = document.querySelector('canvas[aria-label="Processed image"]') as HTMLCanvasElement
    expect(displayCanvas.width).toBe(200)

    const second = makeCanvas(1920, 1080)
    rerender(<PreviewPanel image={makeImage()} processedCanvas={second} processing={false} />)
    expect(displayCanvas.width).toBe(1920)
    expect(displayCanvas.height).toBe(1080)
  })
})
