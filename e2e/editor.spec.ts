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
})
