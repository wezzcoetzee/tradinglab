"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { MaResult, BacktestParams, LeverageConfig } from "@/lib/backtest";

interface CsvExportProps {
  smaResults: MaResult[];
  emaResults: MaResult[];
  params: BacktestParams;
  hodlReturn: number;
}

function makeKey(period: number, lev: LeverageConfig): string {
  return `${period}-${lev.long}-${lev.short}`;
}

export function CsvExport({ smaResults, emaResults, params, hodlReturn }: CsvExportProps) {
  const handleExport = () => {
    const headers = [
      "Period",
      "Long Leverage",
      "Short Leverage",
      "SMA Return %",
      "EMA Return %",
      "HODL Return %",
      "SMA Final Value",
      "EMA Final Value",
      "SMA Trades",
      "EMA Trades",
      "SMA Liquidated",
      "EMA Liquidated",
    ];

    const emaMap = new Map(emaResults.map(r => [makeKey(r.period, r.leverage), r]));

    const rows = smaResults.map((sma) => {
      const key = makeKey(sma.period, sma.leverage);
      const ema = emaMap.get(key);
      return [
        sma.period,
        sma.leverage.long,
        sma.leverage.short,
        (sma.totalReturn * 100).toFixed(2),
        ema ? (ema.totalReturn * 100).toFixed(2) : "N/A",
        (hodlReturn * 100).toFixed(2),
        sma.finalValue.toFixed(2),
        ema ? ema.finalValue.toFixed(2) : "N/A",
        sma.trades,
        ema ? ema.trades : "N/A",
        sma.liquidated ? "Yes" : "No",
        ema ? (ema.liquidated ? "Yes" : "No") : "N/A",
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
    link.download = `ma-backtest-${new Date().toISOString().split("T")[0]}.csv`;
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
