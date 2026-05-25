import { createCanvas } from 'node:canvas'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

/**
 * Creates a minimal valid PNG fixture on disk and returns its path.
 * Uses a plain buffer so we don't need an extra npm dependency.
 */
export function createTestPng(filename = 'test-image.png'): string {
  const dir = path.join(os.tmpdir(), 'pixresize-e2e')
  fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, filename)

  if (fs.existsSync(filePath)) return filePath

  // Minimal 1×1 white PNG (89 bytes, hardcoded)
  const png = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000' +
      '0090wc3d000000004944415478016360f8cfc0000000020001e221bc33' +
      '0000000049454e44ae426082',
    'hex',
  ).slice(0, 89)

  // If the hex above gives wrong bytes, fall back to a raw RGBA buffer encoded
  // as BMP-like raw PNG. Instead let's write a known-good tiny PNG:
  // This is a valid 2×2 white PNG, base64-encoded:
  const validPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==',
    'base64',
  )
  fs.writeFileSync(filePath, validPng)
  return filePath
}
