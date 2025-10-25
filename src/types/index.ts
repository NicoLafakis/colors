export interface ColorColumn {
  id: string;
  hex: string;
  locked: boolean;
}

export interface Palette {
  columns: ColorColumn[];
}

export type ColorFormat = 'HEX' | 'RGB' | 'HSL' | 'CMYK' | 'LAB' | 'HSB';

export interface ColorFormats {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
  hsb: { h: number; s: number; b: number };
}

export type ColorSchemeType = 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'random';

export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface PaletteAdjustments {
  hue: number;
  saturation: number;
  brightness: number;
  temperature: number;
}
