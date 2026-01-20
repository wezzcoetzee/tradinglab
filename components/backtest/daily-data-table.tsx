"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetailedDailyState } from "@/lib/backtest";
import { formatCurrency, formatDate, formatPercent } from "@/lib/formatting";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DailyDataTableProps {
  data: DetailedDailyState[];
  smaPeriod: number;
}

type SortField = "date" | "closePrice" | "sma" | "signal" | "portfolioValue" | "hodlValue" | "drawdown";
type SortDirection = "asc" | "desc";

export function DailyDataTable({ data, smaPeriod }: DailyDataTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: number | string | null;
      let bVal: number | string | null;

      switch (sortField) {
        case "date":
          aVal = a.date.getTime();
          bVal = b.date.getTime();
          break;
        case "closePrice":
          aVal = a.closePrice;
          bVal = b.closePrice;
          break;
        case "sma":
          aVal = a.sma ?? -Infinity;
          bVal = b.sma ?? -Infinity;
          break;
        case "signal":
          aVal = a.signal;
          bVal = b.signal;
          break;
        case "portfolioValue":
          aVal = a.portfolioValue;
          bVal = b.portfolioValue;
          break;
        case "hodlValue":
          aVal = a.hodlValue;
          bVal = b.hodlValue;
          break;
        case "drawdown":
          aVal = a.drawdown;
          bVal = b.drawdown;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "date" ? "asc" : "desc");
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

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "LONG":
        return "text-green-500";
      case "SHORT":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getTradeActionBadge = (action: string | undefined) => {
    if (!action) return null;

    const isEntry = action.startsWith("ENTER");
    const bgColor = isEntry ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400";

    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${bgColor}`}>
        {action.replace("_", " ")}
      </span>
    );
  };

  const headerClass =
    "text-left px-3 py-2 cursor-pointer hover:bg-muted/50 select-none whitespace-nowrap text-xs";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Trading Data ({smaPeriod}D SMA)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card border-b z-10">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground">#</th>
                <th className={headerClass} onClick={() => handleSort("date")}>
                  Date {renderSortIcon("date")}
                </th>
                <th className={headerClass} onClick={() => handleSort("closePrice")}>
                  Price {renderSortIcon("closePrice")}
                </th>
                <th className={headerClass} onClick={() => handleSort("sma")}>
                  SMA {renderSortIcon("sma")}
                </th>
                <th className={headerClass} onClick={() => handleSort("signal")}>
                  Signal {renderSortIcon("signal")}
                </th>
                <th className={headerClass} onClick={() => handleSort("portfolioValue")}>
                  Portfolio {renderSortIcon("portfolioValue")}
                </th>
                <th className={headerClass} onClick={() => handleSort("hodlValue")}>
                  HODL {renderSortIcon("hodlValue")}
                </th>
                <th className={headerClass} onClick={() => handleSort("drawdown")}>
                  Drawdown {renderSortIcon("drawdown")}
                </th>
                <th className="text-left px-3 py-2 text-xs whitespace-nowrap">Trade</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => {
                const originalIndex = data.findIndex(
                  (d) => d.date.getTime() === row.date.getTime()
                );

                return (
                  <tr
                    key={row.date.toISOString()}
                    className={`border-b hover:bg-muted/50 ${
                      row.tradeAction ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                      {originalIndex + 1}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {formatCurrency(row.closePrice)}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {row.sma !== null ? formatCurrency(row.sma) : "-"}
                    </td>
                    <td className={`px-3 py-1.5 font-mono text-xs font-medium ${getSignalColor(row.signal)}`}>
                      {row.signal}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {formatCurrency(row.portfolioValue)}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {formatCurrency(row.hodlValue)}
                    </td>
                    <td className={`px-3 py-1.5 font-mono text-xs ${
                      row.drawdown > 0.1 ? "text-orange-500 font-medium" : "text-muted-foreground"
                    }`}>
                      {formatPercent(row.drawdown)}
                    </td>
                    <td className="px-3 py-1.5">
                      {getTradeActionBadge(row.tradeAction)}
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
