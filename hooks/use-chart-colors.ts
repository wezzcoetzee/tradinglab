"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

interface ChartColors {
  positive: string;
  negative: string;
  warning: string;
}

const LIGHT_COLORS: ChartColors = {
  positive: "#16a34a",
  negative: "#dc2626",
  warning: "#d97706",
};

const DARK_COLORS: ChartColors = {
  positive: "#22c55e",
  negative: "#ef4444",
  warning: "#f59e0b",
};

export function useChartColors(): ChartColors {
  const { resolvedTheme } = useTheme();

  return useMemo(
    () => (resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS),
    [resolvedTheme]
  );
}
