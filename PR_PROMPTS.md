# PixResize — Claude Code PR Prompts

Each section is a self-contained prompt. Copy the full block into Claude Code to implement that PR.
Work in order. Each PR depends on the previous one being merged.

The design handoff zip (`PixResize.zip`) is in the project root. Unzip it and keep it open alongside
each prompt — the prompts reference specific files and line ranges inside it.

---

## PR 1.5 — Design Tokens (`feat/design-tokens`)

```
We have a Vite + React + TypeScript project at the repo root. The current design tokens in
`src/index.css` are placeholder values. The real tokens come from the Claude Design handoff
(unzip `PixResize.zip` — the CSS lives at the top of `PixResize.html`, lines ~20–55).

**Your job:**

1. Replace the existing CSS custom properties in `src/index.css` with the handoff's oklch-based
   tokens. The handoff uses short names (`--bg`, `--bg2`, `--text`, etc.). Map them to the
   existing longer names AND keep the short names as aliases so future components can use either:

   Mapping:
   - `--bg`        → `--color-bg`       (also keep `--bg`)
   - `--bg2`       → `--color-surface`  (also keep `--bg2`)
   - `--bg3`       → add new            (no existing equivalent — used for hover backgrounds)
   - `--border`    → `--color-border`   (also keep `--border`)
   - `--border2`   → add new            (secondary border)
   - `--text`      → `--color-text`     (also keep `--text`)
   - `--text2`     → `--color-text-muted` (also keep `--text2`)
   - `--text3`     → add new            (dimmer text, used on labels)
   - `--accent`    → `--color-accent`   (also keep `--accent`)
   - `--accent-dim`→ add new            (accent at 15% opacity, used for active states)
   - `--accent-hover` → `--color-accent-hover` (also keep `--accent-hover`)
   - `--danger`    → add new            (red, used for remove buttons)
   - `--success`   → add new            (green, used for processed badge)

   Dark mode token values (`:root` in handoff, dark is the default in handoff):
   - `--bg: oklch(13% 0.01 250)`
   - `--bg2: oklch(17% 0.01 250)`
   - `--bg3: oklch(21% 0.012 250)`
   - `--border: oklch(28% 0.012 250)`
   - `--border2: oklch(34% 0.01 250)`
   - `--text: oklch(88% 0.008 250)`
   - `--text2: oklch(60% 0.008 250)`
   - `--text3: oklch(42% 0.008 250)`
   - `--accent: oklch(65% 0.18 255)`
   - `--accent-dim: oklch(65% 0.18 255 / 0.15)`
   - `--accent-hover: oklch(70% 0.18 255)`
   - `--danger: oklch(65% 0.18 20)`
   - `--success: oklch(68% 0.16 145)`

   Light mode token values (`[data-theme="light"]` in handoff — note handoff uses `.light` class,
   but our app uses `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`):
   - `--bg: oklch(96% 0.005 250)`
   - `--bg2: oklch(100% 0 0)`
   - `--bg3: oklch(93% 0.006 250)`
   - `--border: oklch(82% 0.008 250)`
   - `--border2: oklch(74% 0.008 250)`
   - `--text: oklch(18% 0.01 250)`
   - `--text2: oklch(42% 0.01 250)`
   - `--text3: oklch(60% 0.008 250)`
   - `--accent: oklch(52% 0.2 255)`
   - `--accent-dim: oklch(52% 0.2 255 / 0.12)`
   - `--accent-hover: oklch(48% 0.2 255)`
   - `--danger: oklch(65% 0.18 20)` (same)
   - `--success: oklch(68% 0.16 145)` (same)

   Our default (no data-theme attr) should be dark mode — match how `useTheme.ts` currently
   initialises (check it first).

2. Add the shared utility types to `src/types/index.ts`. The canonical settings shape is defined
   at the top of `components/upload.jsx` in the handoff as `DEFAULT_SETTINGS`. Port it as a
   TypeScript type `Settings` and export a `DEFAULT_SETTINGS` const:

   ```ts
   export interface ResizeSettings {
     enabled: boolean;
     mode: 'pixels' | 'percent' | 'preset';
     width: string | number;
     height: string | number;
     percent: string | number;
     preset: string;
     lockAspect: boolean;
     fitMode: 'contain' | 'cover' | 'stretch';
   }
   export interface TransformSettings {
     rotation: number;
     flipH: boolean;
     flipV: boolean;
     crop: { x: number; y: number; w: number; h: number } | null;
   }
   export interface AdjustmentSettings {
     brightness: number;
     contrast: number;
     blur: number;
     grayscale: boolean;
   }
   export interface WatermarkSettings {
     textEnabled: boolean;
     text: string;
     textSize: number;
     textColor: string;
     textOpacity: number;
     textPosition: string;
     textFont: string;
     logoEnabled: boolean;
     logoSrc: string | null;
     logoSize: number;
     logoOpacity: number;
     logoPosition: string;
   }
   export interface OutputSettings {
     format: 'jpg' | 'png' | 'webp' | 'avif';
     quality: number;
     stripExif: boolean;
     filename: string;
   }
   export interface Settings {
     resize: ResizeSettings;
     transform: TransformSettings;
     adjustments: AdjustmentSettings;
     watermark: WatermarkSettings;
     output: OutputSettings;
   }
   export interface ImageItem {
     id: string;
     name: string;
     src: string;         // data URL
     size: number;        // original bytes
     width: number;
     height: number;
     processed: boolean;
     settings: Settings;
   }
   ```

   Also export `DEFAULT_SETTINGS: Settings` and `PRESETS` (the array of `{ label, w, h }` from
   `upload.jsx` lines 48-56).

3. Add the image processing utilities to `src/utils/imageProcessing.ts`. Port `window.PixUtils`
   from `components/utils.jsx` in the handoff — convert from the global object style to named
   exports. The logic is already correct canvas-based processing; just adapt to TypeScript module
   syntax and replace `PixUtils.loadImage(...)` recursive calls with the exported function name.
   Do not change the processing logic itself.

4. Update `src/components/Navbar.tsx` and `src/components/Layout.tsx` to use the new token names
   (swap hardcoded colours for CSS vars where any exist).

5. Run `pnpm dev`, open the browser, verify dark and light mode both render the Navbar correctly
   with the new palette. Screenshot is not needed — just confirm no TypeScript errors and the
   dev server starts cleanly.

Do not create any feature UI yet. This PR is tokens + types + utils only.
```

---

## PR 2 — Upload & Image Queue (`feat/upload`)

```
Branch off `feat/design-tokens` (or main if that's merged). PRD refs: U1, U2, U3, U4, H3.

The design reference is `components/upload.jsx` in the handoff zip (`PixResize.zip`).
Port `UploadZone` (lines 59–97) and `ImageList` + `ImageThumb` (lines 100–138) from JSX to TSX.

**Files to create:**
- `src/components/UploadZone.tsx` — port `UploadZone`. Props: `onFiles: (files: File[]) => void`.
  Keep the drag-active state, the SVG icon, and the subtitle text. Use CSS vars from the token
  layer (`--border2`, `--accent`, `--accent-dim`, `--text3`, `--bg3`) for the dashed border,
  active state highlight, and label colours. Do not use Tailwind utilities for the dashed border
  or drag-active colours — use the CSS vars directly via `style` or a local `<style>` block so
  the design matches the handoff exactly.

- `src/components/ImageList.tsx` — port `ImageList` and `ImageThumb` as a single file.
  Props for `ImageList`: `images: ImageItem[], selectedId: string | null, onSelect, onRemove, onAdd`.
  The thumbnail grid scrolls horizontally. The remove button (×) stops propagation. The ✓ badge
  shows when `item.processed === true`.

**Files to modify:**
- `src/App.tsx` — add state: `images: ImageItem[]`, `selectedId: string | null`.
  Wire up `addImages(files: File[])` which:
    1. Reads each file as a data URL (FileReader)
    2. Loads it into an `<img>` to get natural width/height
    3. Enforces the 50-image cap — if adding the new batch would exceed 50, show a browser alert
       ("Maximum 50 images. Only the first N were added.") and trim the batch
    4. Creates an `ImageItem` with a random `id` (crypto.randomUUID()), the file name, data URL,
       size (file.size), dimensions, `processed: false`, and a fresh copy of `DEFAULT_SETTINGS`
  Render `UploadZone` when `images.length === 0`.
  Render `ImageList` + the main editor layout when `images.length > 0`.
  The editor layout can be a placeholder `<div>` for now — it will be filled in later PRs.

- `src/types/index.ts` — already has `ImageItem`; no changes needed if PR 1.5 is merged.

**Acceptance criteria:**
- Drag and drop a JPG/PNG → thumbnail appears in the list, clicking it sets it as selected
  (highlighted border)
- Click the + button in the list header → file picker opens, multi-select works
- Drop 51 images → alert fires, only 50 load
- Removing an image from the list removes it from state; if it was selected, clear selection
- No TypeScript errors (`pnpm tsc --noEmit`)
```

---

## PR 3 — Core Resize (`feat/resize`)

```
Branch off `feat/upload` (or main if merged). PRD refs: R1, R2, R3, R4, R5, R6.

The design reference is `components/controls.jsx` in the handoff zip, specifically:
- Shared primitives: `Slider` (lines 5-19), `NumberInput` (lines 22-30), `Toggle` (lines 33-44),
  `SectionTitle` (lines 47-57)
- `ResizeSection` (lines 60-180)

**Files to create:**
- `src/components/controls/primitives.tsx` — port `Slider`, `NumberInput`, `Toggle`, `SectionTitle`
  as named exports. These are pure presentational components used across all control panels.
  Convert className strings to use CSS vars. Keep the SVG chevron in `SectionTitle` as-is.

- `src/components/controls/ResizeSection.tsx` — port `ResizeSection`. Props:
  `settings: Settings, onChange: (s: Settings) => void, imgW: number, imgH: number`.
  The PRESETS array is already in `src/types/index.ts` from PR 1.5 — import it from there.
  The aspect-ratio lock logic (handleWidthChange / handleHeightChange) must be preserved exactly.
  Fit mode selector only renders when mode is 'pixels' or 'preset', not 'percent' — keep that.

- `src/utils/resize.ts` — the actual canvas resize is already in `src/utils/imageProcessing.ts`
  (ported in PR 1.5). This file should export only `computeOutputDimensions`:
  ```ts
  export function computeOutputDimensions(
    settings: ResizeSettings,
    originalW: number,
    originalH: number
  ): { w: number; h: number }
  ```
  Extract the dimension logic from `processImage` in `imageProcessing.ts` into this function so
  the preview label can show output size without processing the full canvas.

**Files to modify:**
- `src/App.tsx` — add a right-side controls panel to the editor layout. Render `ResizeSection`
  for the active image. When settings change, update `images` state (immutably patch the active
  image's `settings.resize`). Pass the active image's `width` and `height` as `imgW` / `imgH`.
  Below the section title, show a one-line output dimensions preview:
  "Output: {w} × {h} px" — computed via `computeOutputDimensions` from the current settings.

**Acceptance criteria:**
- Upload an image → Resize panel visible in right panel
- Set W to 800 with aspect lock on → H auto-updates proportionally
- Switch to Preset → click "Instagram" → width/height fields update to 1080×1080
- Switch to % mode → slider appears, no dimension inputs
- Fit mode selector shows for pixels/preset but not percent
- `pnpm tsc --noEmit` clean
```

---

## PR 4 — Quality, Format & File Size Estimate (`feat/quality-format`)

```
Branch off `feat/resize` (or main if merged). PRD refs: Q1, Q2, Q3, Q4.

The design reference is `components/controls.jsx` in the handoff zip:
- `OutputSection` (lines 336-387)

**Files to create:**
- `src/components/controls/OutputSection.tsx` — port `OutputSection`. Props:
  `settings: Settings, onChange: (s: Settings) => void, sizeEstimate: number`.
  The format segmented control shows JPG / PNG / WebP / AVIF. The quality slider only renders
  when format is jpg, webp, or avif (not png). Strip EXIF toggle and filename input are always
  visible. The size estimate row shows only when `sizeEstimate > 0`.

- `src/hooks/useSizeEstimate.ts` — a hook that debounces a call to
  `imageProcessing.estimateSize(src, settings, format, quality)` (already in utils from PR 1.5)
  whenever settings or the active image change. Debounce delay: 400 ms. Returns `number` (bytes).
  While estimating, return the previous value (don't flash 0).

**Files to modify:**
- `src/App.tsx` — add `OutputSection` below `ResizeSection` in the controls panel.
  Pass `sizeEstimate` from `useSizeEstimate`. When format changes to 'avif', check if the browser
  supports AVIF encode by attempting `canvas.toBlob(cb, 'image/avif')` on a 1×1 canvas — if the
  blob is null or zero bytes, fall back to 'webp' and show a one-time console.warn.

**Acceptance criteria:**
- Select PNG → quality slider disappears
- Select WebP → quality slider appears at 88 by default
- Adjust quality slider → size estimate updates (with ~400ms debounce) below the section
- Strip EXIF toggle visible and persists in settings
- Filename field accepts `{name}_{index}` tokens
- No TS errors
```

---

## PR 5 — Crop Tool (`feat/crop`)

```
Branch off `feat/resize` (or main if merged). PRD refs: V2.

There is no standalone crop component in the handoff — the crop field exists in `DEFAULT_SETTINGS`
as `transform.crop: null | { x, y, w, h }` and the `processImage` util in `imageProcessing.ts`
does not yet apply crop (it was stubbed). This PR builds the crop UI from scratch using the design
tokens established in PR 1.5.

**Files to create:**
- `src/components/CropOverlay.tsx` — an overlay rendered on top of the preview image.
  It renders a draggable selection rectangle with 8 resize handles (corners + midpoints).
  The overlay fills the image bounds. Mouse drag on the interior moves the crop rect; drag on a
  handle resizes it. Displays the selected region's pixel dimensions (mapped from display px back
  to image px) as a small tooltip near the top of the selection.
  Props: `imgW: number, imgH: number, crop: CropRect | null, onChange: (c: CropRect | null) => void`.
  `CropRect = { x: number; y: number; w: number; h: number }` in image-pixel space.

- `src/components/controls/TransformSection.tsx` — port `TransformSection` from `controls.jsx`
  lines 183-226 (rotate + flip buttons). Also add a "Crop" toggle row at the top: when on, it
  activates the `CropOverlay` in the preview. When off, `transform.crop` is set to null.
  Props: `settings: Settings, onChange: (s: Settings) => void, cropActive: boolean,
  onToggleCrop: () => void`.

**Files to modify:**
- `src/utils/imageProcessing.ts` — implement the crop step inside `processImage`. After loading
  the image and before drawing, if `transform.crop` is set, use `ctx.drawImage` with the crop
  source rect (`sx, sy, sw, sh` from the crop values) instead of the full image. Apply crop
  before rotation and flip.

- `src/App.tsx` — add `cropActive: boolean` state. Pass it and the toggle handler to
  `TransformSection`. When `cropActive`, render `CropOverlay` on top of the preview area. When
  the user sets a crop rect, patch `settings.transform.crop` on the active image. When crop is
  toggled off, set `transform.crop` to null.

**Acceptance criteria:**
- Click "Crop" toggle → overlay appears on the preview image with a dashed selection rect
- Drag inside the selection to move it; drag handles to resize it
- The pixel dimensions shown in the tooltip update as you resize
- Toggle crop off → overlay disappears and crop is cleared from settings
- Download an image with crop applied → output is correctly cropped
- No TS errors
```

---

## PR 6 — Rotate & Flip (`feat/rotate-flip`)

```
Branch off `feat/crop` (or main if merged). PRD refs: V3, V4.

If PR 5 is already merged, `TransformSection` exists at `src/components/controls/TransformSection.tsx`
and already includes the rotate/flip buttons (ported from handoff `controls.jsx` lines 183-226).
In that case this PR is just wiring and testing — skip the component creation step.

If PR 5 is NOT yet merged, create `src/components/controls/TransformSection.tsx` by porting
`TransformSection` from `controls.jsx` lines 183-226 (rotate/flip only — omit the crop toggle,
that's PR 5's concern). Props: `settings: Settings, onChange: (s: Settings) => void`.

The handoff's rotate logic accumulates degrees:
```
rotation: ((transform.rotation + deg) % 360 + 360) % 360
```
Preserve this exactly — it handles negative degrees (CCW) correctly.

**Files to modify:**
- `src/App.tsx` — add `TransformSection` to the controls panel, below `ResizeSection`.
  Settings changes patch `settings.transform` on the active image.
  The preview panel should immediately reflect rotation and flip — `processImage` in
  `imageProcessing.ts` already handles transforms, so just trigger a re-process when
  transform settings change.

**Acceptance criteria:**
- Click CW → preview rotates 90° clockwise
- Click CCW twice → preview is 180° rotated (equivalent to the 180° button)
- Flip Horizontal → image mirrors left-right; button stays visually "active"
- Combine rotation + flip → download produces correct combined transform
- Rotation hint line "Rotation: 90°" appears below the buttons when rotation ≠ 0
- No TS errors
```

---

## PR 7 — Before/After Preview (`feat/preview`)

```
Branch off `feat/resize` (or main if merged). PRD refs: V1.

The design reference is `components/preview.jsx` in the handoff zip (all 134 lines).

**Files to create:**
- `src/components/PreviewPanel.tsx` — port `PreviewPanel` from `preview.jsx`. Convert to TSX.
  Props:
  ```ts
  interface PreviewPanelProps {
    image: ImageItem | null;
    settings: Settings;
    processedCanvas: HTMLCanvasElement | null;
    showBeforeAfter: boolean;
    onToggleBeforeAfter: () => void;
    processing: boolean;
  }
  ```
  The empty state SVG and "No image selected" text must match the handoff exactly.
  The before/after slider uses `clipPath: inset(0 ${100 - sliderX}% 0 0)` on the "before" layer —
  keep this approach. The slider handle is draggable via mouse events on the handle div; the
  mousemove/mouseup listeners attach to `window` while dragging (already done in handoff, preserve it).
  The spinner overlay (`.processing-overlay`) shows while `processing === true`.

  In our TypeScript version, `processedCanvasRef` is a `React.RefObject<HTMLCanvasElement>`.
  The `useEffect` that copies `processedCanvas` into the display canvas must check both
  `processedCanvas` and `processedCanvasRef.current` before drawing.

- `src/hooks/useImageProcessing.ts` — a hook that runs `imageProcessing.processImage` whenever
  the active image or its settings change. Returns `{ canvas: HTMLCanvasElement | null, processing: boolean }`.
  Use `useEffect` with the image `src` and `settings` as dependencies. Cancel stale runs by
  checking a cancelled flag in the effect cleanup.

**Files to modify:**
- `src/App.tsx` — replace the current preview placeholder with `PreviewPanel`. Add
  `showBeforeAfter: boolean` state (default false). Wire `useImageProcessing` and pass its output
  to `PreviewPanel`.

**Acceptance criteria:**
- Upload image → preview shows the image
- Enable resize to 400×400 → processed canvas shows at 400×400
- Click "Before/After" button → slider view appears with "Before" on the left, "After" on the right
- Drag the slider handle → the dividing line moves smoothly
- While processing (large image) → spinner overlay appears
- No TS errors
```

---

## PR 8 — Filters & Adjustments (`feat/filters`)

```
Branch off `feat/resize` (or main if merged). PRD refs: F1, F2, F3, F4.

The design reference is `components/controls.jsx` in the handoff zip:
- `AdjustmentsSection` (lines 229-254)
- Reuses `Slider` and `Toggle` primitives from `src/components/controls/primitives.tsx` (PR 3).

**Files to create:**
- `src/components/controls/AdjustmentsSection.tsx` — port `AdjustmentsSection`. Props:
  `settings: Settings, onChange: (s: Settings) => void`.
  Four controls:
  - Brightness slider: min=0, max=200, unit="%", default=100 (maps to CSS `brightness()` filter)
  - Contrast slider: min=0, max=200, unit="%", default=100
  - Blur slider: min=0, max=20, step=0.5, unit="px", default=0
  - Grayscale toggle: default=false
  The section is collapsed by default (`open` starts false). Use `SectionTitle` with the same
  sliders SVG icon from the handoff (lines 237-242).

**Files to modify:**
- `src/App.tsx` — add `AdjustmentsSection` to the controls panel. Settings changes patch
  `settings.adjustments` on the active image.

Note: the filter application is already handled in `imageProcessing.ts` via the canvas `filter`
property — no changes needed there. Real-time preview updates automatically because the processing
hook re-runs on settings change.

**Acceptance criteria:**
- Brightness slider at 50% → preview noticeably darker
- Contrast slider at 200% → preview high-contrast
- Blur slider at 5px → preview softly blurred
- Grayscale toggle on → preview turns greyscale
- Combine all four → download reflects all adjustments stacked
- Sliders reset when clicking a different image in the queue (they reflect that image's settings)
- No TS errors
```

---

## PR 9 — Watermark (`feat/watermark`)

```
Branch off `feat/resize` (or main if merged). PRD refs: W1, W2, W3.

The design reference is `components/controls.jsx` in the handoff zip:
- `WatermarkSection` (lines 257-333)
- Reuses `Slider`, `Toggle`, `SectionTitle` primitives from `src/components/controls/primitives.tsx`.

**Files to create:**
- `src/components/controls/WatermarkSection.tsx` — port `WatermarkSection`. Props:
  `settings: Settings, onChange: (s: Settings) => void`.

  Text watermark sub-section (only shown when `watermark.textEnabled`):
  - Text input (`<input type="text">`)
  - Size slider: min=8, max=120, unit="px"
  - Opacity slider: min=0, max=100, unit="%"
  - Color picker (`<input type="color">`)
  - Position `<select>` with these options:
    top-left, top-center, top-right, center, bottom-left, bottom-center, bottom-right

  Logo watermark sub-section (only shown when `watermark.logoEnabled`):
  - Hidden file input + "Upload logo image" / "↺ Replace logo" button
  - Size slider: min=5, max=80, unit="%" (percent of canvas width)
  - Opacity slider: min=0, max=100, unit="%"
  - Position `<select>` (same options as text)

  Both sub-sections are inside collapsible `.sub-section` divs that only render when their
  respective toggle is on. The section header is collapsed by default.

  For the logo upload: use `FileReader.readAsDataURL` and store the result in
  `settings.watermark.logoSrc`. A hidden `<input type="file" accept="image/*">` is triggered
  via a ref on button click (same pattern as the handoff, lines 263-269).

**Files to modify:**
- `src/App.tsx` — add `WatermarkSection` to the controls panel. Settings changes patch
  `settings.watermark` on the active image.

Note: watermark rendering is already implemented in `imageProcessing.ts` (text + logo watermark
with position mapping). No changes needed there.

**Acceptance criteria:**
- Enable text watermark, type "© 2025" → preview shows text overlay in the selected position
- Change position to "top-left" → text moves to top-left corner
- Adjust opacity to 40% → text is semi-transparent
- Enable logo watermark, upload a small PNG → logo appears at the selected position
- Toggle watermark off → watermark disappears from preview (settings retain values)
- Download → watermark is baked into the output
- No TS errors
```

---

## PR 10 — Output & Download (`feat/download`)

```
Branch off `feat/quality-format` (or main if merged). PRD refs: O1, O2, O3, O4, O5.

The design reference is `components/actions.jsx` in the handoff zip (all 165 lines).

**Files to create:**
- `src/components/ActionBar.tsx` — port `ActionBar` from `actions.jsx`. Props:
  ```ts
  interface ActionBarProps {
    image: ImageItem | null;
    settings: Settings;
    images: ImageItem[];
    onUndo: () => void;
    onRedo: () => void;
    onReset: () => void;
    canUndo: boolean;
    canRedo: boolean;
    processing: boolean;
  }
  ```

  **Single download** (`downloadSingle`): calls `imageProcessing.processImage`, converts to blob
  via `imageProcessing.canvasToBlob`, creates an object URL, triggers `<a>.click()`, revokes URL.

  **Bulk ZIP download** (`downloadAllZip`): the handoff uses fflate loaded from a CDN script tag —
  replace this with a proper npm package. Install `fflate` (`pnpm add fflate`). Import
  `{ zipSync }` from `'fflate'`. Process each image sequentially (not parallel — avoids memory
  spikes with large batches). Show a `busy` state on the button during processing.

  **Copy to clipboard**: uses `navigator.clipboard.write` with a `ClipboardItem`. Always converts
  to PNG for clipboard (browser requirement). Show "✓ Copied" for 2 seconds on success; show an
  alert on failure (some browsers block this outside https).

  **Base64 export**: renders a modal with a `<textarea readOnly>` containing the full data URL.
  The modal has a "Copy to clipboard" button and shows the string size via `formatBytes`.
  Clicking the overlay or the × button closes the modal. The modal markup is in the handoff at
  lines 144-160 — port it exactly.

  **Filename templating** (`getFilename`): replaces `{name}` with the base filename (no extension)
  and `{index}` with a zero-padded index. Already implemented in handoff lines 9-16 — port as-is.

  The undo/redo buttons (with SVG arrows) and Reset button are in the left action group. They are
  disabled when `canUndo` / `canRedo` is false. These will be wired to real state in PR 11; for
  now just pass the props through and render them as disabled.

**Files to modify:**
- `src/App.tsx` — render `ActionBar` at the bottom of the layout (fixed footer bar). Pass
  `canUndo={false}` and `canRedo={false}` placeholders for now. Wire up the real `images` array.

**Acceptance criteria:**
- Click "↓ Download" → file downloads with the correct format and filename
- Click "↓ ZIP (3)" with 3 images loaded → zip file downloads containing 3 processed images
- Click "Copy" → image is in clipboard (test in Chrome)
- Click "Base64" → modal opens with textarea; "Copy to clipboard" button copies the string; × closes modal
- Filename `{name}_{index}` → files named `photo_01.jpg`, `photo_02.jpg`, etc.
- No TS errors
```

---

## PR 11 — Undo/Redo & UX Polish (`feat/undo-redo`)

```
Branch off `feat/download` (or main if merged). PRD refs: H1, H2, H4, H5.

**Undo/redo stack per image:**

Create `src/hooks/useEditHistory.ts`:
```ts
export function useEditHistory(initialSettings: Settings) {
  // stack of Settings snapshots; pointer moves back/forward
  // Returns: { settings, apply, undo, redo, reset, canUndo, canRedo }
}
```
- `apply(newSettings: Settings)` pushes a new snapshot onto the stack and advances the pointer.
  Cap the stack at 50 entries per image (drop the oldest when exceeded).
- `undo()` moves the pointer back one step.
- `redo()` moves the pointer forward one step.
- `reset()` resets to the initial settings (index 0) and clears the stack.

In `src/App.tsx`, maintain one history instance per `ImageItem.id`. When switching images,
restore that image's history. When settings change via any control panel, call `apply` instead
of patching state directly. Wire `onUndo`, `onRedo`, `onReset`, `canUndo`, `canRedo` from the
active image's history into `ActionBar`.

**Keyboard shortcuts:**
Add a `useEffect` in `App.tsx` that listens to `keydown` on `window`:
- `Ctrl+Z` / `Cmd+Z` → undo
- `Ctrl+Y` / `Cmd+Y` or `Ctrl+Shift+Z` → redo
- `Ctrl+D` / `Cmd+D` → trigger `downloadSingle` (prevent default to block browser bookmark dialog)

**Progress bar for bulk operations:**
In `ActionBar.tsx`, add a `progress: number | null` state (null = hidden, 0–100 = visible).
During `downloadAllZip`, update progress after each image: `(i + 1) / images.length * 100`.
Render a slim bar (2px tall, `background: var(--accent)`, `width: ${progress}%`) just above the
action bar when `progress !== null`. Hide it when done (set to null after 500ms).

**Error toasts for unsupported files / processing failures:**
Create `src/components/Toast.tsx` — a simple fixed-position toast that auto-dismisses after 3s.
In `App.tsx`, add `toasts: { id: string; message: string }[]` state and a `showToast(msg)` helper.
Render a `<Toast>` stack in the top-right corner.

Wire `showToast` to:
- Upload validation failures (e.g. a dropped `.psd` file that passes the `image/*` mime check
  but fails to load as an `<img>`) — catch the error in `addImages` and show "Could not load
  [filename]: unsupported format"
- `downloadAllZip` failures on individual images — catch per-image errors, skip the image, show
  "Skipped [filename]: processing failed"

**Loading spinner:**
The spinner CSS and markup already exist in `PreviewPanel` (from PR 7). No new work needed —
it's driven by the `processing` prop from `useImageProcessing`.

**Acceptance criteria:**
- Apply resize → apply filters → Ctrl+Z → filters reset, resize remains → Ctrl+Z → resize resets
- Ctrl+Y → redo restores the resize
- Click Reset → back to original (no edits)
- Switch to a different image → that image's own undo history is independent
- Bulk download 5 images → progress bar fills from left to right, disappears when done
- Drop a non-image file (e.g. a .txt) → toast appears "Could not load..."
- Ctrl+D → single download triggers
- No TS errors
```
