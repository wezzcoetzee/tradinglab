'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
import type { BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface AllConfigurationsTableProps {
  results: BacktestResultSummary[];
  baseline: BuyAndHoldBaseline | null;
}

function VsHoldCell({ result, baseline }: { result: BacktestResultSummary; baseline: BuyAndHoldBaseline }) {
  const vsHold = calculateVsHold(result.finalCollateral, baseline.finalValue);
  return <span className={getVsHoldColorClass(vsHold)}>{formatPercent(vsHold)}</span>;
}

export function AllConfigurationsTable({ results, baseline }: AllConfigurationsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.isLiquidated !== b.isLiquidated) {
        return a.isLiquidated ? 1 : -1;
      }
      return b.totalReturn - a.totalReturn;
    });
  }, [results]);

  const pagination = usePagination(sortedResults);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
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

      {isExpanded && (
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
  );
}
