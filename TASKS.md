# PixResize — PR Schedule & Tasks

Each PR is self-contained and builds on the previous. Merge in order.

---

## PR 1 — Project Scaffold
**Branch:** `feat/scaffold`  
**PRD Refs:** Tech Stack (§4)  
**Goal:** Bare working app with routing shell and design system wired up.

- [ ] Init Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Set up folder structure (`components/`, `hooks/`, `utils/`, `types/`)
- [ ] Add dark/light theme toggle (CSS variables)
- [ ] Add top navbar with app name and theme toggle
- [ ] Add placeholder layout (sidebar + main content area)
- [ ] Configure ESLint + Prettier
- [ ] Verify dev server runs

---

## PR 2 — Upload & Image Queue
**Branch:** `feat/upload`  
**PRD Refs:** U1, U2, U3, U4, H3  
**Depends on:** PR 1

- [ ] Build drag & drop upload zone component
- [ ] Wire native file picker (click to open, multi-select)
- [ ] Validate accepted formats (JPG, PNG, WebP, AVIF, GIF, BMP)
- [ ] Enforce 50-image limit with user warning
- [ ] Display thumbnail strip for loaded images
- [ ] Show image name, original dimensions, and file size per thumbnail
- [ ] Clicking a thumbnail sets it as the active image
- [ ] Clear / remove individual image from queue

---

## PR 3 — Core Resize
**Branch:** `feat/resize`  
**PRD Refs:** R1, R2, R3, R4, R5, R6  
**Depends on:** PR 2

- [ ] Custom width + height pixel inputs
- [ ] Aspect ratio lock toggle
- [ ] Percentage scaling input (25%, 50%, 75%, 100%, 150%, 200%)
- [ ] Preset size buttons (1080p, 4K, Instagram Post/Story, Twitter Banner, Facebook Cover, LinkedIn Banner, Thumbnail)
- [ ] Fit mode selector (Stretch / Contain / Cover)
- [ ] Canvas-based resize logic (`utils/resize.ts`)
- [ ] "Apply to All" toggle for bulk resize
- [ ] Show output dimensions preview before processing

---

## PR 4 — Quality, Format & File Size Estimate
**Branch:** `feat/quality-format`  
**PRD Refs:** Q1, Q2, Q3, Q4  
**Depends on:** PR 3

- [ ] Output format selector (JPG, PNG, WebP, AVIF)
- [ ] Quality slider for lossy formats (1–100, default 85)
- [ ] Detect browser AVIF encode support; fall back to WebP gracefully
- [ ] Real-time file size estimate (re-compute on settings change)
- [ ] Strip EXIF metadata toggle (re-draw via canvas drops EXIF)

---

## PR 5 — Crop Tool
**Branch:** `feat/crop`  
**PRD Refs:** V2  
**Depends on:** PR 3

- [ ] Overlay crop rectangle on image preview (mouse drag)
- [ ] Show crop handles for resizing the selection
- [ ] Display selected region dimensions (px)
- [ ] Apply crop to canvas before resize step
- [ ] Cancel / reset crop selection

---

## PR 6 — Rotate & Flip
**Branch:** `feat/rotate-flip`  
**PRD Refs:** V3, V4  
**Depends on:** PR 3

- [ ] Rotate 90° CW button
- [ ] Rotate 90° CCW button
- [ ] Rotate 180° button
- [ ] Flip horizontal button
- [ ] Flip vertical button
- [ ] Apply transforms to canvas before resize step

---

## PR 7 — Before/After Preview
**Branch:** `feat/preview`  
**PRD Refs:** V1  
**Depends on:** PR 3

- [ ] Side-by-side view (original left, processed right)
- [ ] Slider/drag comparison view
- [ ] Toggle between side-by-side and slider modes
- [ ] Show original vs. output file size below each pane

---

## PR 8 — Filters & Adjustments
**Branch:** `feat/filters`  
**PRD Refs:** F1, F2, F3, F4  
**Depends on:** PR 3

- [ ] Brightness slider (-100 to +100)
- [ ] Contrast slider (-100 to +100)
- [ ] Grayscale toggle
- [ ] Blur slider (0–20px)
- [ ] Apply filters via Canvas `filter` property or pixel manipulation
- [ ] Real-time preview updates as sliders change

---

## PR 9 — Watermark
**Branch:** `feat/watermark`  
**PRD Refs:** W1, W2, W3  
**Depends on:** PR 3

- [ ] Text watermark: input field, font size, color, opacity controls
- [ ] Image watermark: upload logo, set size and opacity
- [ ] Position preset buttons (TL, TR, Center, BL, BR)
- [ ] Watermark preview overlaid on canvas
- [ ] Toggle watermark on/off without losing settings

---

## PR 10 — Output & Download
**Branch:** `feat/download`  
**PRD Refs:** O1, O2, O3, O4, O5  
**Depends on:** PR 4

- [ ] Single image download button
- [ ] Install JSZip; bulk ZIP download for all processed images
- [ ] Copy to clipboard (Clipboard API)
- [ ] Base64 export panel (copy string, show character count)
- [ ] Custom filename input; `{n}` token for bulk sequential naming
- [ ] Progress bar during bulk processing

---

## PR 11 — Undo/Redo & UX Polish
**Branch:** `feat/undo-redo`  
**PRD Refs:** H1, H2, H4, H5  
**Depends on:** PR 10

- [ ] Undo/redo stack per image (edit history)
- [ ] Reset to original button (clears all edits)
- [ ] Progress bar for bulk operations
- [ ] Error toasts for unsupported files or processing failures
- [ ] Keyboard shortcuts: `Ctrl+Z` undo, `Ctrl+Y` redo, `Ctrl+D` download
- [ ] Loading spinner while processing large images

---

## Summary

| PR  | Branch                | Features            | Depends On |
|-----|-----------------------|---------------------|------------|
| 1   | feat/scaffold         | Project setup       | —          |
| 2   | feat/upload           | U1–U4, H3           | PR 1       |
| 3   | feat/resize           | R1–R6               | PR 2       |
| 4   | feat/quality-format   | Q1–Q4               | PR 3       |
| 5   | feat/crop             | V2                  | PR 3       |
| 6   | feat/rotate-flip      | V3, V4              | PR 3       |
| 7   | feat/preview          | V1                  | PR 3       |
| 8   | feat/filters          | F1–F4               | PR 3       |
| 9   | feat/watermark        | W1–W3               | PR 3       |
| 10  | feat/download         | O1–O5               | PR 4       |
| 11  | feat/undo-redo        | H1, H2, H4, H5      | PR 10      |

PRs 5–9 can be worked on in parallel after PR 3 merges.
