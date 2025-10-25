import { useState } from 'react';
import type { ColorColumn, ColorSchemeType, ColorBlindnessType } from '../types';
import { extractColorsFromImage } from '../utils/imageExtraction';
import { exportAsPNG, exportAsCSS, exportAsJSON, generateShareableURL, downloadFile } from '../utils/export';
import { generateGradient } from '../utils/colorGeneration';
import './Toolbar.css';

interface ToolbarProps {
  columns: ColorColumn[];
  schemeType: ColorSchemeType;
  onSchemeTypeChange: (type: ColorSchemeType) => void;
  onRegenerate: () => void;
  onAddColumn: () => void;
  onImportImage: (colors: string[]) => void;
  onAdjustments: (adjustments: { hue?: number; saturation?: number; brightness?: number }) => void;
  onColorBlindnessMode: (type: ColorBlindnessType) => void;
  colorBlindnessMode: ColorBlindnessType;
}

export function Toolbar({
  columns,
  schemeType,
  onSchemeTypeChange,
  onRegenerate,
  onAddColumn,
  onImportImage,
  onAdjustments,
  onColorBlindnessMode,
  colorBlindnessMode
}: ToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const colors = await extractColorsFromImage(file, 5);
      onImportImage(colors);
    } catch (error) {
      console.error('Failed to extract colors:', error);
      alert('Failed to extract colors from image');
    }
  };

  const handleExport = (type: 'png' | 'css' | 'json' | 'share') => {
    const colors = columns.map(c => c.hex);

    switch (type) {
      case 'png':
        exportAsPNG(colors);
        break;
      case 'css':
        const css = exportAsCSS(colors);
        downloadFile(css, 'palette.css', 'text/css');
        break;
      case 'json':
        const json = exportAsJSON(columns);
        downloadFile(json, 'palette.json', 'application/json');
        break;
      case 'share':
        const url = generateShareableURL(colors);
        navigator.clipboard.writeText(url);
        alert('Shareable URL copied to clipboard!');
        break;
    }

    setShowExportMenu(false);
  };

  const handleShowGradient = () => {
    const colors = columns.map(c => c.hex);
    const gradientColors = generateGradient(colors, 50);
    console.log('Gradient:', gradientColors);
    // TODO: This would render a gradient view in a future update
    alert('Gradient generated! Check console for colors.');
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button className="toolbar-btn primary" onClick={onRegenerate} title="Press Space">
          Generate (Space)
        </button>

        <select
          value={schemeType}
          onChange={(e) => onSchemeTypeChange(e.target.value as ColorSchemeType)}
          className="toolbar-select"
        >
          <option value="random">Random Harmonious</option>
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triadic">Triadic</option>
          <option value="monochromatic">Monochromatic</option>
        </select>

        <button className="toolbar-btn" onClick={onAddColumn} title="Add Column">
          + Add Color
        </button>
      </div>

      <div className="toolbar-section">
        <label className="toolbar-btn file-upload">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>

        <button
          className="toolbar-btn"
          onClick={() => setShowAdjustments(!showAdjustments)}
        >
          Adjust
        </button>

        <select
          value={colorBlindnessMode}
          onChange={(e) => onColorBlindnessMode(e.target.value as ColorBlindnessType)}
          className="toolbar-select"
        >
          <option value="none">Normal Vision</option>
          <option value="protanopia">Protanopia (Red-blind)</option>
          <option value="deuteranopia">Deuteranopia (Green-blind)</option>
          <option value="tritanopia">Tritanopia (Blue-blind)</option>
          <option value="achromatopsia">Achromatopsia (Monochrome)</option>
        </select>

        <div className="export-menu">
          <button
            className="toolbar-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            Export
          </button>

          {showExportMenu && (
            <div className="export-dropdown">
              <button onClick={() => handleExport('png')}>Export as PNG</button>
              <button onClick={() => handleExport('css')}>Export as CSS</button>
              <button onClick={() => handleExport('json')}>Export as JSON</button>
              <button onClick={() => handleExport('share')}>Copy Shareable Link</button>
            </div>
          )}
        </div>

        <button className="toolbar-btn" onClick={handleShowGradient}>
          Gradient
        </button>
      </div>

      {showAdjustments && (
        <div className="adjustments-panel">
          <AdjustmentSlider
            label="Hue"
            min={-180}
            max={180}
            step={1}
            onChange={(value) => onAdjustments({ hue: value })}
          />
          <AdjustmentSlider
            label="Saturation"
            min={-1}
            max={1}
            step={0.01}
            onChange={(value) => onAdjustments({ saturation: value })}
          />
          <AdjustmentSlider
            label="Brightness"
            min={-0.5}
            max={0.5}
            step={0.01}
            onChange={(value) => onAdjustments({ brightness: value })}
          />
        </div>
      )}
    </div>
  );
}

function AdjustmentSlider({
  label,
  min,
  max,
  step,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [value, setValue] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="adjustment-slider">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
      <span>{value.toFixed(2)}</span>
    </div>
  );
}
