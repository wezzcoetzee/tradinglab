"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SmaResult } from "@/lib/backtest";
import { formatPercent } from "@/lib/formatting";

interface ReturnsHeatmapProps {
  results: SmaResult[];
  onSelectPeriod?: (period: number) => void;
  selectedPeriod?: number;
}

function getColorForReturn(value: number): string {
  if (value >= 0.5) return "bg-green-600";
  if (value >= 0.3) return "bg-green-500";
  if (value >= 0.15) return "bg-green-400";
  if (value >= 0.05) return "bg-green-300";
  if (value >= 0) return "bg-green-200";
  if (value >= -0.05) return "bg-red-200";
  if (value >= -0.15) return "bg-red-300";
  if (value >= -0.3) return "bg-red-400";
  return "bg-red-500";
}

export function ReturnsHeatmap({
  results,
  onSelectPeriod,
  selectedPeriod,
}: ReturnsHeatmapProps) {
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => a.period - b.period);
  }, [results]);

  const { minReturn, maxReturn } = useMemo(() => {
    const validResults = sortedResults.filter((r) => !r.liquidated);
    if (validResults.length === 0) return { minReturn: 0, maxReturn: 0 };
    const returns = validResults.map((r) => r.annualizedReturn);
    return {
      minReturn: Math.min(...returns),
      maxReturn: Math.max(...returns),
    };
  }, [sortedResults]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Returns by SMA Period</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {sortedResults.map((result) => {
              const isSelected = result.period === selectedPeriod;
              return (
                <button
                  key={result.period}
                  onClick={() => onSelectPeriod?.(result.period)}
                  className={`
                    w-6 h-6 text-[10px] font-mono rounded-sm transition-all
                    ${result.liquidated ? "bg-neutral-800 text-neutral-500" : getColorForReturn(result.annualizedReturn)}
                    ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                    hover:scale-110 hover:z-10
                  `}
                  title={`${result.period}D: ${result.liquidated ? "Liquidated" : formatPercent(result.annualizedReturn)}`}
                >
                  {result.period}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span>{formatPercent(minReturn)}</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-red-500 via-green-200 to-green-600" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded-sm" />
              <span>{formatPercent(maxReturn)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
