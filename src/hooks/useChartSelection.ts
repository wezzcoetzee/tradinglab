import { useState, useCallback, useRef } from "react";
import type { CategoricalChartState } from "recharts/types/chart/types";

export interface ChartSelection {
  startDate: string | null;
  endDate: string | null;
}

interface UseChartSelectionReturn {
  selection: ChartSelection;
  isDragging: boolean;
  handleMouseDown: (state: CategoricalChartState) => void;
  handleMouseMove: (state: CategoricalChartState) => void;
  handleMouseUp: () => void;
  resetSelection: () => void;
  setSelection: (selection: ChartSelection) => void;
}

export function useChartSelection(): UseChartSelectionReturn {
  const [selection, setSelection] = useState<ChartSelection>({
    startDate: null,
    endDate: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<string | null>(null);

  const handleMouseDown = useCallback((state: CategoricalChartState) => {
    if (state.activeLabel) {
      dragStart.current = state.activeLabel as string;
      setIsDragging(true);
      setSelection({
        startDate: state.activeLabel as string,
        endDate: state.activeLabel as string,
      });
    }
  }, []);

  const handleMouseMove = useCallback(
    (state: CategoricalChartState) => {
      if (isDragging && state.activeLabel && dragStart.current) {
        const currentLabel = state.activeLabel as string;
        const start = dragStart.current;

        const [startDate, endDate] =
          start <= currentLabel ? [start, currentLabel] : [currentLabel, start];

        setSelection({ startDate, endDate });
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const resetSelection = useCallback(() => {
    setSelection({ startDate: null, endDate: null });
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  return {
    selection,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetSelection,
    setSelection,
  };
}
