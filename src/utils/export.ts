import type { ColorColumn } from '../types';

/**
 * Export palette as PNG image
 */
export function exportAsPNG(colors: string[], width: number = 1920, height: number = 1080): void {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const columnWidth = width / colors.length;

  colors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(index * columnWidth, 0, columnWidth, height);
  });

  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `palette-${Date.now()}.png`;
    link.click();

    URL.revokeObjectURL(url);
  });
}

/**
 * Export palette as CSS variables
 */
export function exportAsCSS(colors: string[]): string {
  const variables = colors
    .map((color, index) => `  --color-${index + 1}: ${color};`)
    .join('\n');

  return `:root {\n${variables}\n}`;
}

/**
 * Export palette as CSS gradient
 */
export function exportAsCSSGradient(colors: string[], direction: string = 'to right'): string {
  const gradient = colors.join(', ');
  return `background: linear-gradient(${direction}, ${gradient});`;
}

/**
 * Export palette as JSON
 */
export function exportAsJSON(columns: ColorColumn[]): string {
  return JSON.stringify(
    {
      colors: columns.map(col => col.hex),
      palette: columns
    },
    null,
    2
  );
}

/**
 * Export palette as Adobe Swatch Exchange (.ase) format
 * Note: This creates a simplified version
 */
export function exportAsASE(colors: string[]): Blob {
  // ASE file format header
  const signature = 'ASEF';
  const version = [0, 1, 0, 0]; // Version 1.0
  const numColors = colors.length;

  // Convert to binary format (simplified)
  const header = new TextEncoder().encode(signature);
  const data = new Uint8Array(header.length + 12 + numColors * 50);

  let offset = 0;

  // Write signature
  data.set(header, offset);
  offset += header.length;

  // Write version
  data.set(version, offset);
  offset += 4;

  // Write number of blocks
  const numBlocks = new DataView(data.buffer);
  numBlocks.setUint32(offset, numColors, false);
  offset += 4;

  // Write each color block (simplified)
  colors.forEach((hex) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      // Block type (color entry = 0x0001)
      numBlocks.setUint16(offset, 1, false);
      offset += 2;

      // Block length
      numBlocks.setUint32(offset, 22, false);
      offset += 4;

      // Color name length (0 for unnamed)
      numBlocks.setUint16(offset, 0, false);
      offset += 2;

      // Color model ('RGB ')
      data.set(new TextEncoder().encode('RGB '), offset);
      offset += 4;

      // RGB values (32-bit float, 0.0 to 1.0)
      numBlocks.setFloat32(offset, rgb.r / 255, false);
      offset += 4;
      numBlocks.setFloat32(offset, rgb.g / 255, false);
      offset += 4;
      numBlocks.setFloat32(offset, rgb.b / 255, false);
      offset += 4;

      // Color type (global = 0)
      numBlocks.setUint16(offset, 0, false);
      offset += 2;
    }
  });

  return new Blob([data], { type: 'application/octet-stream' });
}

/**
 * Generate shareable URL with palette encoded
 */
export function generateShareableURL(colors: string[]): string {
  const colorString = colors.map(c => c.replace('#', '')).join('-');
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?palette=${colorString}`;
}

/**
 * Parse palette from URL
 */
export function parsePaletteFromURL(): string[] | null {
  const params = new URLSearchParams(window.location.search);
  const paletteParam = params.get('palette');

  if (!paletteParam) return null;

  const colors = paletteParam.split('-').map(c => `#${c}`);

  // Validate colors
  const validColors = colors.filter(c => /^#[0-9A-F]{6}$/i.test(c));

  return validColors.length > 0 ? validColors : null;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Download file
 */
export function downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Helper: Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}
