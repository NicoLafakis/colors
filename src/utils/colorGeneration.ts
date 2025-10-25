import chroma from 'chroma-js';
import type { ColorColumn, ColorSchemeType } from '../types';

/**
 * Generate a harmonious color palette based on color theory
 */
export function generatePalette(
  count: number,
  lockedColors: ColorColumn[] = [],
  schemeType: ColorSchemeType = 'random'
): string[] {
  const lockedHexes = lockedColors.map(c => c.hex);

  // If we have locked colors, generate colors that complement them
  if (lockedHexes.length > 0) {
    return generateComplementaryColors(count, lockedHexes);
  }

  // Otherwise generate a fresh palette based on the scheme type
  switch (schemeType) {
    case 'complementary':
      return generateComplementaryScheme(count);
    case 'analogous':
      return generateAnalogousScheme(count);
    case 'triadic':
      return generateTriadicScheme(count);
    case 'monochromatic':
      return generateMonochromaticScheme(count);
    default:
      return generateRandomHarmoniousScheme(count);
  }
}

/**
 * Generate colors that complement existing locked colors
 */
function generateComplementaryColors(count: number, lockedHexes: string[]): string[] {
  const baseColor = chroma(lockedHexes[0]);
  const baseHue = baseColor.get('hsl.h');
  const baseSat = baseColor.get('hsl.s');

  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate hues that are harmonious with the base
    const hueOffset = (i * 360 / count) + (Math.random() * 30 - 15);
    const newHue = (baseHue + hueOffset) % 360;

    // Vary saturation and lightness for visual interest
    const saturation = Math.max(0.3, Math.min(1, baseSat + (Math.random() * 0.4 - 0.2)));
    const lightness = Math.random() * 0.5 + 0.25; // 25% to 75%

    const color = chroma.hsl(newHue, saturation, lightness);
    colors.push(color.hex());
  }

  return colors;
}

/**
 * Generate a complementary color scheme
 */
function generateComplementaryScheme(count: number): string[] {
  const baseHue = Math.random() * 360;
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = i % 2 === 0 ? baseHue : (baseHue + 180) % 360;
    const saturation = 0.6 + Math.random() * 0.3;
    const lightness = 0.3 + Math.random() * 0.4;

    colors.push(chroma.hsl(hue, saturation, lightness).hex());
  }

  return colors;
}

/**
 * Generate an analogous color scheme (adjacent hues)
 */
function generateAnalogousScheme(count: number): string[] {
  const baseHue = Math.random() * 360;
  const colors: string[] = [];
  const hueRange = 60; // 60 degrees on the color wheel

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (i * hueRange / count)) % 360;
    const saturation = 0.5 + Math.random() * 0.4;
    const lightness = 0.3 + Math.random() * 0.4;

    colors.push(chroma.hsl(hue, saturation, lightness).hex());
  }

  return colors;
}

/**
 * Generate a triadic color scheme (120 degrees apart)
 */
function generateTriadicScheme(count: number): string[] {
  const baseHue = Math.random() * 360;
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (i % 3) * 120) % 360;
    const saturation = 0.5 + Math.random() * 0.4;
    const lightness = 0.3 + Math.random() * 0.4;

    colors.push(chroma.hsl(hue, saturation, lightness).hex());
  }

  return colors;
}

/**
 * Generate a monochromatic scheme (same hue, different saturation/lightness)
 */
function generateMonochromaticScheme(count: number): string[] {
  const baseHue = Math.random() * 360;
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const saturation = 0.3 + (i / count) * 0.6;
    const lightness = 0.2 + (i / count) * 0.6;

    colors.push(chroma.hsl(baseHue, saturation, lightness).hex());
  }

  return colors;
}

/**
 * Generate a random but harmonious scheme
 */
function generateRandomHarmoniousScheme(count: number): string[] {
  const baseHue = Math.random() * 360;
  const colors: string[] = [];

  // Choose a random harmony type
  const harmonyTypes = [
    { name: 'complementary', offset: 180 },
    { name: 'split-complementary', offset: 150 },
    { name: 'analogous', offset: 30 },
    { name: 'triadic', offset: 120 }
  ];

  const harmony = harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];

  for (let i = 0; i < count; i++) {
    const hueVariation = (Math.random() - 0.5) * 20; // Small random variation
    const hue = (baseHue + (i * harmony.offset) + hueVariation) % 360;
    const saturation = 0.4 + Math.random() * 0.5;
    const lightness = 0.25 + Math.random() * 0.5;

    colors.push(chroma.hsl(hue, saturation, lightness).hex());
  }

  return colors;
}

/**
 * Adjust all colors in a palette
 */
export function adjustPalette(
  colors: string[],
  adjustments: { hue?: number; saturation?: number; brightness?: number; temperature?: number }
): string[] {
  return colors.map(hex => {
    let color = chroma(hex);

    if (adjustments.hue !== undefined && adjustments.hue !== 0) {
      const currentHue = color.get('hsl.h');
      color = color.set('hsl.h', (currentHue + adjustments.hue) % 360);
    }

    if (adjustments.saturation !== undefined && adjustments.saturation !== 0) {
      const currentSat = color.get('hsl.s');
      color = color.set('hsl.s', Math.max(0, Math.min(1, currentSat + adjustments.saturation)));
    }

    if (adjustments.brightness !== undefined && adjustments.brightness !== 0) {
      const currentLight = color.get('hsl.l');
      color = color.set('hsl.l', Math.max(0, Math.min(1, currentLight + adjustments.brightness)));
    }

    if (adjustments.temperature !== undefined && adjustments.temperature !== 0) {
      // Temperature shifts hue towards warm (orange) or cool (blue)
      const currentHue = color.get('hsl.h');
      const tempShift = adjustments.temperature > 0 ? 30 : 210; // Orange or blue
      const newHue = currentHue + (adjustments.temperature * tempShift);
      color = color.set('hsl.h', newHue % 360);
    }

    return color.hex();
  });
}

/**
 * Generate a gradient between colors
 */
export function generateGradient(colors: string[], steps: number = 10): string[] {
  if (colors.length < 2) return colors;

  const gradient: string[] = [];
  const segmentSteps = Math.floor(steps / (colors.length - 1));

  for (let i = 0; i < colors.length - 1; i++) {
    const scale = chroma.scale([colors[i], colors[i + 1]]).mode('lab');

    for (let j = 0; j < segmentSteps; j++) {
      const t = j / segmentSteps;
      gradient.push(scale(t).hex());
    }
  }

  gradient.push(colors[colors.length - 1]);

  return gradient;
}
