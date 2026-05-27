# PixResize — PR Schedule & Tasks

Each PR is self-contained and builds on the previous. Merge in order.

---

## Design Phase — Claude Design + Handoff (before PR 2)

**Not a PR — a prerequisite step before any feature work begins.**  
**Goal:** Generate the full app design in Claude Design and hand it off to Claude Code so every PR implements against real designs, not guesswork.

### Step 1 — Generate designs in Claude Design
Cover these screens/states:
- [x] Upload screen (empty state, drag-active state, images loaded)
- [x] Main editor layout (sidebar panels, image preview area)
- [x] Resize panel
- [x] Crop tool overlay
- [x] Filters & adjustments panel
- [x] Watermark panel
- [x] Before/After preview (side-by-side and slider modes)
- [x] Download/export panel
- [x] Error and warning states (unsupported file, limit exceeded)
- [x] Dark mode variants for all screens above

### Step 2 — Hand off to Claude Code
Use the **Handoff to Claude Code** feature in Claude Design. This gives Claude Code:
- Component-level design specs (spacing, sizing, colors)
- Design tokens (colors, radii, shadows, typography scale)
- Asset exports (icons, illustrations if any)

### Step 3 — Apply design tokens to scaffold (PR 1.5)
**Branch:** `feat/design-tokens`  
**Depends on:** PR 1 + Design handoff

- [x] Replace placeholder CSS variables in `src/index.css` with tokens from the handoff (light + dark palette)
- [x] Update typography scale (font sizes, weights, line heights)
- [x] Set border radii, shadow levels, spacing scale
- [x] Verify Navbar and Layout shell visually match the design
- [x] Confirm dark/light toggle renders both themes correctly

> All subsequent PRs (2–11) implement features **against the handed-off design specs**.

---

## PR 1 — Project Scaffold ✅
**Branch:** `feat/scaffold`  
**PRD Refs:** Tech Stack (§4)  
**Goal:** Bare working app with routing shell and design system wired up.

- [x] Init Vite + React + TypeScript project
- [x] Install and configure Tailwind CSS
- [x] Set up folder structure (`components/`, `hooks/`, `utils/`, `types/`)
- [x] Add dark/light theme toggle (CSS variables)
- [x] Add top navbar with app name and theme toggle
- [x] Add placeholder layout (sidebar + main content area)
- [x] Configure ESLint + Prettier
- [x] Verify dev server runs

---

## PR 2 — Upload & Image Queue ✅
**Branch:** `feat/upload`  
**PRD Refs:** U1, U2, U3, U4, H3  
**Depends on:** PR 1 + Design handoff (Design Phase Step 3)

- [x] Build drag & drop upload zone component
- [x] Wire native file picker (click to open, multi-select)
- [x] Validate accepted formats (JPG, PNG, WebP, AVIF, GIF, BMP)
- [x] Enforce 20-image limit with user warning
- [x] Display thumbnail grid for loaded images
- [x] Show image name per thumbnail
- [x] Clicking a thumbnail sets it as the active image
- [x] Clear / remove individual image from queue

---

## PR 3 — Core Resize ✅
**Branch:** `feat/resize`  
**PRD Refs:** R1, R2, R3, R4, R5, R6  
**Depends on:** PR 2

- [x] Custom width + height pixel inputs
- [x] Aspect ratio lock toggle
- [x] Percentage scaling input (25%, 50%, 75%, 100%, 150%, 200%)
- [x] Preset size buttons (1080p, 4K, Instagram Post/Story, Twitter Banner, Facebook Cover, LinkedIn Banner, Thumbnail)
- [x] Fit mode selector (Stretch / Contain / Cover)
- [x] Canvas-based resize logic (`utils/resize.ts`)
- [x] Show output dimensions preview before processing

---

## PR 4 — Quality, Format & File Size Estimate ✅
**Branch:** `feat/quality-format`  
**PRD Refs:** Q1, Q2, Q3, Q4  
**Depends on:** PR 3

- [x] Output format selector (JPG, PNG, WebP, AVIF)
- [x] Quality slider for lossy formats (1–100, default 85)
- [x] Detect browser AVIF encode support; fall back to WebP gracefully
- [x] Real-time file size estimate (re-compute on settings change)
- [x] Strip EXIF metadata toggle (re-draw via canvas drops EXIF)

---

## PR 5 — Crop Tool ✅
**Branch:** `feat/crop`  
**PRD Refs:** V2  
**Depends on:** PR 3

- [x] Overlay crop rectangle on image preview (mouse drag)
- [x] Show crop handles for resizing the selection
- [x] Display selected region dimensions (px)
- [x] Apply crop to canvas before resize step
- [x] Cancel / reset crop selection

---

## PR 6 — Rotate & Flip ✅
**Branch:** `feat/rotate-flip`  
**PRD Refs:** V3, V4  
**Depends on:** PR 3

- [x] Rotate 90° CW button
- [x] Rotate 90° CCW button
- [x] Rotate 180° button
- [x] Flip horizontal button
- [x] Flip vertical button
- [x] Apply transforms to canvas before resize step

---

## PR 7 — Before/After Preview ✅
**Branch:** `feat/preview`  
**PRD Refs:** V1  
**Depends on:** PR 3

- [x] Slider/drag comparison view
- [x] Toggle Before/After mode
- [x] Fix PreviewPanel Before/After to draw into a `<canvas>` instead of `toDataURL()` — blits via `ctx.drawImage()`, no re-encoding

---

## PR 8 — Filters & Adjustments ✅
**Branch:** `feat/filters`  
**PRD Refs:** F1, F2, F3, F4  
**Depends on:** PR 3

- [x] Brightness slider (-100 to +100)
- [x] Contrast slider (-100 to +100)
- [x] Grayscale toggle
- [x] Blur slider (0–20px)
- [x] Apply filters via Canvas `filter` property
- [x] Real-time preview updates as sliders change

---

## PR 9 — Watermark ✅
**Branch:** `feat/watermark`  
**PRD Refs:** W1, W2, W3  
**Depends on:** PR 3

- [x] Text watermark: input field, font size, color, opacity controls
- [x] Image watermark: upload logo, set size and opacity
- [x] Position preset buttons (TL, TR, Center, BL, BR)
- [x] Watermark preview overlaid on canvas
- [x] Toggle watermark on/off without losing settings

---

## PR 10 — Output & Download ✅
**Branch:** `feat/download`  
**PRD Refs:** O1, O2, O3, O4, O5  
**Depends on:** PR 4

- [x] Single image download button
- [x] Bulk ZIP download using `fflate`
- [x] Copy to clipboard (Clipboard API)
- [x] Base64 export panel (copy string, show character count)
- [x] Custom filename input with `{name}` / `{index}` tokens

---

## PR 11 — Undo/Redo & UX Polish ✅
**Branch:** `feat/undo-redo`  
**PRD Refs:** H1, H2, H4, H5  
**Depends on:** PR 10

- [x] Undo/redo stack per image (edit history, 50-step cap)
- [x] Reset to original button (clears all edits)
- [x] Apply to All — copies current image settings to every other image in the batch
- [x] Loading spinner while processing large images

---

## PR 12 — Bug Fixes & Polish
**Branch:** `feat/polish`  
**Depends on:** PR 11

- [x] Fix large gap between thumbnail rows in image list (`align-content: start` on grid)
- [x] Set `processed: true` on `ImageItem` after a successful download or ZIP export so the ✓ badge lights up in the thumbnail
- [x] Move `ImageThumb` styles out of the per-instance `<style>` block and into the parent `ImageList` style block (currently duplicated N times in the DOM)
- [x] Add touch event support (`onTouchStart/Move/End`) to the Before/After slider in `PreviewPanel`
- [x] Add touch event support to `CropOverlay` drag handles

---

## PR 13 — Test Coverage Gaps
**Branch:** `feat/tests-v2`  
**Depends on:** PR 12

- [ ] E2E test for Apply to All — verify settings propagate to all thumbnails
- [ ] E2E test for Base64 export modal — open, copy, close
- [ ] E2E test for ZIP download — trigger and confirm download starts

---

## PR 14 — Deployment
**Branch:** `feat/deploy`  
**Depends on:** PR 12 (or main)

- [ ] Choose and configure hosting (Vercel recommended — zero-config for Vite)
- [ ] Connect GitHub repo to Vercel; set build command `pnpm build`, output dir `dist`
- [ ] Verify all routes and assets load correctly on the deployed URL
- [ ] Add a `homepage` or `base` path in `vite.config.ts` if deploying to a sub-path
- [ ] Set up a custom domain (optional)
- [ ] Add a `README.md` badge linking to the live deployment

---

## Summary

| Step      | Branch                | Description                        | Status      |
|-----------|-----------------------|------------------------------------|-------------|
| Design    | —                     | Claude Design + handoff            | ✅ Done     |
| Tokens    | feat/design-tokens    | Apply design tokens to scaffold    | ✅ Done     |
| PR 1      | feat/scaffold         | Project setup                      | ✅ Done     |
| PR 2      | feat/upload           | Upload & image queue               | ✅ Done     |
| PR 3      | feat/resize           | Core resize                        | ✅ Done     |
| PR 4      | feat/quality-format   | Quality, format, size estimate     | ✅ Done     |
| PR 5      | feat/crop             | Crop tool                          | ✅ Done     |
| PR 6      | feat/rotate-flip      | Rotate & flip                      | ✅ Done     |
| PR 7      | feat/preview          | Before/After preview               | ✅ Done     |
| PR 8      | feat/filters          | Filters & adjustments              | ✅ Done     |
| PR 9      | feat/watermark        | Watermark                          | ✅ Done     |
| PR 10     | feat/download         | Output & download                  | ✅ Done     |
| PR 11     | feat/undo-redo        | Undo/redo & UX polish              | ✅ Done     |
| PR 12     | feat/polish           | Bug fixes & polish                 | ✅ Done     |
| PR 13     | feat/tests-v2         | Test coverage gaps                 | 🔲 Pending  |
| PR 14     | feat/deploy           | Deployment                         | 🔲 Pending  |
