import { useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import html2canvas from 'html2canvas';
import ColorColumn from './ColorColumn';
import {
  ColorData,
  Palette,
  generateHarmoniousPalette,
  adjustColor,
  extractColorsFromImage,
} from './utils';

function App() {
  const [colors, setColors] = useState<ColorData[]>([]);
  const [favorites, setFavorites] = useState<Palette[]>([]);
  const [hueShift, setHueShift] = useState(0);
  const [saturationShift, setSaturationShift] = useState(0);
  const [brightnessShift, setBrightnessShift] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Initialize with 5 colors
  useEffect(() => {
    generateNewPalette();
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load favorites from localStorage
  const loadFavorites = () => {
    const saved = localStorage.getItem('colorPaletteFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Palette[]) => {
    localStorage.setItem('colorPaletteFavorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  // Generate new palette
  const generateNewPalette = useCallback(() => {
    const newColors = generateHarmoniousPalette(colors.length || 5);
    setColors((prevColors) => {
      if (prevColors.length === 0) {
        return newColors.map((hex, i) => ({
          id: `color-${Date.now()}-${i}`,
          hex,
          locked: false,
        }));
      }
      return prevColors.map((color, i) => {
        if (color.locked) return color;
        return { ...color, hex: newColors[i] || newColors[0] };
      });
    });
  }, [colors.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        generateNewPalette();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [generateNewPalette]);

  // Apply global adjustments
  const adjustedColors = colors.map((color) => ({
    ...color,
    hex: adjustColor(color.hex, hueShift, saturationShift, brightnessShift),
  }));

  const handleColorChange = (id: string, newColor: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hex: newColor } : c))
    );
  };

  const handleLockToggle = (id: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
    );
  };

  const handleRemove = (id: string) => {
    if (colors.length > 2) {
      setColors((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    setColors((prev) => {
      const newColors = [...prev];
      const [moved] = newColors.splice(fromIndex, 1);
      newColors.splice(toIndex, 0, moved);
      return newColors;
    });
  };

  const handleAddColor = () => {
    if (colors.length < 10) {
      const newColors = generateHarmoniousPalette(1);
      setColors((prev) => [
        ...prev,
        {
          id: `color-${Date.now()}`,
          hex: newColors[0],
          locked: false,
        },
      ]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extractedColors = await extractColorsFromImage(file);
      setColors(
        extractedColors.map((hex, i) => ({
          id: `color-${Date.now()}-${i}`,
          hex,
          locked: false,
        }))
      );
    }
  };

  const exportAsPNG = async () => {
    if (paletteRef.current) {
      const canvas = await html2canvas(paletteRef.current);
      const link = document.createElement('a');
      link.download = 'palette.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const exportAsCSS = () => {
    const css = adjustedColors
      .map(
        (color, i) =>
          `--color-${i + 1}: ${color.hex}; /* ${color.hex.toUpperCase()} */`
      )
      .join('\n');
    const blob = new Blob([`:root {\n  ${css}\n}`], { type: 'text/css' });
    const link = document.createElement('a');
    link.download = 'palette.css';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const exportAsHex = () => {
    const hexCodes = adjustedColors.map((c) => c.hex.toUpperCase()).join('\n');
    const blob = new Blob([hexCodes], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'palette.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const savePaletteToFavorites = () => {
    const name = prompt('Enter a name for this palette:');
    if (name) {
      const newPalette: Palette = {
        id: `palette-${Date.now()}`,
        name,
        colors: adjustedColors.map((c) => ({ ...c })),
      };
      saveFavorites([...favorites, newPalette]);
    }
  };

  const loadPalette = (palette: Palette) => {
    setColors(palette.colors.map((c) => ({ ...c, id: `color-${Date.now()}-${Math.random()}` })));
    setShowFavorites(false);
  };

  const deleteFavorite = (id: string) => {
    saveFavorites(favorites.filter((p) => p.id !== id));
  };

  const resetAdjustments = () => {
    setHueShift(0);
    setSaturationShift(0);
    setBrightnessShift(0);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 text-white p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold">Color Palette Generator</h1>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add color button */}
              <button
                onClick={handleAddColor}
                disabled={colors.length >= 10}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded transition-colors flex items-center gap-2"
                title="Add color (max 10)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add
              </button>

              {/* Generate button */}
              <button
                onClick={generateNewPalette}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
                title="Generate new palette (Spacebar)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Generate
              </button>

              {/* Image upload */}
              <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors cursor-pointer flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                From Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Export dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={exportAsPNG}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 rounded-t"
                  >
                    Export as PNG
                  </button>
                  <button
                    onClick={exportAsCSS}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                  >
                    Export as CSS
                  </button>
                  <button
                    onClick={exportAsHex}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 rounded-b"
                  >
                    Export as TXT
                  </button>
                </div>
              </div>

              {/* Favorites */}
              <button
                onClick={savePaletteToFavorites}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded transition-colors flex items-center gap-2"
                title="Save to favorites"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Save
              </button>

              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
              >
                Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </header>

        {/* Global adjustments */}
        <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
          <div className="container mx-auto">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <label className="w-24">Hue:</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={hueShift}
                  onChange={(e) => setHueShift(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right">{hueShift}°</span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <label className="w-24">Saturation:</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={saturationShift}
                  onChange={(e) => setSaturationShift(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right">{saturationShift}%</span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <label className="w-24">Brightness:</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={brightnessShift}
                  onChange={(e) => setBrightnessShift(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right">{brightnessShift}%</span>
              </div>
              <button
                onClick={resetAdjustments}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Favorites panel */}
        {showFavorites && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Saved Palettes</h2>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {favorites.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No saved palettes yet</p>
              ) : (
                <div className="space-y-4">
                  {favorites.map((palette) => (
                    <div key={palette.id} className="bg-gray-700 rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{palette.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadPalette(palette)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteFavorite(palette.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 h-12">
                        {palette.colors.map((color) => (
                          <div
                            key={color.id}
                            className="flex-1 rounded"
                            style={{ backgroundColor: color.hex }}
                            title={color.hex}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color palette */}
        <div ref={paletteRef} className="flex-1 flex">
          {adjustedColors.map((color, index) => (
            <ColorColumn
              key={color.id}
              id={color.id}
              color={color.hex}
              locked={color.locked}
              index={index}
              onColorChange={handleColorChange}
              onLockToggle={handleLockToggle}
              onRemove={handleRemove}
              onMove={handleMove}
              canRemove={colors.length > 2}
            />
          ))}
        </div>

        {/* Footer hint */}
        <footer className="bg-gray-800 text-white text-center py-2 text-sm">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded">Spacebar</kbd> to generate new palette • 
          Click hex to copy • Drag to reorder • {colors.length}/10 colors
        </footer>
      </div>
    </DndProvider>
  );
}

export default App;
