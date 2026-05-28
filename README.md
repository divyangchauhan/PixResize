# PixResize

**Client-side image editor — resize, crop, rotate, filter, and watermark images entirely in your browser. No uploads. No backend.**

🔗 **[pixresize.vercel.app](https://pixresize.vercel.app)**

---

## Features

- **Resize** — pixels, percentage, or presets (Instagram, Twitter, HD, 4K, etc.) with aspect-ratio lock and fit modes
- **Crop** — interactive drag-to-crop overlay with pixel dimensions
- **Rotate & Flip** — 90°/180° rotation, horizontal/vertical flip
- **Adjustments** — brightness, contrast, blur, grayscale
- **Watermark** — text or logo overlay with position, size, opacity, and color controls
- **Output** — JPG, PNG, WebP, AVIF with quality slider and EXIF strip option
- **Batch** — load up to 20 images, apply settings individually or to all at once, download as a ZIP
- **Undo/Redo** — per-image history with Ctrl+Z / Ctrl+Y; keyboard shortcut Ctrl+D to download
- **Before/After** — drag slider to compare original vs processed
- **Dark/Light theme**

## Privacy

All processing happens in the browser using the HTML5 Canvas API. Images never leave your device.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- fflate (ZIP bundling)
- Vitest + Playwright (71 unit tests, 21 E2E tests)

## Development

```bash
pnpm install
pnpm dev          # start dev server
pnpm test         # unit tests
pnpm test:e2e     # E2E tests
pnpm build        # production build
```
