# Color Palette Generator

A professional color palette generator inspired by Coolers.co, built with React, TypeScript, and Tailwind CSS.

![Color Palette Generator](https://github.com/user-attachments/assets/7fad7fb3-96f6-482a-bf21-7e80fb24367f)

## Features

### Core Features
- **5 Color Columns**: Full-screen display showing harmonious color palettes
- **Spacebar Generation**: Press spacebar to generate new random harmonious palettes
- **Lock Colors**: Lock individual colors to preserve them when regenerating
- **Hex Code Display**: Click hex codes to copy to clipboard
- **Color Picker**: Built-in color picker for each column to customize colors
- **Add/Remove Columns**: Support for 2-10 color columns
- **Drag to Reorder**: Reorder colors by dragging and dropping

### Export Options
- **Export as PNG**: Save your palette as an image
- **Export as CSS**: Export as CSS custom properties
- **Export as TXT**: Export hex codes as plain text

### Advanced Features
- **Global Adjustments**: Fine-tune all colors with hue, saturation, and brightness sliders
- **Image Upload**: Extract color palette from any image
- **Save to Favorites**: Save and manage your favorite palettes locally
- **Keyboard-Driven**: Fast, keyboard-accessible interface

### Color Harmony Algorithms
The generator uses multiple color harmony schemes:
- Complementary colors
- Analogous colors
- Triadic colors
- Tetradic colors
- Monochromatic colors

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Usage

### Keyboard Shortcuts
- **Spacebar**: Generate new palette
- All buttons are keyboard-accessible via Tab navigation

### Quick Start
1. Open the application
2. Press spacebar or click "Generate" to create a new palette
3. Click hex codes to copy them
4. Lock colors you like before generating a new palette
5. Use the color picker icon to fine-tune individual colors
6. Adjust global sliders to shift all colors together
7. Save your favorite palettes for later use
8. Export your palette in your preferred format

### Adding/Removing Colors
- Click "Add" to add a new color (max 10)
- Click the X button on any color to remove it (min 2)

### Drag to Reorder
- Click and drag any color column to reorder the palette

### Image Color Extraction
- Click "From Image" to upload an image
- The app will extract the dominant colors

### Favorites
- Click "Save" to save the current palette
- Click "Favorites" to view and load saved palettes

## Technologies

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server
- **react-dnd**: Drag and drop functionality
- **react-color**: Color picker component
- **html2canvas**: PNG export functionality

## Project Structure

```
src/
├── App.tsx           # Main application component
├── ColorColumn.tsx   # Individual color column component
├── utils.ts          # Color utilities and algorithms
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## License

MIT