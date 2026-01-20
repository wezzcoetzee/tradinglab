"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { SmaResult, BacktestParams } from "@/lib/backtest";

interface CsvExportProps {
  results: SmaResult[];
  params: BacktestParams;
  hodlReturn: number;
}

export function CsvExport({ results, params, hodlReturn }: CsvExportProps) {
  const handleExport = () => {
    const headers = [
      "SMA Period",
      "Total Return %",
      "Annualized Return %",
      "Max Drawdown %",
      "Final Value",
      "Trades",
      "Liquidated",
      "vs HODL %",
    ];

    const rows = results.map((r) => [
      r.period,
      (r.totalReturn * 100).toFixed(2),
      r.liquidated ? "N/A" : (r.annualizedReturn * 100).toFixed(2),
      (r.maxDrawdown * 100).toFixed(2),
      r.finalValue.toFixed(2),
      r.trades,
      r.liquidated ? "Yes" : "No",
      r.liquidated ? "N/A" : ((r.annualizedReturn - hodlReturn) * 100).toFixed(2),
    ]);

    const paramLines = [
      `# Backtest Parameters`,
      `# Initial Capital: $${params.initialCapital}`,
      `# Exchange Fee: ${params.exchangeFeePercent}%`,
      `# Gas Fee: $${params.gasFeePerTrade}`,
      `# SMA Range: ${params.smaMin}-${params.smaMax}`,
      `# Buy on Long: ${params.buyOnLong}`,
      `# Short on Short: ${params.shortOnShort}`,
      `# Long Leverage: ${params.longLeverage}x`,
      `# Short Leverage: ${params.shortLeverage}x`,
      `# HODL Annualized Return: ${(hodlReturn * 100).toFixed(2)}%`,
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
