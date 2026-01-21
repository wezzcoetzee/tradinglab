"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { DailyData } from "@/lib/backtest";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { CHART_COLORS } from "@/lib/chart-constants";

interface PortfolioChartProps {
  dailyData: DailyData[];
  smaPeriod: number;
}

export function PortfolioChart({ dailyData, smaPeriod }: PortfolioChartProps) {
  const [useLogScale, setUseLogScale] = useState(true);
  const [showHodl, setShowHodl] = useState(true);
  const [showSma, setShowSma] = useState(true);

  const chartData = useMemo(() => {
    const maxPoints = 500;
    const step = Math.max(1, Math.floor(dailyData.length / maxPoints));
    return dailyData
      .filter((_, i) => i % step === 0 || i === dailyData.length - 1)
      .map((d) => ({
        date: formatDate(d.date, false),
        hodlValue: d.hodlValue,
        smaBalance: d.smaBalance,
      }));
  }, [dailyData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Portfolio Value ({smaPeriod}D SMA)</CardTitle>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="hodl-toggle"
                size="sm"
                checked={showHodl}
                onCheckedChange={setShowHodl}
              />
              <Label htmlFor="hodl-toggle" className="text-sm text-zinc-400">
                HODL
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="sma-toggle"
                size="sm"
                checked={showSma}
                onCheckedChange={setShowSma}
              />
              <Label htmlFor="sma-toggle" className="text-sm text-amber-500">
                SMA
              </Label>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
            <Label htmlFor="log-scale" className="text-sm text-zinc-400">
              Log
            </Label>
            <Switch
              id="log-scale"
              size="sm"
              checked={useLogScale}
              onCheckedChange={setUseLogScale}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={{ stroke: "#3f3f46" }}
                axisLine={{ stroke: "#3f3f46" }}
                interval="preserveStartEnd"
              />
              <YAxis
                scale={useLogScale ? "log" : "linear"}
                domain={useLogScale ? ["auto", "auto"] : [0, "auto"]}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={{ stroke: "#3f3f46" }}
                axisLine={{ stroke: "#3f3f46" }}
                tickFormatter={(v) => formatCurrency(v)}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(value, name) => [
                  typeof value === "number" ? formatCurrency(value) : "-",
                  name === "hodlValue" ? "HODL" : "SMA",
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "hodlValue" ? "HODL" : "SMA"
                }
              />
              {showHodl && (
                <Line
                  type="monotone"
                  dataKey="hodlValue"
                  stroke={CHART_COLORS.hodl}
                  strokeWidth={1.5}
                  dot={false}
                  name="hodlValue"
                />
              )}
              {showSma && (
                <Line
                  type="monotone"
                  dataKey="smaBalance"
                  stroke={CHART_COLORS.sma}
                  strokeWidth={1.5}
                  dot={false}
                  name="smaBalance"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
