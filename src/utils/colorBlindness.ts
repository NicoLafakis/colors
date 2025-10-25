import chroma from 'chroma-js';
import type { ColorBlindnessType } from '../types';

/**
 * Simulate color blindness on a color
 * Uses transformation matrices based on research by Brettel, Viénot and Mollon
 */
export function simulateColorBlindness(hex: string, type: ColorBlindnessType): string {
  if (type === 'none') return hex;

  const color = chroma(hex);
  const [r, g, b] = color.rgb();

  let transformedRgb: [number, number, number];

  switch (type) {
    case 'protanopia': // Red-blind
      transformedRgb = applyMatrix(r, g, b, [
        [0.56667, 0.43333, 0],
        [0.55833, 0.44167, 0],
        [0, 0.24167, 0.75833]
      ]);
      break;

    case 'deuteranopia': // Green-blind
      transformedRgb = applyMatrix(r, g, b, [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
      ]);
      break;

    case 'tritanopia': // Blue-blind
      transformedRgb = applyMatrix(r, g, b, [
        [0.95, 0.05, 0],
        [0, 0.43333, 0.56667],
        [0, 0.475, 0.525]
      ]);
      break;

    case 'achromatopsia': // Total color blindness (monochromacy)
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      transformedRgb = [gray, gray, gray];
      break;

    default:
      transformedRgb = [r, g, b];
  }

  const clampedRgb = transformedRgb.map(v => Math.max(0, Math.min(255, v)));
  return chroma.rgb(clampedRgb[0], clampedRgb[1], clampedRgb[2]).hex();
}

/**
 * Apply a transformation matrix to RGB values
 */
function applyMatrix(r: number, g: number, b: number, matrix: number[][]): [number, number, number] {
  return [
    matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b,
    matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b,
    matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b
  ];
}

/**
 * Get all simulated versions of a color
 */
export function getAllColorBlindnessSimulations(hex: string): Record<ColorBlindnessType, string> {
  return {
    none: hex,
    protanopia: simulateColorBlindness(hex, 'protanopia'),
    deuteranopia: simulateColorBlindness(hex, 'deuteranopia'),
    tritanopia: simulateColorBlindness(hex, 'tritanopia'),
    achromatopsia: simulateColorBlindness(hex, 'achromatopsia')
  };
}
