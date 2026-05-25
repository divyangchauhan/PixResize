import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdjustmentsSection } from './AdjustmentsSection'
import { DEFAULT_SETTINGS } from '@/types'
import type { Settings } from '@/types'

const base: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

function renderSection(overrides: Partial<Settings['adjustments']> = {}, onChange = vi.fn()) {
  const settings: Settings = {
    ...base,
    adjustments: { ...base.adjustments, ...overrides },
  }
  return { onChange, ...render(<AdjustmentsSection settings={settings} onChange={onChange} />) }
}

describe('AdjustmentsSection', () => {
  it('renders section header', () => {
    renderSection()
    expect(screen.getByText('Adjustments')).toBeInTheDocument()
  })

  it('section is collapsed by default (sliders not visible)', () => {
    renderSection()
    expect(screen.queryByText('Brightness')).not.toBeInTheDocument()
  })

  it('expands when header is clicked', () => {
    renderSection()
    fireEvent.click(screen.getByText('Adjustments').closest('button') as HTMLElement)
    expect(screen.getByText('Brightness')).toBeInTheDocument()
    expect(screen.getByText('Contrast')).toBeInTheDocument()
    expect(screen.getByText('Blur')).toBeInTheDocument()
  })

  it('calls onChange with updated brightness', () => {
    const { onChange } = renderSection()
    fireEvent.click(screen.getByText('Adjustments').closest('button') as HTMLElement)
    const slider = screen.getByLabelText('Brightness')
    fireEvent.change(slider, { target: { value: '150' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        adjustments: expect.objectContaining({ brightness: 150 }),
      }),
    )
  })

  it('calls onChange with updated contrast', () => {
    const { onChange } = renderSection()
    fireEvent.click(screen.getByText('Adjustments').closest('button') as HTMLElement)
    const slider = screen.getByLabelText('Contrast')
    fireEvent.change(slider, { target: { value: '130' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        adjustments: expect.objectContaining({ contrast: 130 }),
      }),
    )
  })

  it('toggles grayscale', () => {
    const { onChange } = renderSection()
    fireEvent.click(screen.getByText('Adjustments').closest('button') as HTMLElement)
    // Toggle is rendered as role="switch" (not checkbox)
    const toggle = screen.getByRole('switch', { name: /grayscale/i })
    fireEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        adjustments: expect.objectContaining({ grayscale: true }),
      }),
    )
  })
})
