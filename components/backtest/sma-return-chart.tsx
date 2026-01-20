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
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SmaResult } from "@/lib/backtest";
import { formatPercent } from "@/lib/formatting";
import { useChartColors } from "@/hooks/use-chart-colors";

interface SmaReturnChartProps {
  results: SmaResult[];
  hodlAnnualizedReturn: number;
  onSelectPeriod?: (period: number) => void;
}

export function SmaReturnChart({
  results,
  hodlAnnualizedReturn,
  onSelectPeriod,
}: SmaReturnChartProps) {
  const colors = useChartColors();

  const chartData = useMemo(() => {
    return results
      .filter((r) => !r.liquidated)
      .map((result) => ({
        period: result.period,
        annualized: result.annualizedReturn,
        maxDrawdown: -result.maxDrawdown,
      }))
      .sort((a, b) => a.period - b.period);
  }, [results]);

  // Recharts v3 types don't match the actual runtime event shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    const period = data?.activePayload?.[0]?.payload?.period;
    if (typeof period === "number") {
      onSelectPeriod?.(period);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMA Period vs Annualized Return</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} onClick={handleClick}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
                label={{
                  value: "SMA Period (Days)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => formatPercent(v, 1)}
                width={60}
                label={{
                  value: "Return",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatPercent(Math.abs(Number(value)), 1),
                  name === "annualized" ? "Annualized Return" : "Max Drawdown",
                ]}
                labelFormatter={(label) => `${label}D SMA`}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <ReferenceLine
                y={hodlAnnualizedReturn}
                stroke={colors.warning}
                strokeDasharray="5 5"
                label={{
                  value: "HODL",
                  fill: colors.warning,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="annualized"
                name="Annualized Return"
                stroke={colors.positive}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6, cursor: "pointer" }}
              />
              <Line
                type="monotone"
                dataKey="maxDrawdown"
                name="Max Drawdown"
                stroke={colors.negative}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6, cursor: "pointer" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
