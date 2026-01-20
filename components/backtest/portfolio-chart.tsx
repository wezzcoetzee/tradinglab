"use client";

import { useMemo } from "react";
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

  const chartData = useMemo(() => {
    const sampled = data.filter((_, i) => i % 7 === 0 || i === data.length - 1);
    return sampled.map((point) => ({
      date: formatDate(point.date, false),
      sma: Math.round(point.portfolioValue),
      hodl: Math.round(point.hodlValue),
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Value Over Time ({smaPeriod}D SMA vs HODL)</CardTitle>
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
