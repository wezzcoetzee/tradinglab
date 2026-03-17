'use client';

export interface Metrics {
  total: number;
  profitable: number;
  liquidated: number;
  liquidationRate: number;
}

interface MetricsCardsProps {
  metrics: Metrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 rounded-lg bg-muted">
        <div className="text-2xl font-bold tabular-nums">{metrics.total}</div>
        <div className="text-sm text-muted-foreground">Total Configs</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted">
        <div className="text-2xl font-bold text-[var(--profit-green)] tabular-nums">{metrics.profitable}</div>
        <div className="text-sm text-muted-foreground">Profitable</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted">
        <div className="text-2xl font-bold text-destructive tabular-nums">{metrics.liquidated}</div>
        <div className="text-sm text-muted-foreground">Liquidated</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted">
        <div className="text-2xl font-bold text-destructive tabular-nums">{metrics.liquidationRate.toFixed(1)}%</div>
        <div className="text-sm text-muted-foreground">Liquidation Rate</div>
      </div>
    </div>
  );
}
