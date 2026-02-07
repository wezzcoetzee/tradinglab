'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { TablePagination } from '@/components/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import {
  formatCurrency,
  formatPercent,
  getReturnColorClass,
  getVsHoldColorClass,
  getVsHoldBackgroundClass,
  calculateVsHold,
} from '@/lib/format';
import type { BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface SmaComparisonTableProps {
  results: BacktestResultSummary[];
  baseline: BuyAndHoldBaseline | null;
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

export function SmaComparisonTable({ results, baseline }: SmaComparisonTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState<SmaSortConfig>({ field: 'finalCollateral', direction: 'desc' });

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
    const { field, direction } = sortConfig;
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
  }, [bestBySma, sortConfig]);

  const pagination = usePagination(sortedSmaResults);

  const handleSort = (field: SmaSortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  if (bestBySma.length === 0) {
    return null;
  }

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
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
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

      {isExpanded && (
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="smaPeriod" label="SMA Period" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader field="finalCollateral" label="Collateral" sortConfig={sortConfig} onSort={handleSort} className="text-right" />
                <SortableHeader field="percentGain" label="% Gain" sortConfig={sortConfig} onSort={handleSort} className="text-right" />
                <SortableHeader field="vsHold" label="% vs Hold" sortConfig={sortConfig} onSort={handleSort} className="text-right" />
                <SortableHeader field="status" label="Status" sortConfig={sortConfig} onSort={handleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map(({ smaPeriod, result, vsHold }: SmaBestResult) => (
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
