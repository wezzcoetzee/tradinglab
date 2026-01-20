"use client";

import { useState } from "react";
import {
  BacktestForm,
  type BacktestFormData,
  ResultsTable,
  PortfolioChart,
  SmaReturnChart,
  ReturnsHeatmap,
  CsvExport,
  SummaryStats,
  DailyDataTable,
} from "@/components/backtest";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUrlParams } from "@/hooks/use-url-params";
import type { DetailedBacktestResult } from "@/lib/backtest";

export function Dashboard() {
  const { formData: urlFormData, updateUrl } = useUrlParams();
  const [result, setResult] = useState<DetailedBacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [timeSeries, setTimeSeries] = useState<DetailedBacktestResult["selectedPeriodTimeSeries"]>(undefined);

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
          gasFeePerTrade: formData.gasFeePerTrade,
          smaMin: formData.smaMin,
          smaMax: formData.smaMax,
          buyOnLong: formData.buyOnLong,
          shortOnShort: formData.shortOnShort,
          longLeverage: formData.longLeverage,
          shortLeverage: formData.sameLeverage
            ? formData.longLeverage
            : formData.shortLeverage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to run backtest");
      }

      const data = (await response.json()) as DetailedBacktestResult;
      setResult(data);
      setSelectedPeriod(data.bestSma.period);

      await fetchTimeSeries(data.bestSma.period, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSeries = async (period: number, formData?: BacktestFormData) => {
    if (!result && !formData) return;

    const params = formData || {
      initialCapital: result!.params.initialCapital,
      exchangeFeePercent: result!.params.exchangeFeePercent,
      gasFeePerTrade: result!.params.gasFeePerTrade,
      smaMin: result!.params.smaMin,
      smaMax: result!.params.smaMax,
      buyOnLong: result!.params.buyOnLong,
      shortOnShort: result!.params.shortOnShort,
      longLeverage: result!.params.longLeverage,
      shortLeverage: result!.params.shortLeverage,
      sameLeverage: result!.params.longLeverage === result!.params.shortLeverage,
    };

    try {
      const response = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          smaMin: period,
          smaMax: period,
          selectedPeriod: period,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as DetailedBacktestResult;
        setTimeSeries(
          data.selectedPeriodTimeSeries?.map((item) => ({
            ...item,
            date: new Date(item.date),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch time series:", err);
    }
  };

  const handleSelectPeriod = (period: number) => {
    setSelectedPeriod(period);
    fetchTimeSeries(period);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
              SMA Strategy Backtester
            </h1>
            <span className="text-xs text-zinc-600 font-mono">BTC/USD</span>
          </div>
          <div className="flex items-center gap-3">
            {result && (
              <CsvExport
                results={result.smaResults}
                params={result.params}
                hodlReturn={result.hodl.annualizedReturn}
              />
            )}
            <Button
              type="submit"
              form="backtest-form"
              disabled={isLoading}
              className="h-8 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm tracking-wide transition-colors disabled:opacity-50"
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
            <ThemeToggle />
          </div>
        </div>

        <BacktestForm
          onSubmit={handleSubmit}
          defaultValues={urlFormData}
        />
      </header>

      {/* Main Content */}
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
              <span className="font-mono text-sm">Running backtest across all SMA periods...</span>
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

            <div className="grid lg:grid-cols-2 gap-6">
              <SmaReturnChart
                results={result.smaResults}
                hodlAnnualizedReturn={result.hodl.annualizedReturn}
                onSelectPeriod={handleSelectPeriod}
              />

              {selectedPeriod && timeSeries && timeSeries.length > 0 && (
                <PortfolioChart data={timeSeries} smaPeriod={selectedPeriod} />
              )}
            </div>

            <ReturnsHeatmap
              results={result.smaResults}
              onSelectPeriod={handleSelectPeriod}
              selectedPeriod={selectedPeriod ?? undefined}
            />

            <ResultsTable
              results={result.smaResults}
              hodlAnnualizedReturn={result.hodl.annualizedReturn}
              onSelectPeriod={handleSelectPeriod}
              selectedPeriod={selectedPeriod ?? undefined}
            />

            {selectedPeriod && timeSeries && timeSeries.length > 0 && (
              <DailyDataTable data={timeSeries} smaPeriod={selectedPeriod} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
