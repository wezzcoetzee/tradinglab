'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { BaselineCard } from '@/components/baseline-card';
import { MetricsCards, type Metrics } from '@/components/metrics-cards';
import { OptimalStrategyCard } from '@/components/optimal-strategy-card';
import { DayByDayTable } from '@/components/day-by-day-table';
import { PerformanceChart } from '@/components/performance-chart';
import { TablePagination } from '@/components/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import {
  formatCurrency,
  formatPercent,
  getReturnColorClass,
  getVsHoldColorClass,
  getVsHoldBackgroundClass,
  formatAtrConfig,
  calculateVsHold,
} from '@/lib/format';
import type { BacktestResult, BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface ResultsTableProps {
  results: BacktestResultSummary[];
  baseline: BuyAndHoldBaseline | null;
  bestResultWithDays?: BacktestResult | null;
  isTruncated?: boolean;
  totalConfigsTested?: number;
}

interface VsHoldCellProps {
  result: BacktestResultSummary;
  baseline: BuyAndHoldBaseline;
}

function VsHoldCell({ result, baseline }: VsHoldCellProps) {
  const vsHold = calculateVsHold(result.finalCollateral, baseline.finalValue);
  return <span className={getVsHoldColorClass(vsHold)}>{formatPercent(vsHold)}</span>;
}

type SmaSortField = 'smaPeriod' | 'finalCollateral' | 'percentGain' | 'vsHold' | 'status';

interface SmaSortConfig {
  field: SmaSortField;
  direction: 'asc' | 'desc';
}

interface SmaBestResult {
  smaPeriod: number;
  result: BacktestResultSummary;
  vsHold: number;
}

interface SortableHeaderProps {
  field: SmaSortField;
  label: string;
  sortConfig: SmaSortConfig;
  onSort: (field: SmaSortField) => void;
  className?: string;
}

function shouldReplace(existing: BacktestResultSummary, current: BacktestResultSummary): boolean {
  if (existing.isLiquidated && !current.isLiquidated) {
    return true;
  }
  if (existing.isLiquidated === current.isLiquidated) {
    return current.finalCollateral > existing.finalCollateral;
  }
  return false;
}

function SortableHeader({ field, label, sortConfig, onSort, className }: SortableHeaderProps) {
  const isSorted = sortConfig.field === field;
  const Icon = isSorted
    ? sortConfig.direction === 'asc' ? ChevronUp : ChevronDown
    : ChevronsUpDown;

  const sortDirection = isSorted ? (sortConfig.direction === 'asc' ? 'descending' : 'ascending') : 'descending';
  const isRightAligned = className?.includes('text-right');

  return (
    <TableHead
      className={`cursor-pointer select-none hover:bg-muted/50 ${className ?? ''}`}
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label} ${sortDirection}`}
    >
      <div className={`flex items-center gap-1 ${isRightAligned ? 'justify-end' : ''}`}>
        {label}
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
    </TableHead>
  );
}

function getSmaRowClassName(result: BacktestResultSummary, vsHold: number): string {
  if (result.isLiquidated) {
    return 'bg-destructive/10 border-l-4 border-destructive';
  }
  return getVsHoldBackgroundClass(vsHold);
}

function SmaStatusCell({ result }: { result: BacktestResultSummary }) {
  if (result.isLiquidated) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="destructive">LIQUIDATED</Badge>
        <span className="text-xs text-muted-foreground">{result.liquidationDate}</span>
      </div>
    );
  }
  return <span className="text-muted-foreground">-</span>;
}

export function ResultsTable({ results, baseline, bestResultWithDays, isTruncated, totalConfigsTested }: ResultsTableProps) {
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isSmaExpanded, setIsSmaExpanded] = useState(false);
  const [smaSortConfig, setSmaSortConfig] = useState<SmaSortConfig>({ field: 'finalCollateral', direction: 'desc' });

  const bestBySma = useMemo(() => {
    const map = new Map<number, BacktestResultSummary>();

    for (const result of results) {
      const { smaPeriod } = result.config;
      const existing = map.get(smaPeriod);

      if (!existing || shouldReplace(existing, result)) {
        map.set(smaPeriod, result);
      }
    }

    return Array.from(map.entries()).map(([smaPeriod, result]) => ({
      smaPeriod,
      result,
      vsHold: baseline ? calculateVsHold(result.finalCollateral, baseline.finalValue) : 0,
    }));
  }, [results, baseline]);

  const sortedSmaResults = useMemo(() => {
    const sorted = [...bestBySma];
    const { field, direction } = smaSortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      if (field === 'status') {
        const aLiq = a.result.isLiquidated ? 1 : 0;
        const bLiq = b.result.isLiquidated ? 1 : 0;
        return (aLiq - bLiq) * multiplier;
      }

      if (a.result.isLiquidated !== b.result.isLiquidated) {
        return a.result.isLiquidated ? 1 : -1;
      }

      const fieldMap: Record<SmaSortField, number> = {
        smaPeriod: a.smaPeriod - b.smaPeriod,
        finalCollateral: a.result.finalCollateral - b.result.finalCollateral,
        percentGain: a.result.totalReturn - b.result.totalReturn,
        vsHold: a.vsHold - b.vsHold,
        status: 0,
      };

      return fieldMap[field] * multiplier;
    });

    return sorted;
  }, [bestBySma, smaSortConfig]);

  const smaPagination = usePagination(sortedSmaResults);

  const handleSmaSort = (field: SmaSortField) => {
    setSmaSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

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
    const total = totalConfigsTested || results.length;
    const liquidated = results.filter(r => r.isLiquidated).length;
    const profitable = results.filter(r => r.totalReturn > 0 && !r.isLiquidated).length;
    const liquidationRate = total > 0 ? (liquidated / total) * 100 : 0;
    return { total, profitable, liquidated, liquidationRate };
  }, [results, totalConfigsTested]);

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backtest Results</CardTitle>
        <CardDescription>
          {metrics.total} configurations tested
          {isTruncated && (
            <span className="text-amber-600 dark:text-amber-400">
              {' '}(showing top 1000 results)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {baseline && <BaselineCard baseline={baseline} />}

        <MetricsCards metrics={metrics} />

        {baseline && sortedResults.length > 0 && !sortedResults[0].isLiquidated && (
          <OptimalStrategyCard result={sortedResults[0]} baseline={baseline} />
        )}

        {baseline && bestResultWithDays && !bestResultWithDays.isLiquidated && (
          <PerformanceChart result={bestResultWithDays} baseline={baseline} />
        )}

        {baseline && bestResultWithDays && !bestResultWithDays.isLiquidated && (
          <DayByDayTable
            result={bestResultWithDays}
            purchasePrice={baseline.purchasePrice}
            startingCapital={baseline.startingCapital}
          />
        )}

        {bestBySma.length > 0 && (
          <Card>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setIsSmaExpanded(!isSmaExpanded)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsSmaExpanded(!isSmaExpanded);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-2">
                {isSmaExpanded ? (
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                )}
                <CardTitle>SMA Period Comparison</CardTitle>
                <span className="text-muted-foreground text-sm">
                  ({bestBySma.length} periods)
                </span>
              </div>
            </CardHeader>

            {isSmaExpanded && (
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="smaPeriod" label="SMA Period" sortConfig={smaSortConfig} onSort={handleSmaSort} />
                      <SortableHeader field="finalCollateral" label="Collateral" sortConfig={smaSortConfig} onSort={handleSmaSort} className="text-right" />
                      <SortableHeader field="percentGain" label="% Gain" sortConfig={smaSortConfig} onSort={handleSmaSort} className="text-right" />
                      <SortableHeader field="vsHold" label="% vs Hold" sortConfig={smaSortConfig} onSort={handleSmaSort} className="text-right" />
                      <SortableHeader field="status" label="Status" sortConfig={smaSortConfig} onSort={handleSmaSort} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smaPagination.paginatedData.map(({ smaPeriod, result, vsHold }: SmaBestResult) => (
                      <TableRow key={smaPeriod} className={getSmaRowClassName(result, vsHold)}>
                        <TableCell>{smaPeriod} days</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(result.finalCollateral)}
                        </TableCell>
                        <TableCell className={`text-right font-mono ${getReturnColorClass(result.totalReturn)}`}>
                          {formatPercent(result.totalReturn)}
                        </TableCell>
                        <TableCell className={`text-right font-mono ${baseline ? getVsHoldColorClass(vsHold) : ''}`}>
                          {baseline ? formatPercent(vsHold) : '-'}
                        </TableCell>
                        <TableCell>
                          <SmaStatusCell result={result} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <TablePagination
                  currentPage={smaPagination.currentPage}
                  totalPages={smaPagination.totalPages}
                  startIndex={smaPagination.startIndex}
                  endIndex={smaPagination.endIndex}
                  totalItems={smaPagination.totalItems}
                  onPageChange={smaPagination.goToPage}
                  canGoNext={smaPagination.canGoNext}
                  canGoPrev={smaPagination.canGoPrev}
                />
              </CardContent>
            )}
          </Card>
        )}

        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsTableExpanded(!isTableExpanded);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-2">
              {isTableExpanded ? (
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              )}
              <CardTitle>All Configurations</CardTitle>
              <span className="text-muted-foreground text-sm">
                ({sortedResults.length} configurations)
              </span>
            </div>
          </CardHeader>

          {isTableExpanded && (
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SMA</TableHead>
                    <TableHead>Long Lev</TableHead>
                    <TableHead>Short Lev</TableHead>
                    <TableHead>ATR Config</TableHead>
                    <TableHead className="text-right">Collateral</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                    <TableHead className="text-right">vs Hold</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">ATR Triggers</TableHead>
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
                        {formatCurrency(result.finalCollateral)}
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
                      <TableCell className="text-right">{result.atrTriggerCount}</TableCell>
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
          )}
        </Card>
      </CardContent>
    </Card>
  );
}
