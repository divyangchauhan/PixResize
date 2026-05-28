import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActionBar } from './ActionBar'
import type { ImageItem } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

// Stub heavy processing so tests run fast
vi.mock('@/utils/imageProcessing', () => ({
  processImage: vi.fn().mockResolvedValue(document.createElement('canvas')),
  canvasToBlob: vi.fn().mockResolvedValue(new Blob(['img'], { type: 'image/jpeg' })),
  formatBytes: (n: number) => `${n} B`,
}))

// Stub fflate
vi.mock('fflate', () => ({
  zipSync: vi.fn().mockReturnValue(new Uint8Array([80, 75])),
}))

const makeImage = (overrides: Partial<ImageItem> = {}): ImageItem => ({
  id: 'img-1',
  name: 'photo.jpg',
  src: 'data:image/jpeg;base64,stub',
  size: 10_000,
  width: 800,
  height: 600,
  processed: false,
  settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
  ...overrides,
})

const defaultProps = {
  image: makeImage(),
  images: [makeImage()],
  canUndo: false,
  canRedo: false,
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  onReset: vi.fn(),
  onApplyToAll: vi.fn(),
  onMarkProcessed: vi.fn(),
}

describe('ActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Stub URL methods used for download
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:stub'),
      revokeObjectURL: vi.fn(),
    })
    // Stub clipboard
    vi.stubGlobal('navigator', {
      clipboard: {
        write: vi.fn().mockResolvedValue(undefined),
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders undo, redo, and reset buttons', () => {
    render(<ActionBar {...defaultProps} />)
    expect(screen.getByTitle('Undo')).toBeInTheDocument()
    expect(screen.getByTitle('Redo')).toBeInTheDocument()
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })

  it('undo button is disabled when canUndo=false', () => {
    render(<ActionBar {...defaultProps} canUndo={false} />)
    expect(screen.getByTitle('Undo')).toBeDisabled()
  })

  it('undo button is enabled when canUndo=true', () => {
    render(<ActionBar {...defaultProps} canUndo={true} />)
    expect(screen.getByTitle('Undo')).not.toBeDisabled()
  })

  it('calls onUndo when undo is clicked', () => {
    const onUndo = vi.fn()
    render(<ActionBar {...defaultProps} canUndo={true} onUndo={onUndo} />)
    fireEvent.click(screen.getByTitle('Undo'))
    expect(onUndo).toHaveBeenCalledOnce()
  })

  it('calls onRedo when redo is clicked', () => {
    const onRedo = vi.fn()
    render(<ActionBar {...defaultProps} canRedo={true} onRedo={onRedo} />)
    fireEvent.click(screen.getByTitle('Redo'))
    expect(onRedo).toHaveBeenCalledOnce()
  })

  it('calls onReset when Reset is clicked', () => {
    const onReset = vi.fn()
    render(<ActionBar {...defaultProps} onReset={onReset} />)
    fireEvent.click(screen.getByText('Reset'))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('renders Download and ZIP buttons', () => {
    render(<ActionBar {...defaultProps} />)
    expect(screen.getByTitle('Download current image')).toBeInTheDocument()
    expect(screen.getByTitle('Bulk download as ZIP')).toBeInTheDocument()
  })

  it('Download button is disabled when no image is selected', () => {
    render(<ActionBar {...defaultProps} image={null} />)
    expect(screen.getByTitle('Download current image')).toBeDisabled()
  })

  it('opens Base64 modal on click', async () => {
    render(<ActionBar {...defaultProps} />)
    fireEvent.click(screen.getByText('Base64'))
    await waitFor(() => {
      expect(screen.getByText('Base64 Export')).toBeInTheDocument()
    })
  })

  it('closes Base64 modal via × button', async () => {
    render(<ActionBar {...defaultProps} />)
    fireEvent.click(screen.getByText('Base64'))
    await waitFor(() => expect(screen.getByText('Base64 Export')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '×' }))
    expect(screen.queryByText('Base64 Export')).not.toBeInTheDocument()
  })

  it('ZIP button label shows image count', () => {
    const images = [makeImage(), makeImage({ id: 'img-2' })]
    render(<ActionBar {...defaultProps} images={images} />)
    expect(screen.getByText(/ZIP \(2\)/)).toBeInTheDocument()
  })

  // ── Apply to All ──────────────────────────────────────────────────────────
  it('renders Apply to All button', () => {
    render(<ActionBar {...defaultProps} />)
    expect(screen.getByTitle('Apply current settings to all images')).toBeInTheDocument()
  })

  it('Apply to All is disabled with only one image', () => {
    render(<ActionBar {...defaultProps} images={[makeImage()]} />)
    expect(screen.getByTitle('Apply current settings to all images')).toBeDisabled()
  })

  it('Apply to All is enabled when multiple images are loaded', () => {
    const images = [makeImage(), makeImage({ id: 'img-2' })]
    render(<ActionBar {...defaultProps} images={images} />)
    expect(screen.getByTitle('Apply current settings to all images')).not.toBeDisabled()
  })

  it('calls onApplyToAll when Apply to All is clicked', () => {
    const onApplyToAll = vi.fn()
    const images = [makeImage(), makeImage({ id: 'img-2' })]
    render(<ActionBar {...defaultProps} images={images} onApplyToAll={onApplyToAll} />)
    fireEvent.click(screen.getByTitle('Apply current settings to all images'))
    expect(onApplyToAll).toHaveBeenCalledOnce()
  })

  it('Apply to All is disabled when no image is selected', () => {
    const images = [makeImage(), makeImage({ id: 'img-2' })]
    render(<ActionBar {...defaultProps} image={null} images={images} />)
    expect(screen.getByTitle('Apply current settings to all images')).toBeDisabled()
  })
})
