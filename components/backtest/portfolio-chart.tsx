"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetailedDailyState } from "@/lib/backtest";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { useChartColors } from "@/hooks/use-chart-colors";

interface PortfolioChartProps {
  data: DetailedDailyState[];
  smaPeriod: number;
}

export function PortfolioChart({ data, smaPeriod }: PortfolioChartProps) {
  const colors = useChartColors();
  const [isLogScale, setIsLogScale] = useState(false);

  const chartData = useMemo(() => {
    const sampled = data.filter((_, i) => i % 7 === 0 || i === data.length - 1);
    return sampled.map((point) => ({
      date: formatDate(point.date, false),
      sma: Math.round(point.portfolioValue),
      hodl: Math.round(point.hodlValue),
    }));
  }, [data]);

  const yAxisDomain = useMemo(() => {
    if (!isLogScale || chartData.length === 0) return undefined;
    const allValues = chartData.flatMap((d) => [d.sma, d.hodl]);
    const min = Math.max(1, Math.min(...allValues));
    const max = Math.max(...allValues);
    return [min, max] as [number, number];
  }, [isLogScale, chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Portfolio Value Over Time ({smaPeriod}D SMA vs HODL)</CardTitle>
        <div className="flex rounded-md border border-zinc-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsLogScale(false)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              !isLogScale
                ? "bg-zinc-700 text-zinc-100"
                : "bg-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Linear
          </button>
          <button
            type="button"
            onClick={() => setIsLogScale(true)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              isLogScale
                ? "bg-zinc-700 text-zinc-100"
                : "bg-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Log
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => formatCurrency(v)}
                width={80}
                scale={isLogScale ? "log" : "auto"}
                domain={yAxisDomain}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelStyle={{ color: "var(--foreground)" }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sma"
                name={`${smaPeriod}D SMA`}
                stroke={colors.positive}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="hodl"
                name="HODL"
                stroke={colors.warning}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
