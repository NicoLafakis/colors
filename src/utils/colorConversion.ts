import chroma from 'chroma-js';
import type { ColorFormats } from '../types';

/**
 * Convert a color to all supported formats
 */
export function convertToAllFormats(hex: string): ColorFormats {
  const color = chroma(hex);

  const [r, g, b] = color.rgb();
  const [h, s, l] = color.hsl();
  const [labL, labA, labB] = color.lab();

  // Convert to CMYK
  const cmyk = rgbToCmyk(r, g, b);

  // Convert to HSB (HSV)
  const hsb = rgbToHsb(r, g, b);

  return {
    hex: color.hex(),
    rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
    hsl: { h: Math.round(h || 0), s: Math.round((s || 0) * 100), l: Math.round((l || 0) * 100) },
    cmyk,
    lab: { l: Math.round(labL), a: Math.round(labA), b: Math.round(labB) },
    hsb
  };
}

/**
 * Convert RGB to CMYK
 */
function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);

  return { c, m, y, k: Math.round(k * 100) };
}

/**
 * Convert RGB to HSB (HSV)
 */
function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) / 6;
    } else {
      h = ((rNorm - gNorm) / delta + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100)
  };
}

/**
 * Parse color from various input formats
 */
export function parseColor(input: string, format: string): string | null {
  try {
    switch (format.toUpperCase()) {
      case 'HEX':
        return chroma(input).hex();

      case 'RGB': {
        const match = input.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
        if (!match) return null;
        return chroma.rgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3])).hex();
      }

      case 'HSL': {
        const match = input.match(/(\d+),?\s*(\d+)%?,?\s*(\d+)%?/);
        if (!match) return null;
        return chroma.hsl(parseInt(match[1]), parseInt(match[2]) / 100, parseInt(match[3]) / 100).hex();
      }

      case 'CMYK': {
        const match = input.match(/(\d+)%?,?\s*(\d+)%?,?\s*(\d+)%?,?\s*(\d+)%?/);
        if (!match) return null;
        const [r, g, b] = cmykToRgb(
          parseInt(match[1]),
          parseInt(match[2]),
          parseInt(match[3]),
          parseInt(match[4])
        );
        return chroma.rgb(r, g, b).hex();
      }

      case 'LAB': {
        const match = input.match(/(-?\d+),?\s*(-?\d+),?\s*(-?\d+)/);
        if (!match) return null;
        return chroma.lab(parseInt(match[1]), parseInt(match[2]), parseInt(match[3])).hex();
      }

      case 'HSB': {
        const match = input.match(/(\d+),?\s*(\d+)%?,?\s*(\d+)%?/);
        if (!match) return null;
        const [r, g, b] = hsbToRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        return chroma.rgb(r, g, b).hex();
      }

      default:
        return chroma(input).hex();
    }
  } catch (e) {
    return null;
  }
}

/**
 * Convert CMYK to RGB
 */
function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  const cNorm = c / 100;
  const mNorm = m / 100;
  const yNorm = y / 100;
  const kNorm = k / 100;

  const r = Math.round(255 * (1 - cNorm) * (1 - kNorm));
  const g = Math.round(255 * (1 - mNorm) * (1 - kNorm));
  const b = Math.round(255 * (1 - yNorm) * (1 - kNorm));

  return [r, g, b];
}

/**
 * Convert HSB to RGB
 */
function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const bNorm = b / 100;

  const i = Math.floor(hNorm * 6);
  const f = hNorm * 6 - i;
  const p = bNorm * (1 - sNorm);
  const q = bNorm * (1 - f * sNorm);
  const t = bNorm * (1 - (1 - f) * sNorm);

  let r = 0, g = 0, bVal = 0;

  switch (i % 6) {
    case 0: r = bNorm; g = t; bVal = p; break;
    case 1: r = q; g = bNorm; bVal = p; break;
    case 2: r = p; g = bNorm; bVal = t; break;
    case 3: r = p; g = q; bVal = bNorm; break;
    case 4: r = t; g = p; bVal = bNorm; break;
    case 5: r = bNorm; g = p; bVal = q; break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(bVal * 255)];
}
