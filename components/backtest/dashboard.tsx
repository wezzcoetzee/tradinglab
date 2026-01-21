"use client";

import { useState } from "react";
import {
  BacktestForm,
  type BacktestFormData,
  MaSummaryTable,
  DataTableVirtualized,
  SummaryStats,
  CsvExport,
  MaPerformanceChart,
  PortfolioChart,
} from "@/components/backtest";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUrlParams } from "@/hooks/use-url-params";
import type { DetailedBacktestResult, DailyData, SelectedConfig } from "@/lib/backtest";

export function Dashboard() {
  const { formData: urlFormData, updateUrl } = useUrlParams();
  const [result, setResult] = useState<DetailedBacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<SelectedConfig | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[] | undefined>(undefined);

  const handleSubmit = async (formData: BacktestFormData) => {
    setIsLoading(true);
    setError(null);
    updateUrl(formData);

    try {
      const response = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialCapital: formData.initialCapital,
          exchangeFeePercent: formData.exchangeFeePercent,
          smaMin: formData.smaMin,
          smaMax: formData.smaMax,
          buyOnLong: formData.buyOnLong,
          shortOnShort: formData.shortOnShort,
          optimizeLeverage: formData.optimizeLeverage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to run backtest");
      }

      const data = (await response.json()) as DetailedBacktestResult;
      setResult(data);
      const bestConfig = { period: data.bestSma.period, leverage: data.bestSma.leverage };
      setSelectedConfig(bestConfig);

      await fetchDailyData(bestConfig, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyData = async (config: SelectedConfig, formData?: BacktestFormData) => {
    if (!result && !formData) return;

    const params = formData || result!.params;

    try {
      const response = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          selectedConfig: config,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as DetailedBacktestResult;
        setDailyData(
          data.dailyData?.map((item) => ({
            ...item,
            date: new Date(item.date),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch daily data:", err);
    }
  };

  const handleSelectConfig = (config: SelectedConfig) => {
    setSelectedConfig(config);
    fetchDailyData(config);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
              SMA Strategy Backtester
            </h1>
            <span className="text-xs text-zinc-600 font-mono">BTC/USD</span>
          </div>
          <ThemeToggle />
        </div>

        <BacktestForm
          onSubmit={handleSubmit}
          defaultValues={urlFormData}
          actions={
            <>
              {result && (
                <CsvExport
                  smaResults={result.smaResults}
                  params={result.params}
                  hodlReturn={result.hodl.totalReturn}
                />
              )}
              <Button
                type="submit"
                form="backtest-form"
                disabled={isLoading}
                className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm tracking-wide transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                    Running...
                  </span>
                ) : (
                  "Run Backtest"
                )}
              </Button>
            </>
          }
        />
      </header>

      <main className="px-6 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-900/50 rounded-lg text-rose-400 font-mono text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-zinc-500">
              <span className="w-4 h-4 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
              <span className="font-mono text-sm">Running backtest across all MA periods...</span>
            </div>
          </div>
        )}

        {result && !isLoading && (
          <>
            <SummaryStats
              bestSma={result.bestSma}
              hodl={result.hodl}
              initialCapital={result.params.initialCapital}
              dateRange={result.dateRange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MaPerformanceChart
                smaResults={result.smaResults}
                hodlReturn={result.hodl.totalReturn}
              />
              {selectedConfig && dailyData && dailyData.length > 0 ? (
                <PortfolioChart dailyData={dailyData} smaPeriod={selectedConfig.period} />
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 text-zinc-500 text-sm">
                  Select a configuration to view portfolio chart
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MaSummaryTable
                smaResults={result.smaResults}
                hodlReturn={result.hodl.totalReturn}
                onSelectConfig={handleSelectConfig}
                selectedConfig={selectedConfig ?? undefined}
                optimizeLeverage={result.params.optimizeLeverage}
              />
              {selectedConfig && dailyData && dailyData.length > 0 ? (
                <DataTableVirtualized data={dailyData} smaPeriod={selectedConfig.period} />
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 text-zinc-500 text-sm min-h-[400px]">
                  Select a configuration to view daily data
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
