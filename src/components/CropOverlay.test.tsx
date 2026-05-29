import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CropOverlay } from './CropOverlay'
import type { CropRect } from './CropOverlay'

const noop = vi.fn()

describe('CropOverlay', () => {
  it('renders 8 resize handles', () => {
    const { container } = render(
      <CropOverlay imgW={800} imgH={600} crop={null} onChange={noop} />,
    )
    // Each handle is a div with cursor set to *-resize
    const handles = container.querySelectorAll('[style*="-resize"]')
    expect(handles).toHaveLength(8)
  })

  it('renders a dimension tooltip showing w × h', () => {
    const crop: CropRect = { x: 0, y: 0, w: 400, h: 300 }
    render(<CropOverlay imgW={800} imgH={600} crop={crop} onChange={noop} />)
    expect(screen.getByText('400 × 300')).toBeInTheDocument()
  })

  it('falls back to full image size when crop is null', () => {
    render(<CropOverlay imgW={800} imgH={600} crop={null} onChange={noop} />)
    expect(screen.getByText('800 × 600')).toBeInTheDocument()
  })

  it('renders 4 dark mask panels', () => {
    const { container } = render(
      <CropOverlay imgW={800} imgH={600} crop={null} onChange={noop} />,
    )
    // jsdom normalises rgba(0,0,0,0.45) → rgba(0, 0, 0, 0.45) (adds spaces)
    const masks = Array.from(container.querySelectorAll('div')).filter((el) =>
      (el as HTMLElement).style.background?.includes('rgba(0'),
    )
    expect(masks.length).toBeGreaterThanOrEqual(4)
  })

  it('renders a move-cursor selection rect', () => {
    const { container } = render(
      <CropOverlay imgW={800} imgH={600} crop={null} onChange={noop} />,
    )
    const moveRect = container.querySelector('[style*="cursor: move"]')
    expect(moveRect).toBeTruthy()
  })

  it('tooltip updates when crop rect changes', () => {
    const crop: CropRect = { x: 10, y: 10, w: 200, h: 150 }
    render(<CropOverlay imgW={800} imgH={600} crop={crop} onChange={noop} />)
    expect(screen.getByText('200 × 150')).toBeInTheDocument()
  })
})
