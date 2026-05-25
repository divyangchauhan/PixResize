# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # start Vite dev server
pnpm build            # tsc -b && vite build
pnpm lint             # eslint
pnpm format           # prettier --write .
pnpm tsc --noEmit     # type-check only

# Testing
pnpm test             # run all unit tests once (Vitest)
pnpm test:watch       # unit tests in watch mode
pnpm test:coverage    # unit tests + coverage report
pnpm test:e2e         # run Playwright E2E tests (starts dev server automatically)
pnpm test:e2e:ui      # Playwright with interactive UI
```

## Test layout

```
src/
  test/setup.ts                          # Vitest global setup (canvas stubs, jest-dom)
  utils/resize.test.ts                   # computeOutputDimensions unit tests
  utils/imageProcessing.test.ts          # formatBytes, clamp, getWatermarkPos, processImage
  hooks/useSizeEstimate.test.ts          # hook behaviour
  components/controls/
    ResizeSection.test.tsx
    AdjustmentsSection.test.tsx
    OutputSection.test.tsx
  components/ActionBar.test.tsx

e2e/
  upload.spec.ts    # file upload flows
  editor.spec.ts    # resize/adjust/output/undo-redo/before-after
  theme.spec.ts     # dark/light theme toggle
```

## Architecture

**PixResize** is a fully client-side image editor — no backend, no uploads. All processing uses the HTML5 Canvas API in the browser.

### App shell

`App.tsx` owns all image state (`ImageItem[]`, `selectedId`). It renders:
- `<UploadZone>` when the image list is empty
- `<ImageList>` + editor layout when images are loaded

`Layout.tsx` splits the screen into a left sidebar (`w-72`) and a main content area. The sidebar holds tool controls (coming in later PRs); the main area holds the canvas preview.

### State shape

`src/types/index.ts` is the single source of truth for types. Every image is an `ImageItem` with its own deep-cloned `Settings` object — never share settings between images. Always deep-clone `DEFAULT_SETTINGS` with `JSON.parse(JSON.stringify(DEFAULT_SETTINGS))`.

### Styling rules

Two systems coexist:
- **Tailwind utilities** for layout, spacing, and typography
- **CSS custom properties** (vars) for all colour and border values

Never use Tailwind utilities for colours that need to respond to theme switches — use `var(--token)` directly (via `style=` or a local `<style>` block). The short-name tokens (`--bg`, `--bg2`, `--border2`, `--accent-dim`, etc.) are the ones to use in components; long-name aliases (`--color-bg`, `--color-surface`) also exist for backwards compat.

Theme is toggled by setting `data-theme="light"` on `<html>`. Default (no attribute) is dark.

### Design handoff

`design/handoff/PixResize.zip` contains the reference implementation. **Always extract both files before implementing a component:**

1. The relevant JSX (`components/*.jsx`) for structure and prop names
2. `PixResize.html` for the canonical CSS — every class name used in the JSX is defined there

```bash
unzip -p design/handoff/PixResize.zip PixResize.html | grep -A 9999 '<style>' | sed 's/<\/style>.*//'
unzip -p design/handoff/PixResize.zip components/upload.jsx   # example
```

Copy the CSS rules verbatim into inline `<style>` blocks inside each component file. Do not reconstruct styles from the JSX alone — the JSX class names are meaningless without the HTML's `<style>` block.

### Path alias

`@/` maps to `src/`. All imports should use `@/` rather than relative paths.
