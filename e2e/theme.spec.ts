import { test, expect } from '@playwright/test'

// Headless Chromium reports prefers-color-scheme: light by default,
// so the app initialises in light mode and sets data-theme="light".

test.describe('Theme toggle', () => {
  test('starts with a data-theme attribute set on <html>', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    // useTheme always sets data-theme to either "light" or "dark"
    const attr = await html.getAttribute('data-theme')
    expect(['light', 'dark']).toContain(attr)
  })

  test('theme toggle button is visible in the navbar', async ({ page }) => {
    await page.goto('/')
    // The Navbar renders the toggle with aria-label="Toggle theme"
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible()
  })

  test('clicking toggle switches the data-theme attribute', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const before = await html.getAttribute('data-theme')

    await page.getByRole('button', { name: /toggle theme/i }).click()

    const after = await html.getAttribute('data-theme')
    expect(after).not.toBe(before)
    expect(['light', 'dark']).toContain(after)
  })

  test('clicking toggle twice returns to the original theme', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const original = await html.getAttribute('data-theme')

    const btn = page.getByRole('button', { name: /toggle theme/i })
    await btn.click()
    await btn.click()

    const final = await html.getAttribute('data-theme')
    expect(final).toBe(original)
  })
})
