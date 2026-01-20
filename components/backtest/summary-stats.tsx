"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SmaResult } from "@/lib/backtest";
import { formatPercent, formatCurrency, formatDate } from "@/lib/formatting";

interface SummaryStatsProps {
  bestSma: SmaResult;
  hodl: {
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
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
  hodl,
  initialCapital,
  dateRange,
}: SummaryStatsProps) {
  const smaBeatHodl = bestSma.annualizedReturn > hodl.annualizedReturn;

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
            value={formatPercent(bestSma.annualizedReturn)}
            subValue={formatCurrency(bestSma.finalValue)}
            positive={bestSma.annualizedReturn > 0}
          />
          <StatCard
            label="HODL Return"
            value={formatPercent(hodl.annualizedReturn)}
            subValue={formatCurrency(hodl.finalValue)}
            positive={hodl.annualizedReturn > 0}
          />
          <StatCard
            label="SMA vs HODL"
            value={`${smaBeatHodl ? "+" : ""}${formatPercent(
              bestSma.annualizedReturn - hodl.annualizedReturn
            )}`}
            subValue={smaBeatHodl ? "SMA wins" : "HODL wins"}
            positive={smaBeatHodl}
          />
        </div>
        <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label="SMA Max Drawdown"
            value={formatPercent(bestSma.maxDrawdown)}
            positive={false}
          />
          <StatCard
            label="HODL Max Drawdown"
            value={formatPercent(hodl.maxDrawdown)}
            positive={false}
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
