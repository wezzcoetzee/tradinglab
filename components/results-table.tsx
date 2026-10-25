'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BaselineCard } from '@/components/baseline-card';
import { MetricsCards, type Metrics } from '@/components/metrics-cards';
import { OptimalStrategyCard } from '@/components/optimal-strategy-card';
import { DayByDayTable } from '@/components/day-by-day-table';
import { PerformanceChart } from '@/components/performance-chart';
import { SmaComparisonTable } from '@/components/sma-comparison-table';
import { AllConfigurationsTable } from '@/components/all-configurations-table';
import { TOP_K_RESULTS } from '@/lib/backtest/constants';
import { compareResults, summarizeResults, type OptimizationStats } from '@/lib/backtest/ranking';
import type { BacktestResult, BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface ResultsTableProps {
  results: BacktestResultSummary[];
  baseline: BuyAndHoldBaseline | null;
  bestResultWithDays?: BacktestResult | null;
  isTruncated?: boolean;
  /** Totals across every config tested; falls back to counting `results` when omitted. */
  stats?: OptimizationStats;
  assetName?: string | null;
}

export function ResultsTable({ results, baseline, bestResultWithDays, isTruncated, stats, assetName }: ResultsTableProps) {
  const metrics: Metrics = useMemo(() => {
    const { total, profitable, liquidated } = stats ?? summarizeResults(results);
    const liquidationRate = total > 0 ? (liquidated / total) * 100 : 0;
    return { total, profitable, liquidated, liquidationRate };
  }, [results, stats]);

  const bestResult = useMemo(() => {
    return [...results].sort(compareResults)[0] ?? null;
  }, [results]);

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{assetName ? `${assetName} Backtest Results` : 'Backtest Results'}</CardTitle>
        <CardDescription>
          {metrics.total} configurations tested
          {isTruncated && (
            <span className="text-amber-600 dark:text-amber-400">
              {' '}(showing top {TOP_K_RESULTS} results)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {baseline && <BaselineCard baseline={baseline} assetName={assetName} />}

        <MetricsCards metrics={metrics} />

        {baseline && bestResult && !bestResult.isLiquidated && (
          <OptimalStrategyCard result={bestResult} baseline={baseline} />
        )}

        {baseline && bestResultWithDays && !bestResultWithDays.isLiquidated && (
          <PerformanceChart result={bestResultWithDays} baseline={baseline} assetName={assetName} />
        )}

        {baseline && bestResultWithDays && !bestResultWithDays.isLiquidated && (
          <DayByDayTable
            result={bestResultWithDays}
            purchasePrice={baseline.purchasePrice}
            startingCapital={baseline.startingCapital}
          />
        )}

        <SmaComparisonTable results={results} baseline={baseline} />

        <AllConfigurationsTable results={results} baseline={baseline} />
      </CardContent>
    </Card>
  );
}
