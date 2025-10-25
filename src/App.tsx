import { useState, useEffect } from 'react';
import { ColorColumn } from './components/ColorColumn';
import { Toolbar } from './components/Toolbar';
import { usePalette } from './hooks/usePalette';
import { useKeyboard } from './hooks/useKeyboard';
import { adjustPalette } from './utils/colorGeneration';
import { simulateColorBlindness } from './utils/colorBlindness';
import { parsePaletteFromURL } from './utils/export';
import type { ColorBlindnessType, ColorColumn as ColorColumnType } from './types';
import './App.css';

function App() {
  const {
    columns,
    schemeType,
    setSchemeType,
    regeneratePalette,
    toggleLock,
    updateColor,
    addColumn,
    removeColumn,
    setAllColumns
  } = usePalette(5);

  const [colorBlindnessMode, setColorBlindnessMode] = useState<ColorBlindnessType>('none');
  const [displayColumns, setDisplayColumns] = useState(columns);

  // Load palette from URL on mount
  useEffect(() => {
    const urlColors = parsePaletteFromURL();
    if (urlColors) {
      const newColumns: ColorColumnType[] = urlColors.map((hex, index) => ({
        id: `color-${index}`,
        hex,
        locked: false
      }));
      setAllColumns(newColumns);
    }
  }, [setAllColumns]);

  // Apply color blindness simulation
  useEffect(() => {
    if (colorBlindnessMode === 'none') {
      setDisplayColumns(columns);
    } else {
      const simulatedColumns = columns.map(col => ({
        ...col,
        hex: simulateColorBlindness(col.hex, colorBlindnessMode)
      }));
      setDisplayColumns(simulatedColumns);
    }
  }, [columns, colorBlindnessMode]);

  // Keyboard shortcuts
  useKeyboard({
    ' ': (e) => {
      e.preventDefault();
      regeneratePalette();
    },
    'c': () => {
      const hexValues = columns.map(c => c.hex).join(', ');
      navigator.clipboard.writeText(hexValues);
    },
    's': () => {
      console.log('Save palette (would open save dialog)');
    },
    'arrowleft': () => {
      console.log('Navigate left (future feature)');
    },
    'arrowright': () => {
      console.log('Navigate right (future feature)');
    }
  });

  const handleImportImage = (colors: string[]) => {
    const newColumns: ColorColumnType[] = colors.map((hex, index) => ({
      id: `color-import-${index}`,
      hex,
      locked: false
    }));
    setAllColumns(newColumns);
  };

  const handleAdjustments = (adjustments: {
    hue?: number;
    saturation?: number;
    brightness?: number;
  }) => {
    const currentHexes = columns.map(c => c.hex);
    const adjustedHexes = adjustPalette(currentHexes, adjustments);

    const newColumns = columns.map((col, index) => ({
      ...col,
      hex: adjustedHexes[index]
    }));

    setAllColumns(newColumns);
  };

  return (
    <div className="app">
      <Toolbar
        columns={columns}
        schemeType={schemeType}
        onSchemeTypeChange={setSchemeType}
        onRegenerate={regeneratePalette}
        onAddColumn={() => addColumn()}
        onImportImage={handleImportImage}
        onAdjustments={handleAdjustments}
        onColorBlindnessMode={setColorBlindnessMode}
        colorBlindnessMode={colorBlindnessMode}
      />

      <div className="palette-container">
        {displayColumns.map((column) => (
          <ColorColumn
            key={column.id}
            column={column}
            onToggleLock={toggleLock}
            onUpdateColor={updateColor}
            onRemove={removeColumn}
            canRemove={displayColumns.length > 2}
          />
        ))}
      </div>

      {/* Instructions overlay */}
      <div className="instructions">
        <kbd>Space</kbd> Generate new palette
        <span className="separator">•</span>
        <kbd>C</kbd> Copy colors
        <span className="separator">•</span>
        Click HEX to inspect
        <span className="separator">•</span>
        🔒 Lock to keep colors
      </div>
    </div>
  );
}

export default App;
