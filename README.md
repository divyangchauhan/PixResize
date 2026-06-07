# PixResize

[![Live Demo](https://img.shields.io/badge/demo-pixresize.vercel.app-blue?style=flat-square)](https://pixresize.vercel.app)
[![Deploy](https://img.shields.io/github/actions/workflow/status/divyangchauhan/PixResize/deploy.yml?style=flat-square&label=deploy)](https://github.com/divyangchauhan/PixResize/actions/workflows/deploy.yml)

A client-side image editor for resizing, transforming, and exporting up to 20 images at once — nothing leaves the browser.

## What it does

PixResize handles the routine image prep work that typically requires Photoshop or a server round-trip: resize by pixel, percentage, or social-media preset; rotate, flip, and crop; adjust brightness, contrast, blur, and grayscale; stamp a text or logo watermark; and export to JPG, PNG, WebP, or AVIF. Batch processing is supported — you can set settings on one image and propagate them to all, then download the whole batch as a ZIP.

Export options: single file download, bulk ZIP, clipboard copy, or Base64 data URL.

## Features

**Upload** — drag & drop or file picker; JPG, PNG, WebP, AVIF, GIF (static), BMP; up to 20 images per session.

**Resize** — by pixel dimensions, percentage, or preset (1080p, 4K, Instagram Post/Story, Twitter Banner, Facebook Cover, LinkedIn Banner, Thumbnail); aspect-ratio lock; fit modes: stretch, contain (letterbox), cover.

**Transform** — crop (draggable overlay), rotate 90°/180°, flip horizontal/vertical.

**Adjustments** — brightness, contrast, blur (0–20 px), grayscale; applied via Canvas `filter`, previewed live.

**Watermark** — text (font, size, color, opacity, position) or image logo (size, opacity, position); 7 position presets.

**Output** — format (JPG/PNG/WebP/AVIF), quality 1–100, EXIF stripping (canvas re-draw drops metadata automatically), custom filename with `{name}` / `{index}` tokens.

**Export** — single download, bulk ZIP, clipboard copy, Base64 data URL.

**History** — 50-step undo/redo per image, one-click reset, "Apply to All" to propagate one image's settings across the batch.

## Architecture

All processing runs in the browser via the HTML5 Canvas API — no backend, no file uploads, no external calls. The canvas pipeline (crop → resize → rotate/flip → CSS filters → watermark) is implemented in [`src/utils/imageProcessing.ts`](src/utils/imageProcessing.ts). Each image carries its own deep-cloned `Settings` object and an independent undo/redo stack (50 steps). AVIF support is probed at runtime via a 1×1 `canvas.toBlob` call; the format silently falls back to WebP if the browser can't encode it. ZIP export uses [fflate](https://github.com/101arrowz/fflate) — a pure-JS deflate implementation with no WASM dependency.

## Privacy

No image data is transmitted anywhere. All processing runs in memory in the browser tab. EXIF stripping works by re-drawing through canvas, which drops embedded metadata (location, device, timestamps) without any server involvement.

## Browser support

Chrome 100+, Firefox 100+, Safari 16+, Edge 100+. AVIF encode falls back to WebP automatically on unsupported browsers.

## Running locally

```bash
git clone https://github.com/divyangchauhan/PixResize.git
cd PixResize
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm build        # production build (tsc + vite)
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # E2E tests (Playwright, starts dev server automatically)
```

**Live demo:** https://pixresize.vercel.app

## Stack

| Layer            | Library                           |
| ---------------- | --------------------------------- |
| UI               | React 19, TypeScript 5.8          |
| Build            | Vite 6, Tailwind CSS 4            |
| Image processing | HTML5 Canvas API (browser-native) |
| ZIP compression  | fflate 0.8                        |
| Unit tests       | Vitest 4, Testing Library         |
| E2E tests        | Playwright                        |
| Hosting          | Vercel (static SPA)               |
