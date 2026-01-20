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
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMA Strategy Backtester</h1>
          <p className="text-muted-foreground mt-1">
            Compare Simple Moving Average trading strategies against HODL
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <CsvExport
              results={result.smaResults}
              params={result.params}
              hodlReturn={result.hodl.annualizedReturn}
            />
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-8">
        <div>
          <BacktestForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            defaultValues={urlFormData}
          />
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              Running backtest across all SMA periods...
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
        </div>
      </div>
    </div>
  );
}
