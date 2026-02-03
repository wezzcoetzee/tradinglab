'use client';

import type { BuyAndHoldBaseline } from '@/lib/backtest/types';

interface BaselineCardProps {
  baseline: BuyAndHoldBaseline;
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

function getReturnColorClass(returnPercent: number): string {
  return returnPercent >= 0 ? 'text-green-600' : 'text-destructive';
}

export function BaselineCard({ baseline }: BaselineCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="text-sm font-medium text-muted-foreground mb-3">Buy & Hold Baseline</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Purchase (Day 160)</div>
          <div className="font-mono">{formatCurrency(baseline.purchasePrice)}</div>
          <div className="text-xs text-muted-foreground">{baseline.purchaseDate}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Final</div>
          <div className="font-mono">{formatCurrency(baseline.finalPrice)}</div>
          <div className="text-xs text-muted-foreground">{baseline.finalDate}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Final Value</div>
          <div className="font-mono">{formatCurrency(baseline.finalValue)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Return</div>
          <div className={`font-mono ${getReturnColorClass(baseline.percentGain)}`}>
            {formatPercent(baseline.percentGain)}
          </div>
        </div>
      </div>
    </div>
  );
}
