import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StrategyResult } from "@/lib/types/trading";

interface StatsCardsProps {
  result: StrategyResult;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function StatCard({
  title,
  hodl,
  sma,
  ema,
  isDrawdown = false,
}: {
  title: string;
  hodl: number;
  sma: number;
  ema: number;
  isDrawdown?: boolean;
}) {
  const getBestClass = (value: number, others: number[]) => {
    if (isDrawdown) {
      return value === Math.min(value, ...others) ? "text-green-600" : "";
    }
    return value === Math.max(value, ...others) ? "text-green-600" : "";
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">HODL</div>
            <div className={`text-lg font-bold ${getBestClass(hodl, [sma, ema])}`}>
              {formatPercent(hodl)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">SMA</div>
            <div className={`text-lg font-bold ${getBestClass(sma, [hodl, ema])}`}>
              {formatPercent(sma)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">EMA</div>
            <div className={`text-lg font-bold ${getBestClass(ema, [hodl, sma])}`}>
              {formatPercent(ema)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ result }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Annualized Return"
        hodl={result.hodlAnnualized}
        sma={result.smaAnnualized}
        ema={result.emaAnnualized}
      />
      <StatCard
        title="Max Drawdown"
        hodl={result.hodlMaxDrawdown}
        sma={result.smaMaxDrawdown}
        ema={result.emaMaxDrawdown}
        isDrawdown
      />
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Trade Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-muted-foreground">HODL</div>
              <div className="text-lg font-bold">1</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">SMA</div>
              <div className="text-lg font-bold">{result.smaTrades.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">EMA</div>
              <div className="text-lg font-bold">{result.emaTrades.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Total Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold">{result.totalDays}</div>
            <div className="text-xs text-muted-foreground">
              {(result.totalDays / 365).toFixed(1)} years
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
