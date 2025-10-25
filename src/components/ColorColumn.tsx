import { useState } from 'react';
import { convertToAllFormats } from '../utils/colorConversion';
import { copyToClipboard } from '../utils/export';
import type { ColorColumn as ColorColumnType } from '../types';
import './ColorColumn.css';

interface ColorColumnProps {
  column: ColorColumnType;
  onToggleLock: (id: string) => void;
  onUpdateColor: (id: string, hex: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function ColorColumn({ column, onToggleLock, onRemove, canRemove }: ColorColumnProps) {
  const [showInspector, setShowInspector] = useState(false);
  const [copied, setCopied] = useState(false);

  const formats = convertToAllFormats(column.hex);

  const handleCopyHex = async () => {
    const success = await copyToClipboard(column.hex);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const isDark = isColorDark(column.hex);

  return (
    <div
      className="color-column"
      style={{ backgroundColor: column.hex }}
    >
      <div className="color-column-content">
        {/* Lock button */}
        <button
          className={`lock-btn ${isDark ? 'dark' : 'light'}`}
          onClick={() => onToggleLock(column.id)}
          title={column.locked ? 'Unlock color' : 'Lock color'}
        >
          {column.locked ? '🔒' : '🔓'}
        </button>

        {/* Color info */}
        <div className={`color-info ${isDark ? 'dark' : 'light'}`}>
          <button
            className="hex-value"
            onClick={() => setShowInspector(!showInspector)}
            title="Click to inspect color"
          >
            {column.hex.toUpperCase()}
          </button>

          <button
            className="copy-btn"
            onClick={handleCopyHex}
            title="Copy HEX value"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        {/* Inspector panel */}
        {showInspector && (
          <div className="color-inspector">
            <h3>Color Formats</h3>
            <div className="format-list">
              <FormatItem label="HEX" value={formats.hex} />
              <FormatItem label="RGB" value={`${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b}`} />
              <FormatItem label="HSL" value={`${formats.hsl.h}°, ${formats.hsl.s}%, ${formats.hsl.l}%`} />
              <FormatItem label="CMYK" value={`${formats.cmyk.c}%, ${formats.cmyk.m}%, ${formats.cmyk.y}%, ${formats.cmyk.k}%`} />
              <FormatItem label="LAB" value={`${formats.lab.l}, ${formats.lab.a}, ${formats.lab.b}`} />
              <FormatItem label="HSB" value={`${formats.hsb.h}°, ${formats.hsb.s}%, ${formats.hsb.b}%`} />
            </div>
            <button
              className="close-inspector"
              onClick={() => setShowInspector(false)}
            >
              Close
            </button>
          </div>
        )}

        {/* Remove button */}
        {canRemove && (
          <button
            className={`remove-btn ${isDark ? 'dark' : 'light'}`}
            onClick={() => onRemove(column.id)}
            title="Remove column"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function FormatItem({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <div className="format-item">
      <span className="format-label">{label}</span>
      <button className="format-value" onClick={handleCopy}>
        {value}
        {copied && <span className="copied-indicator"> ✓</span>}
      </button>
    </div>
  );
}

function isColorDark(hex: string): boolean {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  // Calculate luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance < 128;
}
