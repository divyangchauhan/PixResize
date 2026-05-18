import type { Settings } from '@/types'
import { computeOutputDimensions } from '@/utils/resize'

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const mime =
      format === 'jpg' ? 'image/jpeg'
      : format === 'png' ? 'image/png'
      : format === 'webp' ? 'image/webp'
      : 'image/avif';
    canvas.toBlob(resolve, mime, quality / 100);
  });
}

export function getWatermarkPos(
  position: string,
  w: number,
  h: number,
): { x: number; y: number } {
  const pad = 24;
  const map: Record<string, { x: number; y: number }> = {
    'top-left':      { x: pad + w * 0.1,     y: pad + h * 0.05 },
    'top-center':    { x: w / 2,              y: pad + h * 0.05 },
    'top-right':     { x: w - pad - w * 0.1,  y: pad + h * 0.05 },
    'center':        { x: w / 2,              y: h / 2 },
    'bottom-left':   { x: pad + w * 0.1,     y: h - pad - h * 0.05 },
    'bottom-center': { x: w / 2,              y: h - pad - h * 0.05 },
    'bottom-right':  { x: w - pad - w * 0.1,  y: h - pad - h * 0.05 },
  };
  return map[position] ?? { x: w / 2, y: h - 40 };
}

export async function processImage(
  originalSrc: string,
  settings: Settings,
): Promise<HTMLCanvasElement> {
  const { resize, transform, adjustments, watermark } = settings;

  const img = await loadImage(originalSrc);

  const { w: outW, h: outH } = computeOutputDimensions(
    resize,
    img.naturalWidth,
    img.naturalHeight,
  );

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const rot = transform.rotation % 360;
  const swap = rot === 90 || rot === 270;
  canvas.width = swap ? outH : outW;
  canvas.height = swap ? outW : outH;

  ctx.save();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (transform.rotation) ctx.rotate((transform.rotation * Math.PI) / 180);
  if (transform.flipH) ctx.scale(-1, 1);
  if (transform.flipV) ctx.scale(1, -1);

  const filters: string[] = [];
  if (adjustments.brightness !== 100) filters.push(`brightness(${adjustments.brightness}%)`);
  if (adjustments.contrast !== 100) filters.push(`contrast(${adjustments.contrast}%)`);
  if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);
  if (adjustments.grayscale) filters.push('grayscale(100%)');
  if (filters.length) ctx.filter = filters.join(' ');

  const fitMode = resize.fitMode || 'contain';
  let dx = -outW / 2, dy = -outH / 2, dw = outW, dh = outH;

  if (fitMode === 'cover') {
    const scaleW = outW / img.naturalWidth;
    const scaleH = outH / img.naturalHeight;
    const scale = Math.max(scaleW, scaleH);
    dw = img.naturalWidth * scale;
    dh = img.naturalHeight * scale;
    dx = -(dw / 2);
    dy = -(dh / 2);
  } else if (fitMode === 'contain') {
    const scaleW = outW / img.naturalWidth;
    const scaleH = outH / img.naturalHeight;
    const scale = Math.min(scaleW, scaleH);
    dw = img.naturalWidth * scale;
    dh = img.naturalHeight * scale;
    dx = -(dw / 2);
    dy = -(dh / 2);
  }

  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);
  ctx.restore();

  if (watermark.textEnabled && watermark.text) {
    ctx.save();
    ctx.globalAlpha = watermark.textOpacity / 100;
    ctx.font = `${watermark.textSize}px ${watermark.textFont || 'sans-serif'}`;
    ctx.fillStyle = watermark.textColor || '#ffffff';
    const pos = getWatermarkPos(watermark.textPosition, canvas.width, canvas.height);
    const metrics = ctx.measureText(watermark.text);
    ctx.fillText(watermark.text, pos.x - metrics.width / 2, pos.y);
    ctx.restore();
  }

  if (watermark.logoEnabled && watermark.logoSrc) {
    try {
      const logo = await loadImage(watermark.logoSrc);
      ctx.save();
      ctx.globalAlpha = watermark.logoOpacity / 100;
      const lw = (watermark.logoSize / 100) * canvas.width;
      const lh = (lw / logo.naturalWidth) * logo.naturalHeight;
      const pos = getWatermarkPos(watermark.logoPosition, canvas.width, canvas.height);
      ctx.drawImage(logo, pos.x - lw / 2, pos.y - lh / 2, lw, lh);
      ctx.restore();
    } catch {
      /* logo failed to load — skip the logo watermark */
    }
  }

  return canvas;
}

export async function estimateSize(
  originalSrc: string,
  settings: Settings,
  format: string,
  quality: number,
): Promise<number> {
  try {
    const canvas = await processImage(originalSrc, settings);
    const blob = await canvasToBlob(canvas, format, quality);
    return blob ? blob.size : 0;
  } catch {
    return 0;
  }
}
