import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResizeSection } from './ResizeSection'
import { DEFAULT_SETTINGS } from '@/types'
import type { Settings } from '@/types'

const baseSettings: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

function renderSection(overrides: Partial<Settings> = {}, onChange = vi.fn()) {
  const settings: Settings = { ...baseSettings, ...overrides }
  return {
    onChange,
    ...render(
      <ResizeSection settings={settings} onChange={onChange} imgW={800} imgH={600} />,
    ),
  }
}

describe('ResizeSection', () => {
  it('renders the section title', () => {
    renderSection()
    expect(screen.getByText('Resize')).toBeInTheDocument()
  })

  it('enables resize via toggle', () => {
    const { onChange } = renderSection()
    const toggle = screen.getByRole('switch', { name: /enable resize/i })
    fireEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        resize: expect.objectContaining({ enabled: true }),
      }),
    )
  })

  it('shows px/% /Preset mode buttons when resize is enabled', () => {
    renderSection({ resize: { ...baseSettings.resize, enabled: true } })
    expect(screen.getByText('px')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByText('Preset')).toBeInTheDocument()
  })

  it('switches to percent mode', () => {
    const { onChange } = renderSection({ resize: { ...baseSettings.resize, enabled: true } })
    fireEvent.click(screen.getByText('%'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        resize: expect.objectContaining({ mode: 'percent' }),
      }),
    )
  })

  it('shows dimension inputs in pixels mode', () => {
    renderSection({ resize: { ...baseSettings.resize, enabled: true, mode: 'pixels' } })
    expect(screen.getByLabelText('W')).toBeInTheDocument()
    expect(screen.getByLabelText('H')).toBeInTheDocument()
  })

  it('locks aspect ratio: changing width updates height proportionally', () => {
    const { onChange } = renderSection({
      resize: { ...baseSettings.resize, enabled: true, mode: 'pixels', lockAspect: true },
    })
    const widthInput = screen.getByLabelText('W')
    fireEvent.change(widthInput, { target: { value: '400' } })
    // imgH/imgW = 600/800 = 0.75 → height = 400 * 0.75 = 300
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        resize: expect.objectContaining({ width: '400', height: 300 }),
      }),
    )
  })

  it('unlocked aspect ratio: changing width does NOT update height', () => {
    const { onChange } = renderSection({
      resize: { ...baseSettings.resize, enabled: true, mode: 'pixels', lockAspect: false },
    })
    const widthInput = screen.getByLabelText('W')
    fireEvent.change(widthInput, { target: { value: '400' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        resize: expect.objectContaining({ width: '400' }),
      }),
    )
    // height should not appear in the patch
    const call = onChange.mock.calls[0][0] as Settings
    expect(String(call.resize.height)).toBe(String(DEFAULT_SETTINGS.resize.height))
  })

  it('shows preset grid in preset mode', () => {
    renderSection({ resize: { ...baseSettings.resize, enabled: true, mode: 'preset' } })
    expect(screen.getByText('1080p')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
  })

  it('applies a preset on click', () => {
    const { onChange } = renderSection({
      resize: { ...baseSettings.resize, enabled: true, mode: 'preset' },
    })
    fireEvent.click(screen.getByText('1080p'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        resize: expect.objectContaining({ width: 1920, height: 1080 }),
      }),
    )
  })

  it('shows fit mode buttons in pixels mode', () => {
    renderSection({ resize: { ...baseSettings.resize, enabled: true, mode: 'pixels' } })
    expect(screen.getByText('Contain')).toBeInTheDocument()
    expect(screen.getByText('Cover')).toBeInTheDocument()
    expect(screen.getByText('Stretch')).toBeInTheDocument()
  })

  it('collapses section when header is toggled', () => {
    renderSection()
    const header = screen.getByText('Resize').closest('button') as HTMLElement
    fireEvent.click(header)
    expect(screen.queryByText(/enable resize/i)).not.toBeInTheDocument()
  })
})
