'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BaselineCard } from '@/components/baseline-card';
import { MetricsCards, type Metrics } from '@/components/metrics-cards';
import type { BacktestResult, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface ResultsTableProps {
  results: BacktestResult[];
  baseline: BuyAndHoldBaseline | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatAtrConfig(result: BacktestResult): string {
  const { atr } = result.config;
  if (!atr) return '-';
  return `${atr.period}/${atr.multiplier}/${atr.closePercent}%`;
}

function calculateVsHold(finalBalance: number, baselineFinalValue: number): number {
  return ((finalBalance - baselineFinalValue) / baselineFinalValue) * 100;
}

function getReturnColorClass(returnPercent: number): string {
  return returnPercent >= 0 ? 'text-green-600' : 'text-destructive';
}

function getVsHoldClass(vsHold: number): string {
  if (vsHold > 5) return 'text-green-600';
  if (vsHold < -5) return 'text-destructive';
  return 'text-yellow-600';
}

export function ResultsTable({ results, baseline }: ResultsTableProps) {
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.isLiquidated !== b.isLiquidated) {
        return a.isLiquidated ? 1 : -1;
      }
      return b.totalReturn - a.totalReturn;
    });
  }, [results]);

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
            {sortedResults.map((result, index) => (
              <TableRow
                key={index}
                className={result.isLiquidated ? 'bg-destructive/10' : undefined}
              >
                <TableCell>{result.config.smaPeriod}</TableCell>
                <TableCell>{result.config.longLeverage}x</TableCell>
                <TableCell>{result.config.shortLeverage}x</TableCell>
                <TableCell>{formatAtrConfig(result)}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(result.finalBalance)}
                </TableCell>
                <TableCell className={`text-right font-mono ${getReturnColorClass(result.totalReturn)}`}>
                  {formatPercent(result.totalReturn)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {baseline ? (
                    (() => {
                      const vsHold = calculateVsHold(result.finalBalance, baseline.finalValue);
                      return <span className={getVsHoldClass(vsHold)}>{formatPercent(vsHold)}</span>;
                    })()
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
      </CardContent>
    </Card>
  );
}
