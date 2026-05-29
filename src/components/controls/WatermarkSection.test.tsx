import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatermarkSection } from './WatermarkSection'
import { DEFAULT_SETTINGS } from '@/types'
import type { Settings } from '@/types'

const base: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

function renderSection(
  overrides: Partial<Settings['watermark']> = {},
  onChange = vi.fn(),
) {
  const settings: Settings = {
    ...base,
    watermark: { ...base.watermark, ...overrides },
  }
  return { onChange, ...render(<WatermarkSection settings={settings} onChange={onChange} />) }
}

function open() {
  fireEvent.click(screen.getByText('Watermark').closest('button') as HTMLElement)
}

describe('WatermarkSection', () => {
  it('renders the section title', () => {
    renderSection()
    expect(screen.getByText('Watermark')).toBeInTheDocument()
  })

  it('is collapsed by default', () => {
    renderSection()
    expect(screen.queryByRole('switch', { name: /text watermark/i })).not.toBeInTheDocument()
  })

  it('expands when the header is clicked', () => {
    renderSection()
    open()
    expect(screen.getByRole('switch', { name: /text watermark/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /logo watermark/i })).toBeInTheDocument()
  })

  it('collapses again when header is clicked twice', () => {
    renderSection()
    open()
    open()
    expect(screen.queryByRole('switch', { name: /text watermark/i })).not.toBeInTheDocument()
  })

  it('text watermark toggle calls onChange with textEnabled: true', () => {
    const { onChange } = renderSection({ textEnabled: false })
    open()
    fireEvent.click(screen.getByRole('switch', { name: /text watermark/i }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        watermark: expect.objectContaining({ textEnabled: true }),
      }),
    )
  })

  it('shows text sub-section when textEnabled is true', () => {
    renderSection({ textEnabled: true })
    open()
    expect(screen.getByPlaceholderText('Watermark text…')).toBeInTheDocument()
    expect(screen.getByLabelText('Size')).toBeInTheDocument()
    expect(screen.getByLabelText('Opacity')).toBeInTheDocument()
  })

  it('hides text sub-section when textEnabled is false', () => {
    renderSection({ textEnabled: false })
    open()
    expect(screen.queryByPlaceholderText('Watermark text…')).not.toBeInTheDocument()
  })

  it('updating the text input calls onChange with new text', () => {
    const { onChange } = renderSection({ textEnabled: true, text: '' })
    open()
    fireEvent.change(screen.getByPlaceholderText('Watermark text…'), {
      target: { value: 'Hello' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        watermark: expect.objectContaining({ text: 'Hello' }),
      }),
    )
  })

  it('text size slider calls onChange with new textSize', () => {
    const { onChange } = renderSection({ textEnabled: true, textSize: 32 })
    open()
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: '64' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        watermark: expect.objectContaining({ textSize: 64 }),
      }),
    )
  })

  it('text opacity slider calls onChange with new textOpacity', () => {
    const { onChange } = renderSection({ textEnabled: true, textOpacity: 80 })
    open()
    fireEvent.change(screen.getByLabelText('Opacity'), { target: { value: '50' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        watermark: expect.objectContaining({ textOpacity: 50 }),
      }),
    )
  })

  it('text position select calls onChange with new textPosition', () => {
    const { onChange } = renderSection({ textEnabled: true, textPosition: 'bottom-right' })
    open()
    fireEvent.change(screen.getByDisplayValue('bottom right'), { target: { value: 'top-left' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        watermark: expect.objectContaining({ textPosition: 'top-left' }),
      }),
    )
  })

  it('logo watermark toggle calls onChange with logoEnabled: true', () => {
    const { onChange } = renderSection({ logoEnabled: false })
    open()
    fireEvent.click(screen.getByRole('switch', { name: /logo watermark/i }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        watermark: expect.objectContaining({ logoEnabled: true }),
      }),
    )
  })

  it('shows upload button when logoEnabled is true', () => {
    renderSection({ logoEnabled: true, logoSrc: null })
    open()
    expect(screen.getByText('+ Upload logo image')).toBeInTheDocument()
  })

  it('shows replace button when logo is already set', () => {
    renderSection({ logoEnabled: true, logoSrc: 'data:image/png;base64,abc' })
    open()
    expect(screen.getByText('↺ Replace logo')).toBeInTheDocument()
  })

  it('hides logo sub-section when logoEnabled is false', () => {
    renderSection({ logoEnabled: false })
    open()
    expect(screen.queryByText('+ Upload logo image')).not.toBeInTheDocument()
  })
})
