import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ChromePicker } from 'react-color';
import { getContrastColor } from './utils';

interface ColorColumnProps {
  id: string;
  color: string;
  locked: boolean;
  index: number;
  onColorChange: (id: string, color: string) => void;
  onLockToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  canRemove: boolean;
}

const ItemType = 'COLOR_COLUMN';

const ColorColumn: React.FC<ColorColumnProps> = ({
  id,
  color,
  locked,
  index,
  onColorChange,
  onLockToggle,
  onRemove,
  onMove,
  canRemove,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(color.toUpperCase())
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {
          // Fallback: copy failed
          setCopied(false);
        });
    } else {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = color.toUpperCase();
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        setCopied(false);
      }
    }
  };

  const textColor = getContrastColor(color);

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="relative flex-1 flex flex-col items-center justify-center transition-opacity"
      style={{
        backgroundColor: color,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
    >
      {/* Lock button */}
      <button
        onClick={() => onLockToggle(id)}
        className="absolute top-4 right-4 p-2 rounded hover:bg-black hover:bg-opacity-20 transition-colors"
        style={{ color: textColor }}
        title={locked ? 'Unlock' : 'Lock'}
      >
        {locked ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
          </svg>
        )}
      </button>

      {/* Remove button */}
      {canRemove && (
        <button
          onClick={() => onRemove(id)}
          className="absolute top-4 left-4 p-2 rounded hover:bg-black hover:bg-opacity-20 transition-colors"
          style={{ color: textColor }}
          title="Remove color"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Hex code - clickable to copy */}
      <button
        onClick={handleCopy}
        className="text-2xl font-mono font-bold mb-4 px-4 py-2 rounded hover:bg-black hover:bg-opacity-20 transition-colors"
        style={{ color: textColor }}
        title="Click to copy"
      >
        {copied ? 'Copied!' : color.toUpperCase()}
      </button>

      {/* Color picker button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="px-4 py-2 rounded hover:bg-black hover:bg-opacity-20 transition-colors"
        style={{ color: textColor }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Color picker popup */}
      {showPicker && (
        <div className="absolute bottom-20 z-10">
          <div
            className="fixed inset-0"
            onClick={() => setShowPicker(false)}
          />
          <ChromePicker
            color={color}
            onChange={(c) => onColorChange(id, c.hex)}
            disableAlpha
          />
        </div>
      )}
    </div>
  );
};

export default ColorColumn;
