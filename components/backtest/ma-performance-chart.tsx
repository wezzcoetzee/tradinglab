"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { MaResult } from "@/lib/backtest";
import { formatPercent } from "@/lib/formatting";

interface MaPerformanceChartProps {
  smaResults: MaResult[];
  emaResults: MaResult[];
  hodlReturn: number;
}

const COLORS = {
  hodl: "#a1a1aa",
  sma: "#f59e0b",
  ema: "#3b82f6",
};

export function MaPerformanceChart({
  smaResults,
  emaResults,
  hodlReturn,
}: MaPerformanceChartProps) {
  const [showHodl, setShowHodl] = useState(true);
  const [showSma, setShowSma] = useState(true);
  const [showEma, setShowEma] = useState(true);

  const chartData = useMemo(() => {
    const smaMap = new Map(smaResults.map((r) => [r.period, r.totalReturn]));
    const emaMap = new Map(emaResults.map((r) => [r.period, r.totalReturn]));

    const allPeriods = new Set([
      ...smaResults.map((r) => r.period),
      ...emaResults.map((r) => r.period),
    ]);

    return Array.from(allPeriods)
      .sort((a, b) => a - b)
      .map((period) => ({
        period,
        smaReturn: smaMap.get(period),
        emaReturn: emaMap.get(period),
      }));
  }, [smaResults, emaResults]);

  const yDomain = useMemo(() => {
    const allReturns = [
      ...smaResults.map((r) => r.totalReturn),
      ...emaResults.map((r) => r.totalReturn),
      hodlReturn,
    ];
    const min = Math.min(...allReturns);
    const max = Math.max(...allReturns);
    return [Math.min(0, min * 1.1), max * 1.1];
  }, [smaResults, emaResults, hodlReturn]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>MA Period Performance</CardTitle>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="perf-hodl-toggle"
                size="sm"
                checked={showHodl}
                onCheckedChange={setShowHodl}
              />
              <Label
                htmlFor="perf-hodl-toggle"
                className="text-sm text-zinc-400"
              >
                HODL
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="perf-sma-toggle"
                size="sm"
                checked={showSma}
                onCheckedChange={setShowSma}
              />
              <Label
                htmlFor="perf-sma-toggle"
                className="text-sm text-amber-500"
              >
                SMA
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="perf-ema-toggle"
                size="sm"
                checked={showEma}
                onCheckedChange={setShowEma}
              />
              <Label htmlFor="perf-ema-toggle" className="text-sm text-blue-500">
                EMA
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="period"
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={{ stroke: "#3f3f46" }}
                axisLine={{ stroke: "#3f3f46" }}
                label={{
                  value: "MA Period (days)",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#71717a",
                  fontSize: 12,
                }}
              />
              <YAxis
                scale="linear"
                domain={yDomain}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={{ stroke: "#3f3f46" }}
                axisLine={{ stroke: "#3f3f46" }}
                tickFormatter={(v) => formatPercent(v, 0)}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
                labelFormatter={(period) => `${period}D MA`}
                formatter={(value, name) => [
                  typeof value === "number" ? formatPercent(value) : "-",
                  name === "smaReturn" ? "SMA" : "EMA",
                ]}
              />
              <Legend
                formatter={(value) => (value === "smaReturn" ? "SMA" : "EMA")}
              />
              {showHodl && (
                <ReferenceLine
                  y={hodlReturn}
                  stroke={COLORS.hodl}
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: `HODL: ${formatPercent(hodlReturn)}`,
                    fill: COLORS.hodl,
                    fontSize: 11,
                    position: "right",
                  }}
                />
              )}
              {showSma && (
                <Line
                  type="monotone"
                  dataKey="smaReturn"
                  stroke={COLORS.sma}
                  strokeWidth={1.5}
                  dot={false}
                  name="smaReturn"
                  connectNulls
                />
              )}
              {showEma && (
                <Line
                  type="monotone"
                  dataKey="emaReturn"
                  stroke={COLORS.ema}
                  strokeWidth={1.5}
                  dot={false}
                  name="emaReturn"
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
