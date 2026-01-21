"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { MaResult, LeverageConfig, SelectedConfig } from "@/lib/backtest";
import { formatPercent } from "@/lib/formatting";

interface MaSummaryTableProps {
  smaResults: MaResult[];
  hodlReturn: number;
  onSelectConfig: (config: SelectedConfig) => void;
  selectedConfig?: SelectedConfig;
  optimizeLeverage: boolean;
}

type SortField = "period" | "longLev" | "shortLev" | "sma" | "hodl";
type SortDirection = "asc" | "desc";

interface TableRow {
  period: number;
  leverage: LeverageConfig;
  smaReturn: number;
  hodlReturn: number;
  smaLiquidated: boolean;
  isBestSma: boolean;
  key: string;
}

function getReturnColor(value: number, liquidated: boolean): string {
  if (liquidated) return "text-rose-600";
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-rose-400";
  return "text-zinc-400";
}

function makeKey(period: number, lev: LeverageConfig): string {
  return `${period}-${lev.long}-${lev.short}`;
}

export function MaSummaryTable({
  smaResults,
  hodlReturn,
  onSelectConfig,
  selectedConfig,
  optimizeLeverage,
}: MaSummaryTableProps) {
  const [sortField, setSortField] = useState<SortField>("sma");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const bestSma = useMemo(() => {
    return smaResults.reduce((best, current) =>
      current.totalReturn > best.totalReturn ? current : best
    , smaResults[0]);
  }, [smaResults]);

  const rows: TableRow[] = useMemo(() => {
    return smaResults.map((sma) => {
      const key = makeKey(sma.period, sma.leverage);
      return {
        period: sma.period,
        leverage: sma.leverage,
        smaReturn: sma.totalReturn,
        hodlReturn,
        smaLiquidated: sma.liquidated,
        isBestSma: sma.period === bestSma.period &&
          sma.leverage.long === bestSma.leverage.long &&
          sma.leverage.short === bestSma.leverage.short,
        key,
      };
    });
  }, [smaResults, hodlReturn, bestSma]);

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
        case "longLev":
          aVal = a.leverage.long;
          bVal = b.leverage.long;
          break;
        case "shortLev":
          aVal = a.leverage.short;
          bVal = b.leverage.short;
          break;
        case "sma":
          aVal = a.smaReturn;
          bVal = b.smaReturn;
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

  const selectedKey = selectedConfig
    ? makeKey(selectedConfig.period, selectedConfig.leverage)
    : null;

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/50">
      <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">SMA Performance Summary</h3>
        <span className="text-xs text-zinc-500">{rows.length} configurations</span>
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
                  Period
                  {getSortIcon("period")}
                </button>
              </th>
              {optimizeLeverage && (
                <>
                  <th className="px-3 py-3 text-right font-medium">
                    <button
                      onClick={() => handleSort("longLev")}
                      className="flex items-center gap-1.5 ml-auto hover:text-zinc-300 transition-colors"
                    >
                      Long
                      {getSortIcon("longLev")}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    <button
                      onClick={() => handleSort("shortLev")}
                      className="flex items-center gap-1.5 ml-auto hover:text-zinc-300 transition-colors"
                    >
                      Short
                      {getSortIcon("shortLev")}
                    </button>
                  </th>
                </>
              )}
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
                key={row.key}
                onClick={() => onSelectConfig({ period: row.period, leverage: row.leverage })}
                className={`cursor-pointer transition-colors ${
                  selectedKey === row.key
                    ? "bg-amber-500/10"
                    : "hover:bg-zinc-800/30"
                }`}
              >
                <td className="px-4 py-2.5 text-zinc-300 font-mono">
                  {row.period}
                  {row.isBestSma && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">
                      Best
                    </span>
                  )}
                </td>
                {optimizeLeverage && (
                  <>
                    <td className="px-3 py-2.5 text-right font-mono text-emerald-400">
                      {row.leverage.long}x
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-rose-400">
                      {row.leverage.short}x
                    </td>
                  </>
                )}
                <td className={`px-4 py-2.5 text-right font-mono ${getReturnColor(row.smaReturn, row.smaLiquidated)}`}>
                  {row.smaLiquidated ? "LIQ" : formatPercent(row.smaReturn, 1)}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono ${getReturnColor(row.hodlReturn, false)}`}>
                  {formatPercent(row.hodlReturn, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
