export type Theme = 'light' | 'dark'

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
  src: string;
  size: number;
  width: number;
  height: number;
  processed: boolean;
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  resize: {
    enabled: false,
    mode: 'pixels',
    width: '',
    height: '',
    percent: '100',
    preset: '',
    lockAspect: true,
    fitMode: 'contain',
  },
  transform: {
    rotation: 0,
    flipH: false,
    flipV: false,
    crop: null,
  },
  adjustments: {
    brightness: 100,
    contrast: 100,
    blur: 0,
    grayscale: false,
  },
  watermark: {
    textEnabled: false,
    text: '',
    textSize: 32,
    textColor: '#ffffff',
    textOpacity: 80,
    textPosition: 'bottom-right',
    textFont: 'DM Sans',
    logoEnabled: false,
    logoSrc: null,
    logoSize: 20,
    logoOpacity: 80,
    logoPosition: 'bottom-right',
  },
  output: {
    format: 'jpg',
    quality: 88,
    stripExif: true,
    filename: '{name}_{index}',
  },
};

export const PRESETS: { label: string; w: number; h: number }[] = [
  { label: '1080p', w: 1920, h: 1080 },
  { label: '4K', w: 3840, h: 2160 },
  { label: 'Instagram', w: 1080, h: 1080 },
  { label: 'Twitter', w: 1200, h: 675 },
  { label: 'Facebook', w: 1200, h: 630 },
  { label: 'LinkedIn', w: 1200, h: 627 },
  { label: 'Thumbnail', w: 1280, h: 720 },
];
