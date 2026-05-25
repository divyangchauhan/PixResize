import { test, expect } from '@playwright/test'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'

// ---------------------------------------------------------------------------
// Helpers
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Upload', () => {
  test('shows upload zone on first load', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/drag.*drop|upload/i).first()).toBeVisible()
  })

  test('uploads an image via file input and shows it in the image list', async ({ page }) => {
    await page.goto('/')
    const fixturePath = getFixturePath()

    // The hidden file input used by UploadZone
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(fixturePath)

    // After upload the image name should appear somewhere
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 5000 })
  })

  test('shows the preview panel after upload', async ({ page }) => {
    await page.goto('/')
    const fixturePath = getFixturePath()
    await page.locator('input[type="file"]').first().setInputFiles(fixturePath)

    // The preview toolbar with dimension chip should appear
    await expect(page.locator('.preview-toolbar').first()).toBeVisible({ timeout: 5000 })
  })

  test('shows the control sidebar after upload', async ({ page }) => {
    await page.goto('/')
    const fixturePath = getFixturePath()
    await page.locator('input[type="file"]').first().setInputFiles(fixturePath)

    // "Resize" text appears in multiple places; match the section button specifically
    await expect(page.getByRole('button', { name: 'Resize' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Output' })).toBeVisible({ timeout: 5000 })
  })
})
