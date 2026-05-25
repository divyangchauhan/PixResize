import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OutputSection } from './OutputSection'
import { DEFAULT_SETTINGS } from '@/types'
import type { Settings } from '@/types'

// formatBytes is used inside the component for the size-estimate display
vi.mock('@/utils/imageProcessing', () => ({
  formatBytes: (n: number) => `${(n / 1024).toFixed(1)} KB`,
}))

const base: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

function renderSection(
  overrides: Partial<Settings['output']> = {},
  sizeEstimate = 0,
  onChange = vi.fn(),
) {
  const settings: Settings = { ...base, output: { ...base.output, ...overrides } }
  return {
    onChange,
    ...render(<OutputSection settings={settings} onChange={onChange} sizeEstimate={sizeEstimate} />),
  }
}

describe('OutputSection', () => {
  it('renders section header', () => {
    renderSection()
    expect(screen.getByText('Output')).toBeInTheDocument()
  })

  it('shows format buttons (JPG PNG WEBP AVIF)', () => {
    renderSection()
    ;['JPG', 'PNG', 'WEBP', 'AVIF'].forEach((f) => {
      expect(screen.getByText(f)).toBeInTheDocument()
    })
  })

  it('calls onChange when format is changed to PNG', () => {
    const { onChange } = renderSection()
    fireEvent.click(screen.getByText('PNG'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ output: expect.objectContaining({ format: 'png' }) }),
    )
  })

  it('shows quality slider for lossy formats', () => {
    renderSection({ format: 'jpg' })
    expect(screen.getByText('Quality')).toBeInTheDocument()
  })

  it('hides quality slider for PNG (lossless)', () => {
    renderSection({ format: 'png' })
    expect(screen.queryByText('Quality')).not.toBeInTheDocument()
  })

  it('shows size estimate when provided', () => {
    renderSection({}, 51200)
    expect(screen.getByText(/est\. size/i)).toBeInTheDocument()
  })

  it('does not show size estimate when 0', () => {
    renderSection({}, 0)
    expect(screen.queryByText(/est\. size/i)).not.toBeInTheDocument()
  })

  it('updates filename template', () => {
    const { onChange } = renderSection()
    const input = screen.getByPlaceholderText('{name}_{index}')
    fireEvent.change(input, { target: { value: '{name}_resized' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ output: expect.objectContaining({ filename: '{name}_resized' }) }),
    )
  })

  it('collapses when header is toggled', () => {
    renderSection()
    fireEvent.click(screen.getByText('Output').closest('button') as HTMLElement)
    expect(screen.queryByText('Format')).not.toBeInTheDocument()
  })
})
