'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { BacktestResult, BuyAndHoldBaseline } from '@/lib/backtest/types';
import { buildChartData } from '@/lib/chart-data';
import { formatDateTick, currencyTickFormatter } from '@/lib/format';

interface PerformanceChartProps {
  result: BacktestResult;
  baseline: BuyAndHoldBaseline;
  assetName?: string | null;
}

const MAX_POINTS = 2000;

const priceChartConfig = {
  price: { label: 'Price', color: 'var(--chart-1)' },
  sma: { label: 'SMA', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const equityChartConfig = {
  portfolioValue: { label: 'Strategy', color: 'var(--chart-1)' },
  buyHoldValue: { label: 'Buy & Hold', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export function PerformanceChart({ result, baseline, assetName }: PerformanceChartProps) {
  const chartData = useMemo(
    () => buildChartData(result.days, baseline.startingCapital, baseline.purchasePrice, MAX_POINTS),
    [result.days, baseline.startingCapital, baseline.purchasePrice]
  );

  const atrStopPoints = useMemo(
    () => chartData.filter((d) => d.isAtrStop),
    [chartData]
  );

  const [logScale, setLogScale] = useState(true);
  const yAxisScale = logScale ? 'log' : 'auto';
  const yAxisDomain: [string, string] | undefined = logScale ? ['auto', 'auto'] : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{assetName ? `${assetName} Performance` : 'Performance Chart'}</CardTitle>
        <div className="flex items-center gap-2">
          <Switch id="log-scale" checked={logScale} onCheckedChange={setLogScale} />
          <Label htmlFor="log-scale" className="text-sm font-normal">Log scale</Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h2 className="text-sm font-medium mb-2">Price &amp; SMA</h2>
          <ChartContainer config={priceChartConfig} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                scale={yAxisScale}
                domain={yAxisDomain}
                tickFormatter={currencyTickFormatter}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
                dot={false}
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="sma"
                stroke="var(--color-sma)"
                dot={false}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              {atrStopPoints.map((point) => (
                <ReferenceDot
                  key={point.date}
                  x={point.date}
                  y={point.price}
                  r={4}
                  fill="var(--destructive)"
                  stroke="none"
                />
              ))}
            </LineChart>
          </ChartContainer>
        </div>

        <div>
          <h2 className="text-sm font-medium mb-2">Equity Curve</h2>
          <ChartContainer config={equityChartConfig} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                scale={yAxisScale}
                domain={yAxisDomain}
                tickFormatter={currencyTickFormatter}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine
                y={baseline.startingCapital}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="portfolioValue"
                stroke="var(--color-portfolioValue)"
                dot={false}
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="buyHoldValue"
                stroke="var(--color-buyHoldValue)"
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
