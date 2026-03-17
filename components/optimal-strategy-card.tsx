'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  formatCurrency,
  formatPercent,
  getReturnColorClass,
  getVsHoldColorClass,
  formatAtrConfig,
  calculateVsHold,
} from '@/lib/format';
import type { BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface OptimalStrategyCardProps {
  result: BacktestResultSummary;
  baseline: BuyAndHoldBaseline;
}

export function OptimalStrategyCard({ result, baseline }: OptimalStrategyCardProps) {
  const vsHold = calculateVsHold(result.finalCollateral, baseline.finalValue);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Optimal Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold font-mono tabular-nums tracking-tight">
            {formatCurrency(result.finalCollateral)}
          </div>
          <div className="mt-2 flex justify-center gap-2">
            <Badge
              variant="outline"
              className={getReturnColorClass(result.totalReturn)}
            >
              {formatPercent(result.totalReturn)} gain
            </Badge>
            <Badge
              variant="outline"
              className={getVsHoldColorClass(vsHold)}
            >
              {formatPercent(vsHold)} vs hold
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground">SMA Period</div>
            <div className="font-mono font-medium tabular-nums">{result.config.smaPeriod}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Long Leverage</div>
            <div className="font-mono font-medium tabular-nums">{result.config.longLeverage}x</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Short Leverage</div>
            <div className="font-mono font-medium tabular-nums">{result.config.shortLeverage}x</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">ATR Config</div>
            <div className="font-mono font-medium tabular-nums">{formatAtrConfig(result.config.atr, 'None')}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Trades</div>
            <div className="font-mono font-medium tabular-nums">{result.totalTrades}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
