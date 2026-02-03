'use client';

import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WARMUP_DAYS } from '@/lib/backtest/constants';
import type { BacktestResult, DayResult, PositionType } from '@/lib/backtest/types';
import { formatCurrency } from '@/lib/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DayByDayTableProps {
  result: BacktestResult;
  purchasePrice: number;
  startingCapital: number;
}

const POSITION_BADGE_STYLES: Record<PositionType, string> = {
  LONG: 'bg-green-100 text-green-800',
  SHORT: 'bg-red-100 text-red-800',
  NONE: 'bg-gray-100 text-gray-800',
};

const ROW_HEIGHT = 45;
const CONTAINER_HEIGHT = 600;
const OVERSCAN = 10;

function calculateBuyHoldValue(
  startingCapital: number,
  purchasePrice: number,
  currentPrice: number
): number {
  const sharesAcquired = startingCapital / purchasePrice;
  return sharesAcquired * currentPrice;
}

function filterTradingDays(days: DayResult[]): DayResult[] {
  return days.filter((day) => day.dayIndex >= WARMUP_DAYS);
}

function CollapsibleHeader({
  isExpanded,
  tradingDaysCount,
  onToggle,
}: {
  isExpanded: boolean;
  tradingDaysCount: number;
  onToggle: () => void;
}) {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <CardHeader
      className="cursor-pointer select-none"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-2">
        <ChevronIcon className="h-5 w-5" aria-hidden="true" />
        <CardTitle>Day-by-Day Performance</CardTitle>
        <span className="text-muted-foreground text-sm">
          ({tradingDaysCount} trading days)
        </span>
      </div>
    </CardHeader>
  );
}

function TableHeader() {
  return (
    <div className="grid grid-cols-6 gap-4 px-4 py-2 font-semibold text-sm border-b bg-muted/50 rounded-t-md">
      <div>Date</div>
      <div className="text-right">Close Price</div>
      <div className="text-right">SMA Value</div>
      <div className="text-center">Position</div>
      <div className="text-right">Portfolio Value</div>
      <div className="text-right">Buy-Hold Value</div>
    </div>
  );
}

interface TableRowProps {
  day: DayResult;
  buyHoldValue: number;
  top: number;
}

function TableRow({ day, buyHoldValue, top }: TableRowProps) {
  const positionType: PositionType = day.position?.type ?? 'NONE';

  return (
    <div
      className="absolute left-0 w-full grid grid-cols-6 gap-4 px-4 items-center border-b text-sm"
      style={{ top, height: ROW_HEIGHT }}
    >
      <div className="font-mono">{day.date}</div>
      <div className="text-right font-mono">{formatCurrency(day.price)}</div>
      <div className="text-right font-mono">{formatCurrency(day.sma)}</div>
      <div className="text-center">
        <Badge className={POSITION_BADGE_STYLES[positionType]}>
          {positionType}
        </Badge>
      </div>
      <div className="text-right font-mono">{formatCurrency(day.balance)}</div>
      <div className="text-right font-mono">{formatCurrency(buyHoldValue)}</div>
    </div>
  );
}

export function DayByDayTable({
  result,
  purchasePrice,
  startingCapital,
}: DayByDayTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const tradingDays = useMemo(
    () => filterTradingDays(result.days),
    [result.days]
  );

  const virtualizer = useVirtualizer({
    count: tradingDays.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  return (
    <Card>
      <CollapsibleHeader
        isExpanded={isExpanded}
        tradingDaysCount={tradingDays.length}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <CardContent>
          <TableHeader />

          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ height: CONTAINER_HEIGHT }}
          >
            <div
              className="relative w-full"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const day = tradingDays[virtualRow.index];
                const buyHoldValue = calculateBuyHoldValue(
                  startingCapital,
                  purchasePrice,
                  day.price
                );

                return (
                  <TableRow
                    key={virtualRow.key}
                    day={day}
                    buyHoldValue={buyHoldValue}
                    top={virtualRow.start}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
