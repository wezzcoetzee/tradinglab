'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BaselineCard } from '@/components/baseline-card';
import { MetricsCards, type Metrics } from '@/components/metrics-cards';
import { OptimalStrategyCard } from '@/components/optimal-strategy-card';
import { DayByDayTable } from '@/components/day-by-day-table';
import { TablePagination } from '@/components/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import {
  formatCurrency,
  formatPercent,
  getReturnColorClass,
  getVsHoldColorClass,
  formatAtrConfig,
  calculateVsHold,
} from '@/lib/format';
import type { BacktestResult, BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface ResultsTableProps {
  results: BacktestResultSummary[];
  baseline: BuyAndHoldBaseline | null;
  bestResultWithDays?: BacktestResult | null;
}

interface VsHoldCellProps {
  result: BacktestResultSummary;
  baseline: BuyAndHoldBaseline;
}

function VsHoldCell({ result, baseline }: VsHoldCellProps) {
  const vsHold = calculateVsHold(result.finalBalance, baseline.finalValue);
  return <span className={getVsHoldColorClass(vsHold)}>{formatPercent(vsHold)}</span>;
}

export function ResultsTable({ results, baseline, bestResultWithDays }: ResultsTableProps) {
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.isLiquidated !== b.isLiquidated) {
        return a.isLiquidated ? 1 : -1;
      }
      return b.totalReturn - a.totalReturn;
    });
  }, [results]);

  const pagination = usePagination(sortedResults);

  const metrics: Metrics = useMemo(() => {
    const total = results.length;
    const liquidated = results.filter(r => r.isLiquidated).length;
    const profitable = results.filter(r => r.totalReturn > 0 && !r.isLiquidated).length;
    const liquidationRate = total > 0 ? (liquidated / total) * 100 : 0;
    return { total, profitable, liquidated, liquidationRate };
  }, [results]);

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backtest Results</CardTitle>
        <CardDescription>
          {metrics.total} configurations tested
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {baseline && <BaselineCard baseline={baseline} />}

        <MetricsCards metrics={metrics} />

        {baseline && sortedResults.length > 0 && !sortedResults[0].isLiquidated && (
          <OptimalStrategyCard result={sortedResults[0]} baseline={baseline} />
        )}

        {baseline && bestResultWithDays && !bestResultWithDays.isLiquidated && (
          <DayByDayTable
            result={bestResultWithDays}
            purchasePrice={baseline.purchasePrice}
            startingCapital={baseline.startingCapital}
          />
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SMA</TableHead>
              <TableHead>Long Lev</TableHead>
              <TableHead>Short Lev</TableHead>
              <TableHead>ATR Config</TableHead>
              <TableHead className="text-right">Final Balance</TableHead>
              <TableHead className="text-right">Return</TableHead>
              <TableHead className="text-right">vs Hold</TableHead>
              <TableHead className="text-right">Trades</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Liquidation Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.map((result, index) => (
              <TableRow
                key={index}
                className={result.isLiquidated ? 'bg-destructive/10' : undefined}
              >
                <TableCell>{result.config.smaPeriod}</TableCell>
                <TableCell>{result.config.longLeverage}x</TableCell>
                <TableCell>{result.config.shortLeverage}x</TableCell>
                <TableCell>{formatAtrConfig(result.config.atr)}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(result.finalBalance)}
                </TableCell>
                <TableCell className={`text-right font-mono ${getReturnColorClass(result.totalReturn)}`}>
                  {formatPercent(result.totalReturn)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {baseline ? (
                    <VsHoldCell result={result} baseline={baseline} />
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right">{result.totalTrades}</TableCell>
                <TableCell>
                  {result.isLiquidated ? (
                    <Badge variant="destructive">LIQUIDATED</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {result.liquidationDate ?? '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          totalItems={pagination.totalItems}
          onPageChange={pagination.goToPage}
          canGoNext={pagination.canGoNext}
          canGoPrev={pagination.canGoPrev}
        />
      </CardContent>
    </Card>
  );
}
