import { useState, useCallback } from 'react';
import { generatePalette } from '../utils/colorGeneration';
import type { ColorColumn, ColorSchemeType } from '../types';

/**
 * Hook for managing palette state
 */
export function usePalette(initialCount: number = 5) {
  const [columns, setColumns] = useState<ColorColumn[]>(() =>
    generateInitialPalette(initialCount)
  );

  const [schemeType, setSchemeType] = useState<ColorSchemeType>('random');

  const regeneratePalette = useCallback(() => {
    setColumns(prevColumns => {
      const lockedColumns = prevColumns.filter(col => col.locked);
      const unlockedCount = prevColumns.length - lockedColumns.length;

      if (unlockedCount === 0) {
        return prevColumns; // All locked, nothing to regenerate
      }

      const newColors = generatePalette(unlockedCount, lockedColumns, schemeType);

      const result: ColorColumn[] = [];
      let newColorIndex = 0;

      prevColumns.forEach(col => {
        if (col.locked) {
          result.push(col);
        } else {
          result.push({
            id: col.id,
            hex: newColors[newColorIndex++],
            locked: false
          });
        }
      });

      return result;
    });
  }, [schemeType]);

  const toggleLock = useCallback((id: string) => {
    setColumns(prev =>
      prev.map(col => (col.id === id ? { ...col, locked: !col.locked } : col))
    );
  }, []);

  const updateColor = useCallback((id: string, hex: string) => {
    setColumns(prev =>
      prev.map(col => (col.id === id ? { ...col, hex } : col))
    );
  }, []);

  const addColumn = useCallback((afterIndex?: number) => {
    setColumns(prev => {
      const newColumn: ColorColumn = {
        id: `color-${Date.now()}-${Math.random()}`,
        hex: generatePalette(1, prev, schemeType)[0],
        locked: false
      };

      if (afterIndex === undefined) {
        return [...prev, newColumn];
      }

      const newColumns = [...prev];
      newColumns.splice(afterIndex + 1, 0, newColumn);
      return newColumns;
    });
  }, [schemeType]);

  const removeColumn = useCallback((id: string) => {
    setColumns(prev => {
      if (prev.length <= 2) return prev; // Minimum 2 columns
      return prev.filter(col => col.id !== id);
    });
  }, []);

  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const [removed] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, removed);
      return newColumns;
    });
  }, []);

  const setAllColumns = useCallback((newColumns: ColorColumn[]) => {
    setColumns(newColumns);
  }, []);

  return {
    columns,
    schemeType,
    setSchemeType,
    regeneratePalette,
    toggleLock,
    updateColor,
    addColumn,
    removeColumn,
    reorderColumns,
    setAllColumns
  };
}

/**
 * Generate initial palette
 */
function generateInitialPalette(count: number): ColorColumn[] {
  const colors = generatePalette(count, [], 'random');

  return colors.map((hex, index) => ({
    id: `color-${index}`,
    hex,
    locked: false
  }));
}
