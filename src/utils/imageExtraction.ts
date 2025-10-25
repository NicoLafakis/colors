/**
 * Extract dominant colors from an image using k-means clustering
 */
export async function extractColorsFromImage(
  imageFile: File,
  colorCount: number = 5
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      try {
        const colors = extractFromImageElement(img, colorCount);
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = reject;
    reader.onerror = reject;

    reader.readAsDataURL(imageFile);
  });
}

/**
 * Extract colors from an image element
 */
export function extractFromImageElement(img: HTMLImageElement, colorCount: number = 5): string[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Resize image for faster processing
  const maxSize = 200;
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Sample pixels (every 4th pixel for performance)
  const sampledPixels: [number, number, number][] = [];
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Skip transparent pixels and very dark/light pixels
    if (a > 128 && r + g + b > 30 && r + g + b < 735) {
      sampledPixels.push([r, g, b]);
    }
  }

  if (sampledPixels.length === 0) {
    return ['#000000'];
  }

  // Apply k-means clustering
  const clusters = kMeansClustering(sampledPixels, colorCount);

  // Convert to hex
  return clusters.map(([r, g, b]) => {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });
}

/**
 * K-means clustering algorithm for color quantization
 */
function kMeansClustering(
  pixels: [number, number, number][],
  k: number,
  maxIterations: number = 20
): [number, number, number][] {
  // Initialize centroids randomly
  let centroids: [number, number, number][] = [];
  const usedIndices = new Set<number>();

  while (centroids.length < k && usedIndices.size < pixels.length) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!usedIndices.has(idx)) {
      centroids.push([...pixels[idx]]);
      usedIndices.add(idx);
    }
  }

  // If we don't have enough unique pixels, fill with random colors
  while (centroids.length < k) {
    centroids.push([
      Math.random() * 255,
      Math.random() * 255,
      Math.random() * 255
    ]);
  }

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign pixels to nearest centroid
    const clusters: [number, number, number][][] = Array(k).fill(null).map(() => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let closestCluster = 0;

      for (let i = 0; i < k; i++) {
        const dist = colorDistance(pixel, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = i;
        }
      }

      clusters[closestCluster].push(pixel);
    }

    // Recalculate centroids
    const newCentroids: [number, number, number][] = [];

    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) {
        newCentroids.push(centroids[i]);
        continue;
      }

      const sum = clusters[i].reduce(
        (acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]] as [number, number, number],
        [0, 0, 0] as [number, number, number]
      );

      newCentroids.push([
        sum[0] / clusters[i].length,
        sum[1] / clusters[i].length,
        sum[2] / clusters[i].length
      ]);
    }

    // Check for convergence
    const converged = centroids.every((centroid, i) =>
      colorDistance(centroid, newCentroids[i]) < 1
    );

    centroids = newCentroids;

    if (converged) break;
  }

  return centroids;
}

/**
 * Calculate Euclidean distance between two colors in RGB space
 */
function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

/**
 * Extract color from a specific pixel coordinate
 */
export function extractColorAtPoint(img: HTMLImageElement, x: number, y: number): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
}
