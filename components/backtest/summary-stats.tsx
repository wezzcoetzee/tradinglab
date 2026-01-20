"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MaResult } from "@/lib/backtest";
import { formatPercent, formatCurrency, formatDate } from "@/lib/formatting";

interface SummaryStatsProps {
  bestSma: MaResult;
  bestEma: MaResult;
  hodl: {
    totalReturn: number;
    finalValue: number;
  };
  initialCapital: number;
  dateRange: {
    start: Date;
    end: Date;
    days: number;
  };
}

function StatCard({
  label,
  value,
  subValue,
  positive,
}: {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-bold ${
          positive === undefined
            ? ""
            : positive
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {value}
      </p>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
  );
}

export function SummaryStats({
  bestSma,
  bestEma,
  hodl,
  initialCapital,
  dateRange,
}: SummaryStatsProps) {
  const bestOverall = bestSma.totalReturn > bestEma.totalReturn ? bestSma : bestEma;
  const bestType = bestSma.totalReturn > bestEma.totalReturn ? "SMA" : "EMA";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label="Best SMA Period"
            value={`${bestSma.period}D`}
            subValue={`${bestSma.trades} trades`}
          />
          <StatCard
            label="Best SMA Return"
            value={formatPercent(bestSma.totalReturn)}
            subValue={formatCurrency(bestSma.finalValue)}
            positive={bestSma.totalReturn > 0}
          />
          <StatCard
            label="Best EMA Period"
            value={`${bestEma.period}D`}
            subValue={`${bestEma.trades} trades`}
          />
          <StatCard
            label="Best EMA Return"
            value={formatPercent(bestEma.totalReturn)}
            subValue={formatCurrency(bestEma.finalValue)}
            positive={bestEma.totalReturn > 0}
          />
        </div>
        <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label="HODL Return"
            value={formatPercent(hodl.totalReturn)}
            subValue={formatCurrency(hodl.finalValue)}
            positive={hodl.totalReturn > 0}
          />
          <StatCard
            label={`Best ${bestType} vs HODL`}
            value={`${bestOverall.totalReturn > hodl.totalReturn ? "+" : ""}${formatPercent(
              bestOverall.totalReturn - hodl.totalReturn
            )}`}
            subValue={bestOverall.totalReturn > hodl.totalReturn ? `${bestType} wins` : "HODL wins"}
            positive={bestOverall.totalReturn > hodl.totalReturn}
          />
          <StatCard
            label="Initial Capital"
            value={formatCurrency(initialCapital)}
          />
          <StatCard
            label="Date Range"
            value={`${Math.round(dateRange.days / 365)} years`}
            subValue={`${formatDate(dateRange.start)} - ${formatDate(
              dateRange.end
            )}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
