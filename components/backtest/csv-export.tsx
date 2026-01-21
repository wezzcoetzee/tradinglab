"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { MaResult, BacktestParams } from "@/lib/backtest";

interface CsvExportProps {
  smaResults: MaResult[];
  params: BacktestParams;
  hodlReturn: number;
}

export function CsvExport({ smaResults, params, hodlReturn }: CsvExportProps) {
  const handleExport = () => {
    const headers = [
      "Period",
      "Long Leverage",
      "Short Leverage",
      "SMA Return %",
      "HODL Return %",
      "SMA Final Value",
      "SMA Trades",
      "SMA Liquidated",
    ];

    const rows = smaResults.map((sma) => {
      return [
        sma.period,
        sma.leverage.long,
        sma.leverage.short,
        (sma.totalReturn * 100).toFixed(2),
        (hodlReturn * 100).toFixed(2),
        sma.finalValue.toFixed(2),
        sma.trades,
        sma.liquidated ? "Yes" : "No",
      ];
    });

    const paramLines = [
      `# Backtest Parameters`,
      `# Initial Capital: $${params.initialCapital}`,
      `# Exchange Fee: ${params.exchangeFeePercent}%`,
      `# Gas Fee: $${params.gasFeePerTrade}`,
      `# MA Range: ${params.smaMin}-${params.smaMax}`,
      `# Buy on Long: ${params.buyOnLong}`,
      `# Short on Short: ${params.shortOnShort}`,
      `# Leverage: ${params.leverage.long}x Long / ${params.leverage.short}x Short`,
      `# Optimize Leverage: ${params.optimizeLeverage}`,
      `# HODL Return: ${(hodlReturn * 100).toFixed(2)}%`,
      ``,
    ];

    const csvContent = [
      ...paramLines,
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sma-backtest-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport} variant="outline" className="gap-2">
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  );
}
