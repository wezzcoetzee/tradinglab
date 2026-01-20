"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { MaResult } from "@/lib/backtest";

interface MaSummaryTableProps {
  smaResults: MaResult[];
  emaResults: MaResult[];
  hodlReturn: number;
  onSelectPeriod: (period: number) => void;
  selectedPeriod?: number;
}

type SortField = "period" | "sma" | "ema" | "hodl";
type SortDirection = "asc" | "desc";

interface TableRow {
  period: number;
  smaReturn: number;
  emaReturn: number;
  hodlReturn: number;
  isBestSma: boolean;
  isBestEma: boolean;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function getReturnColor(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-rose-400";
  return "text-zinc-400";
}

export function MaSummaryTable({
  smaResults,
  emaResults,
  hodlReturn,
  onSelectPeriod,
  selectedPeriod,
}: MaSummaryTableProps) {
  const [sortField, setSortField] = useState<SortField>("period");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const bestSmaPeriod = useMemo(() => {
    return smaResults.reduce((best, current) =>
      current.totalReturn > best.totalReturn ? current : best
    , smaResults[0]).period;
  }, [smaResults]);

  const bestEmaPeriod = useMemo(() => {
    return emaResults.reduce((best, current) =>
      current.totalReturn > best.totalReturn ? current : best
    , emaResults[0]).period;
  }, [emaResults]);

  const rows: TableRow[] = useMemo(() => {
    const emaMap = new Map(emaResults.map(r => [r.period, r]));

    return smaResults.map((sma) => {
      const ema = emaMap.get(sma.period);
      return {
        period: sma.period,
        smaReturn: sma.totalReturn,
        emaReturn: ema?.totalReturn ?? 0,
        hodlReturn,
        isBestSma: sma.period === bestSmaPeriod,
        isBestEma: sma.period === bestEmaPeriod,
      };
    });
  }, [smaResults, emaResults, hodlReturn, bestSmaPeriod, bestEmaPeriod]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    sorted.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case "period":
          aVal = a.period;
          bVal = b.period;
          break;
        case "sma":
          aVal = a.smaReturn;
          bVal = b.smaReturn;
          break;
        case "ema":
          aVal = a.emaReturn;
          bVal = b.emaReturn;
          break;
        case "hodl":
          aVal = a.hodlReturn;
          bVal = b.hodlReturn;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
    );
  };

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/50">
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <h3 className="text-sm font-medium text-zinc-300">MA Performance Summary</h3>
      </div>
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-900 z-10">
            <tr className="text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-medium">
                <button
                  onClick={() => handleSort("period")}
                  className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
                >
                  Duration
                  {getSortIcon("period")}
                </button>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <button
                  onClick={() => handleSort("sma")}
                  className="flex items-center gap-1.5 ml-auto hover:text-zinc-300 transition-colors"
                >
                  SMA %
                  {getSortIcon("sma")}
                </button>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <button
                  onClick={() => handleSort("ema")}
                  className="flex items-center gap-1.5 ml-auto hover:text-zinc-300 transition-colors"
                >
                  EMA %
                  {getSortIcon("ema")}
                </button>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <button
                  onClick={() => handleSort("hodl")}
                  className="flex items-center gap-1.5 ml-auto hover:text-zinc-300 transition-colors"
                >
                  HODL %
                  {getSortIcon("hodl")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {sortedRows.map((row) => (
              <tr
                key={row.period}
                onClick={() => onSelectPeriod(row.period)}
                className={`cursor-pointer transition-colors ${
                  selectedPeriod === row.period
                    ? "bg-amber-500/10"
                    : "hover:bg-zinc-800/30"
                }`}
              >
                <td className="px-4 py-2.5 text-zinc-300 font-mono">
                  {row.period}
                  {row.isBestSma && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded">
                      Best SMA
                    </span>
                  )}
                  {row.isBestEma && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                      Best EMA
                    </span>
                  )}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono ${getReturnColor(row.smaReturn)}`}>
                  {formatPercent(row.smaReturn)}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono ${getReturnColor(row.emaReturn)}`}>
                  {formatPercent(row.emaReturn)}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono ${getReturnColor(row.hodlReturn)}`}>
                  {formatPercent(row.hodlReturn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
