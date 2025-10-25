export interface ColorData {
  id: string;
  hex: string;
  locked: boolean;
}

export interface Palette {
  id: string;
  name: string;
  colors: ColorData[];
}

// Generate random hex color
export const generateRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

// Convert hex to HSL
export const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Convert HSL to hex
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Generate harmonious color palette using complementary, analogous, or triadic schemes
export const generateHarmoniousPalette = (count: number): string[] => {
  const schemes = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  
  const baseHue = Math.random() * 360;
  const colors: string[] = [];

  switch (scheme) {
    case 'complementary':
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i % 2) * 180 + (Math.random() - 0.5) * 20) % 360;
        const saturation = 60 + Math.random() * 30;
        const lightness = 45 + Math.random() * 25;
        colors.push(hslToHex(hue, saturation, lightness));
      }
      break;
    case 'analogous':
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + i * 30 + (Math.random() - 0.5) * 10) % 360;
        const saturation = 60 + Math.random() * 30;
        const lightness = 45 + Math.random() * 25;
        colors.push(hslToHex(hue, saturation, lightness));
      }
      break;
    case 'triadic':
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i % 3) * 120 + (Math.random() - 0.5) * 15) % 360;
        const saturation = 60 + Math.random() * 30;
        const lightness = 45 + Math.random() * 25;
        colors.push(hslToHex(hue, saturation, lightness));
      }
      break;
    case 'tetradic':
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i % 4) * 90 + (Math.random() - 0.5) * 15) % 360;
        const saturation = 60 + Math.random() * 30;
        const lightness = 45 + Math.random() * 25;
        colors.push(hslToHex(hue, saturation, lightness));
      }
      break;
    case 'monochromatic':
      for (let i = 0; i < count; i++) {
        const hue = baseHue;
        const saturation = 50 + Math.random() * 40;
        const lightness = 20 + i * (60 / count) + Math.random() * 10;
        colors.push(hslToHex(hue, saturation, lightness));
      }
      break;
  }

  return colors;
};

// Adjust color with global settings
export const adjustColor = (
  hex: string,
  hueShift: number,
  saturationShift: number,
  brightnessShift: number
): string => {
  const hsl = hexToHSL(hex);
  const newH = (hsl.h + hueShift) % 360;
  const newS = Math.max(0, Math.min(100, hsl.s + saturationShift));
  const newL = Math.max(0, Math.min(100, hsl.l + brightnessShift));
  return hslToHex(newH, newS, newL);
};

// Extract dominant colors from image
export const extractColorsFromImage = (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Scale down for performance
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Sample colors
        const colorMap = new Map<string, number>();
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }
        
        // Get top 5 colors
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([color]) => color);
        
        resolve(sortedColors.slice(0, 5));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Get contrasting text color
export const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};
