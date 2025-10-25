# ColorScheme - Real-Time Color Palette Generator

ColorScheme is a blazing-fast, interactive color palette generator designed for designers and developers. Generate harmonious color palettes instantly with a simple press of the spacebar, lock your favorite colors, and explore endless possibilities.

![ColorScheme Demo](https://via.placeholder.com/800x400/4F46E5/ffffff?text=ColorScheme)

## Features

### Core Features

- **Instant Generation**: Press spacebar to generate a new harmonious palette in <50ms
- **Smart Color Lock System**: Lock individual colors to keep them while regenerating others
- **Intelligent Color Theory**: Generate palettes based on:
  - Complementary schemes
  - Analogous schemes
  - Triadic schemes
  - Monochromatic schemes
  - Random harmonious combinations

### Advanced Features

- **Color Inspector**: Click any HEX value to view all color formats:
  - HEX, RGB, HSL
  - CMYK (for print design)
  - LAB (perceptually uniform)
  - HSB/HSV

- **Image Color Extraction**: Upload any image to extract its dominant colors using k-means clustering

- **Palette Adjustments**: Real-time global adjustments for:
  - Hue shift
  - Saturation boost/reduction
  - Brightness control
  - Temperature (warm/cool)

- **Accessibility**: Color blindness simulation for:
  - Protanopia (red-blind)
  - Deuteranopia (green-blind)
  - Tritanopia (blue-blind)
  - Achromatopsia (total color blindness)

- **Multiple Export Options**:
  - PNG image export
  - CSS variables
  - JSON format
  - Shareable URLs (palette encoded in URL)
  - Adobe Swatch Exchange (.ase)

- **Dynamic Column Management**:
  - Add/remove color columns (2-10 colors)
  - Remove individual columns
  - Minimum 2 columns enforced

- **Keyboard Shortcuts**:
  - `Space` - Generate new palette
  - `C` - Copy all colors to clipboard
  - `S` - Save palette (planned feature)
  - Arrow keys - Navigation (planned feature)

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for lightning-fast development
- **Color Manipulation**: Chroma.js for color space conversions
- **Styling**: Pure CSS with modern features
- **State Management**: React Hooks (useState, useCallback, useEffect)

## Project Structure

```
colors/
├── src/
│   ├── components/          # React components
│   │   ├── ColorColumn.tsx  # Individual color display
│   │   ├── Toolbar.tsx      # Top toolbar with controls
│   │   └── *.css           # Component styles
│   ├── hooks/              # Custom React hooks
│   │   ├── useKeyboard.ts  # Keyboard shortcut handler
│   │   └── usePalette.ts   # Palette state management
│   ├── utils/              # Utility functions
│   │   ├── colorGeneration.ts    # Palette algorithms
│   │   ├── colorConversion.ts    # Format conversion
│   │   ├── colorBlindness.ts     # Accessibility simulation
│   │   ├── imageExtraction.ts    # Image color extraction
│   │   └── export.ts            # Export functionality
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies and scripts
└── vite.config.ts         # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/colors.git
cd colors
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Generate Palettes**: Press `Space` or click "Generate" to create a new palette
2. **Lock Colors**: Click the lock icon (🔒) on any color to preserve it during regeneration
3. **Inspect Colors**: Click on a HEX value to see all color formats
4. **Copy Colors**: Click "Copy" next to any format to copy it to clipboard
5. **Remove Columns**: Click the ✕ button to remove individual color columns
6. **Add Columns**: Click "+ Add Color" to add more columns (max 10)
7. **Upload Image**: Click "Upload Image" to extract colors from any photo
8. **Adjust Palette**: Click "Adjust" to fine-tune hue, saturation, and brightness
9. **Check Accessibility**: Use the colorblindness dropdown to simulate different vision types
10. **Export**: Click "Export" to save your palette in various formats

## Color Theory Algorithms

### Complementary Scheme
Colors opposite on the color wheel (180° apart). Creates high contrast and vibrant looks.

### Analogous Scheme
Colors adjacent on the color wheel (within 60°). Creates harmonious, serene palettes.

### Triadic Scheme
Three colors evenly spaced (120° apart). Balanced and vibrant combinations.

### Monochromatic Scheme
Variations of a single hue with different saturation and lightness. Elegant and cohesive.

### Random Harmonious
Intelligently combines multiple harmony types with subtle variations for unique palettes.

## Performance Optimizations

- Color calculations are memoized to prevent unnecessary re-renders
- Image processing uses downsampled versions for faster extraction
- K-means clustering limited to 20 iterations for quick results
- Debounced slider adjustments to reduce computation
- Canvas API for efficient image manipulation

## Future Enhancements

- [ ] Drag-and-drop column reordering with @dnd-kit
- [ ] User authentication and palette saving
- [ ] Community palette sharing and browsing
- [ ] Gradient generator UI component
- [ ] Manual color picker for precise color input
- [ ] Undo/redo functionality
- [ ] Palette history
- [ ] More export formats (Sketch, Figma plugins)
- [ ] PWA support for offline usage
- [ ] Mobile-optimized interface
- [ ] Color name suggestions (e.g., "Ocean Blue")

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Color theory algorithms based on research in perceptual color spaces
- Colorblindness simulation matrices from Brettel, Viénot and Mollon research
- K-means clustering implementation for image color extraction
- Chroma.js library for robust color space conversions

## Developer Notes

### Architecture Decisions

- **React + TypeScript**: Type safety prevents color format bugs
- **Chroma.js**: Industry-standard color manipulation with LAB space for perceptually uniform gradients
- **HSL Generation**: Easier to create harmonious palettes than RGB
- **Canvas API**: Native browser support for fast image processing
- **Pure CSS**: No UI framework needed, keeps bundle size small

### Key Components

- `usePalette` hook: Central state management for palette operations
- `useKeyboard` hook: Declarative keyboard shortcut handling
- `generatePalette`: Core algorithm that creates harmonious colors
- `extractColorsFromImage`: K-means clustering for dominant color detection

---

Built with ❤️ for designers and developers who love colors.

**Press Space to get started!**
