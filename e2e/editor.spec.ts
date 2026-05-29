import { test, expect, Page } from '@playwright/test'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'

// ---------------------------------------------------------------------------
// Shared setup: upload the test image before each test
// ---------------------------------------------------------------------------

function getFixturePath(): string {
  const dir = path.join(os.tmpdir(), 'pixresize-e2e')
  fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, 'test-image.png')
  if (!fs.existsSync(filePath)) {
    const validPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==',
      'base64',
    )
    fs.writeFileSync(filePath, validPng)
  }
  return filePath
}

async function uploadImage(page: Page) {
  await page.goto('/')
  await page.locator('input[type="file"]').first().setInputFiles(getFixturePath())
  await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 5000 })
}

// Helper: find the Enable Resize toggle (role="switch" per our Toggle component)
function resizeToggle(page: Page) {
  return page.locator('.ctrl-section').filter({ hasText: 'Resize' }).getByRole('switch', { name: /enable resize/i })
}

// ---------------------------------------------------------------------------
// Resize controls
// ---------------------------------------------------------------------------

test.describe('Resize controls', () => {
  test('can enable resize and switch to percent mode', async ({ page }) => {
    await uploadImage(page)

    await resizeToggle(page).click()
    // Click % button (use role to avoid matching "88%" quality value)
    await page.getByRole('button', { name: '%' }).click()

    // Scale slider should now be visible
    await expect(page.getByText('Scale')).toBeVisible()
  })

  test('can apply a preset and see dimensions update', async ({ page }) => {
    await uploadImage(page)

    await resizeToggle(page).click()

    // Switch to Preset mode (exact match to avoid ambiguity with "Reset" button)
    await page.getByRole('button', { name: 'Preset' }).click()

    // Apply Instagram preset — applyPreset switches mode back to 'pixels',
    // so verify width input is set to 1080 (Instagram width)
    await page.getByText('Instagram').click()
    await expect(page.locator('#resize-width')).toHaveValue('1080')
  })
})

// ---------------------------------------------------------------------------
// Adjustments
// ---------------------------------------------------------------------------

test.describe('Adjustments section', () => {
  test('opens and shows all sliders', async ({ page }) => {
    await uploadImage(page)

    // Adjustments is collapsed by default; click to open
    await page.getByRole('button', { name: /adjustments/i }).click()

    await expect(page.getByText('Brightness')).toBeVisible()
    await expect(page.getByText('Contrast')).toBeVisible()
    await expect(page.getByText('Blur')).toBeVisible()
    // Toggle is role="switch", not role="checkbox"
    await expect(page.getByRole('switch', { name: /grayscale/i })).toBeVisible()
  })

  test('can toggle grayscale', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /adjustments/i }).click()
    const grayscale = page.getByRole('switch', { name: /grayscale/i })
    await grayscale.click()
    await expect(grayscale).toHaveAttribute('aria-checked', 'true')
  })
})

// ---------------------------------------------------------------------------
// Output section
// ---------------------------------------------------------------------------

test.describe('Output section', () => {
  test('can change format to PNG', async ({ page }) => {
    await uploadImage(page)
    // Use role=button to avoid matching "test-image.png" text
    await page.getByRole('button', { name: 'PNG' }).click()
    // Quality slider should disappear (PNG is lossless)
    await expect(page.getByText('Quality')).not.toBeVisible()
  })

  test('can change format to WEBP and quality slider appears', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: 'WEBP' }).click()
    await expect(page.getByText('Quality')).toBeVisible()
  })

  test('can edit filename template', async ({ page }) => {
    await uploadImage(page)
    const filenameInput = page.getByPlaceholder('{name}_{index}')
    await filenameInput.fill('{name}_small')
    await expect(filenameInput).toHaveValue('{name}_small')
  })
})

// ---------------------------------------------------------------------------
// Undo / Redo
// ---------------------------------------------------------------------------

test.describe('Undo / Redo', () => {
  test('undo button is disabled initially', async ({ page }) => {
    await uploadImage(page)
    await expect(page.getByTitle('Undo')).toBeDisabled()
  })

  test('undo becomes enabled after a change', async ({ page }) => {
    await uploadImage(page)

    // Make a change: enable resize (Toggle is role="switch")
    await resizeToggle(page).click()

    await expect(page.getByTitle('Undo')).not.toBeDisabled()
  })

  test('redo is disabled before any undo', async ({ page }) => {
    await uploadImage(page)
    await expect(page.getByTitle('Redo')).toBeDisabled()
  })

  test('redo becomes enabled after undo', async ({ page }) => {
    await uploadImage(page)
    await resizeToggle(page).click()

    await page.getByTitle('Undo').click()
    await expect(page.getByTitle('Redo')).not.toBeDisabled()
  })

  test('reset button is always visible and clickable', async ({ page }) => {
    await uploadImage(page)
    await resizeToggle(page).click()
    await expect(page.getByTitle('Undo')).not.toBeDisabled()
    // "Reset" button has title="Reset to defaults"; "Preset" also contains "reset"
    await page.getByTitle('Reset to defaults').click()
    await expect(page.getByTitle('Reset to defaults')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Before / After toggle
// ---------------------------------------------------------------------------

test.describe('Preview panel', () => {
  test('Before/After toggle button exists and activates', async ({ page }) => {
    await uploadImage(page)
    const baBtn = page.getByRole('button', { name: /before.*after/i })
    await expect(baBtn).toBeVisible()
    await baBtn.click()
    await expect(baBtn).toHaveClass(/active/)
  })

  test('preview renders a <canvas> element after processing', async ({ page }) => {
    await uploadImage(page)
    // Wait for the processing overlay to disappear (canvas is drawn)
    await expect(page.locator('.processing-overlay')).not.toBeVisible({ timeout: 5000 })
    // A <canvas> should be present in the preview area
    await expect(page.locator('.preview-canvas-wrap canvas')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Apply to All
// ---------------------------------------------------------------------------

test.describe('Apply to All', () => {
  test('Apply to All button is disabled with a single image', async ({ page }) => {
    await uploadImage(page)
    await expect(page.getByTitle('Apply current settings to all images')).toBeDisabled()
  })

  test('Apply to All is enabled after a second image is uploaded', async ({ page }) => {
    await uploadImage(page)
    // Upload a second image via the add-more input in ImageList
    await page.locator('input[type="file"]').last().setInputFiles(getFixturePath())
    await expect(page.getByTitle('Apply current settings to all images')).not.toBeDisabled({ timeout: 5000 })
  })

  test('Apply to All propagates settings to all images', async ({ page }) => {
    await uploadImage(page)
    // Add second image
    await page.locator('input[type="file"]').last().setInputFiles(getFixturePath())
    await expect(page.getByTitle('Apply current settings to all images')).not.toBeDisabled({ timeout: 5000 })

    // Change a setting on the first image: switch format to PNG
    await page.getByRole('button', { name: 'PNG' }).click()

    // Apply to all
    await page.getByTitle('Apply current settings to all images').click()

    // Switch to second image and verify format was applied
    const thumbnails = page.locator('.img-thumb')
    await thumbnails.nth(1).click()
    // PNG button should be active for the second image too
    await expect(page.getByRole('button', { name: 'PNG' }).first()).toHaveClass(/active/)
  })
})

// ---------------------------------------------------------------------------
// Transform section
// ---------------------------------------------------------------------------

test.describe('Transform section', () => {
  test('opens and shows Rotate and Flip controls', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /transform/i }).click()
    await expect(page.getByText('Rotate')).toBeVisible()
    await expect(page.getByText('Flip')).toBeVisible()
    await expect(page.getByRole('switch', { name: /crop/i })).toBeVisible()
  })

  test('rotate CW button is clickable', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /transform/i }).click()
    // exact: true prevents matching 'CCW' which also contains 'CW'
    await page.getByRole('button', { name: 'CW', exact: true }).click()
    // Rotation hint appears after one CW click (0 → 90°)
    await expect(page.getByText('Rotation: 90°')).toBeVisible()
  })

  test('rotate CCW button is clickable', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /transform/i }).click()
    await page.getByRole('button', { name: 'CCW' }).click()
    await expect(page.getByText('Rotation: 270°')).toBeVisible()
  })

  test('rotate 180° button is clickable', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /transform/i }).click()
    await page.getByRole('button', { name: '180°' }).click()
    await expect(page.getByText('Rotation: 180°')).toBeVisible()
  })

  test('flip Horizontal button toggles active state', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /transform/i }).click()
    const flipH = page.getByRole('button', { name: 'Horizontal' })
    await flipH.click()
    await expect(flipH).toHaveClass(/active/)
    // clicking again removes active
    await flipH.click()
    await expect(flipH).not.toHaveClass(/active/)
  })

  test('flip Vertical button toggles active state', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /transform/i }).click()
    const flipV = page.getByRole('button', { name: 'Vertical' })
    await flipV.click()
    await expect(flipV).toHaveClass(/active/)
  })

  test('crop toggle enables CropOverlay on the preview', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /transform/i }).click()
    await page.getByRole('switch', { name: /crop/i }).click()
    // CropOverlay renders a dimension tooltip ("W × H") anywhere on the page
    // when crop mode is active (not inside .preview-canvas-wrap which is unmounted)
    await expect(page.locator('text=/\\d+ × \\d+/')).toBeVisible({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// Watermark section
// ---------------------------------------------------------------------------

test.describe('Watermark section', () => {
  test('opens and shows text and logo watermark toggles', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /watermark/i }).click()
    await expect(page.getByRole('switch', { name: /text watermark/i })).toBeVisible()
    await expect(page.getByRole('switch', { name: /logo watermark/i })).toBeVisible()
  })

  test('enabling text watermark reveals text input and sliders', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /watermark/i }).click()
    await page.getByRole('switch', { name: /text watermark/i }).click()
    const wmSection = page.locator('.ctrl-section').filter({ hasText: 'Watermark' })
    await expect(page.getByPlaceholder('Watermark text…')).toBeVisible()
    // Use exact:true and scope to the Watermark section to avoid matching 'Resize'
    await expect(wmSection.getByText('Size', { exact: true })).toBeVisible()
    await expect(wmSection.getByText('Opacity', { exact: true })).toBeVisible()
  })

  test('can type watermark text', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /watermark/i }).click()
    await page.getByRole('switch', { name: /text watermark/i }).click()
    await page.getByPlaceholder('Watermark text…').fill('© 2025')
    await expect(page.getByPlaceholder('Watermark text…')).toHaveValue('© 2025')
  })

  test('text position dropdown lists all positions', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /watermark/i }).click()
    await page.getByRole('switch', { name: /text watermark/i }).click()
    const select = page.locator('.ctrl-section').filter({ hasText: 'Watermark' }).locator('select').first()
    await expect(select.locator('option')).toHaveCount(7)
  })

  test('enabling logo watermark shows upload button', async ({ page }) => {
    await uploadImage(page)
    await page.getByRole('button', { name: /watermark/i }).click()
    await page.getByRole('switch', { name: /logo watermark/i }).click()
    await expect(page.getByText('+ Upload logo image')).toBeVisible()
  })
})
