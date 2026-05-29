import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransformSection } from './TransformSection'
import { DEFAULT_SETTINGS } from '@/types'
import type { Settings } from '@/types'

const base: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

function renderSection(
  overrides: Partial<Settings['transform']> = {},
  { cropActive = false, onToggleCrop = vi.fn(), onChange = vi.fn() } = {},
) {
  const settings: Settings = {
    ...base,
    transform: { ...base.transform, ...overrides },
  }
  return {
    onChange,
    onToggleCrop,
    ...render(
      <TransformSection
        settings={settings}
        onChange={onChange}
        cropActive={cropActive}
        onToggleCrop={onToggleCrop}
      />,
    ),
  }
}

function open(page = screen) {
  fireEvent.click(page.getByText('Transform').closest('button') as HTMLElement)
}

describe('TransformSection', () => {
  it('renders the section title', () => {
    renderSection()
    expect(screen.getByText('Transform')).toBeInTheDocument()
  })

  it('is collapsed by default', () => {
    renderSection()
    expect(screen.queryByText('Rotate')).not.toBeInTheDocument()
  })

  it('expands when the header is clicked', () => {
    renderSection()
    open()
    expect(screen.getByText('Rotate')).toBeInTheDocument()
    expect(screen.getByText('Flip')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /crop/i })).toBeInTheDocument()
  })

  it('collapses again when the header is clicked twice', () => {
    renderSection()
    open()
    open()
    expect(screen.queryByText('Rotate')).not.toBeInTheDocument()
  })

  it('calls onToggleCrop when the Crop toggle is clicked', () => {
    const { onToggleCrop } = renderSection({}, { cropActive: false })
    open()
    fireEvent.click(screen.getByRole('switch', { name: /crop/i }))
    expect(onToggleCrop).toHaveBeenCalledOnce()
  })

  it('reflects cropActive=true on the Crop toggle', () => {
    renderSection({}, { cropActive: true })
    open()
    expect(screen.getByRole('switch', { name: /crop/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('rotate CW adds 90 degrees', () => {
    const { onChange } = renderSection({ rotation: 0 })
    open()
    fireEvent.click(screen.getByText('CW'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        transform: expect.objectContaining({ rotation: 90 }),
      }),
    )
  })

  it('rotate CCW subtracts 90 degrees (wraps to 270)', () => {
    const { onChange } = renderSection({ rotation: 0 })
    open()
    fireEvent.click(screen.getByText('CCW'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        transform: expect.objectContaining({ rotation: 270 }),
      }),
    )
  })

  it('rotate 180° adds 180 degrees', () => {
    const { onChange } = renderSection({ rotation: 90 })
    open()
    fireEvent.click(screen.getByText('180°'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        transform: expect.objectContaining({ rotation: 270 }),
      }),
    )
  })

  it('flip Horizontal toggles flipH', () => {
    const { onChange } = renderSection({ flipH: false })
    open()
    fireEvent.click(screen.getByText('Horizontal'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        transform: expect.objectContaining({ flipH: true }),
      }),
    )
  })

  it('flip Vertical toggles flipV', () => {
    const { onChange } = renderSection({ flipV: false })
    open()
    fireEvent.click(screen.getByText('Vertical'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        transform: expect.objectContaining({ flipV: true }),
      }),
    )
  })

  it('shows rotation hint when rotation is non-zero', () => {
    renderSection({ rotation: 90 })
    open()
    expect(screen.getByText('Rotation: 90°')).toBeInTheDocument()
  })

  it('hides rotation hint when rotation is 0', () => {
    renderSection({ rotation: 0 })
    open()
    expect(screen.queryByText(/Rotation:/)).not.toBeInTheDocument()
  })
})
