"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SmaResult } from "@/lib/backtest";
import { formatPercent } from "@/lib/formatting";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ResultsTableProps {
  results: SmaResult[];
  hodlAnnualizedReturn: number;
  onSelectPeriod?: (period: number) => void;
  selectedPeriod?: number;
}

type SortField =
  | "period"
  | "totalReturn"
  | "annualizedReturn"
  | "maxDrawdown"
  | "trades";
type SortDirection = "asc" | "desc";

export function ResultsTable({
  results,
  hodlAnnualizedReturn,
  onSelectPeriod,
  selectedPeriod,
}: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("annualizedReturn");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (a.liquidated) aVal = sortField === "maxDrawdown" ? 1 : -Infinity;
      if (b.liquidated) bVal = sortField === "maxDrawdown" ? 1 : -Infinity;

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [results, sortField, sortDirection]);

  const bestPeriod = useMemo(() => {
    const nonLiquidated = results.filter((r) => !r.liquidated);
    if (nonLiquidated.length === 0) return null;
    return nonLiquidated.reduce((best, curr) =>
      curr.annualizedReturn > best.annualizedReturn ? curr : best
    ).period;
  }, [results]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="w-4 h-4 inline-block" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 inline" />
    );
  };

  const headerClass =
    "text-left px-3 py-2 cursor-pointer hover:bg-muted/50 select-none whitespace-nowrap";

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMA Strategy Results</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card border-b">
              <tr>
                <th className={headerClass} onClick={() => handleSort("period")}>
                  SMA Period {renderSortIcon("period")}
                </th>
                <th
                  className={headerClass}
                  onClick={() => handleSort("totalReturn")}
                >
                  Total Return {renderSortIcon("totalReturn")}
                </th>
                <th
                  className={headerClass}
                  onClick={() => handleSort("annualizedReturn")}
                >
                  Annualized {renderSortIcon("annualizedReturn")}
                </th>
                <th
                  className={headerClass}
                  onClick={() => handleSort("maxDrawdown")}
                >
                  Max Drawdown {renderSortIcon("maxDrawdown")}
                </th>
                <th className={headerClass} onClick={() => handleSort("trades")}>
                  Trades {renderSortIcon("trades")}
                </th>
                <th className="text-left px-3 py-2 whitespace-nowrap">
                  vs HODL
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result) => {
                const vsHodl = result.annualizedReturn - hodlAnnualizedReturn;
                const isBest = result.period === bestPeriod;
                const isSelected = result.period === selectedPeriod;

                return (
                  <tr
                    key={result.period}
                    onClick={() => onSelectPeriod?.(result.period)}
                    className={`
                      border-b cursor-pointer transition-colors
                      ${isBest ? "bg-green-500/10" : ""}
                      ${isSelected ? "bg-primary/10 ring-1 ring-primary/50" : ""}
                      ${!isBest && !isSelected ? "hover:bg-muted/50" : ""}
                      ${result.liquidated ? "opacity-50" : ""}
                    `}
                  >
                    <td className="px-3 py-2 font-mono">
                      {result.period}D
                      {isBest && (
                        <span className="ml-2 text-xs text-green-500 font-medium">
                          BEST
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono ${
                        result.liquidated
                          ? "text-destructive"
                          : result.totalReturn >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {result.liquidated
                        ? "LIQUIDATED"
                        : formatPercent(result.totalReturn)}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono ${
                        result.liquidated
                          ? "text-destructive"
                          : result.annualizedReturn >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {result.liquidated
                        ? "-"
                        : formatPercent(result.annualizedReturn)}
                    </td>
                    <td className="px-3 py-2 font-mono text-orange-500">
                      {formatPercent(result.maxDrawdown)}
                    </td>
                    <td className="px-3 py-2 font-mono">{result.trades}</td>
                    <td
                      className={`px-3 py-2 font-mono ${
                        result.liquidated
                          ? "text-destructive"
                          : vsHodl >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {result.liquidated
                        ? "-"
                        : `${vsHodl >= 0 ? "+" : ""}${formatPercent(vsHodl)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
