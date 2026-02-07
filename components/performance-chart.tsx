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
import { WARMUP_DAYS } from '@/lib/backtest/constants';
import type { BacktestResult, BuyAndHoldBaseline } from '@/lib/backtest/types';

interface PerformanceChartProps {
  result: BacktestResult;
  baseline: BuyAndHoldBaseline;
}

interface ChartDataPoint {
  date: string;
  price: number;
  sma: number;
  portfolioValue: number;
  buyHoldValue: number;
  isAtrStop: boolean;
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

function downsampleLTTB(data: ChartDataPoint[], threshold: number, yKey: keyof ChartDataPoint): number[] {
  const length = data.length;
  if (threshold >= length || threshold < 3) {
    return data.map((_, i) => i);
  }

  const sampled: number[] = [0];
  const bucketSize = (length - 2) / (threshold - 2);

  let prevIndex = 0;

  for (let i = 1; i < threshold - 1; i++) {
    const avgStart = Math.floor((i + 0) * bucketSize) + 1;
    const avgEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, length);

    let avgX = 0;
    let avgY = 0;
    const avgCount = avgEnd - avgStart;

    for (let j = avgStart; j < avgEnd; j++) {
      avgX += j;
      avgY += data[j][yKey] as number;
    }
    avgX /= avgCount;
    avgY /= avgCount;

    const rangeStart = Math.floor((i - 1) * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor(i * bucketSize) + 1, length);

    const prevX = prevIndex;
    const prevY = data[prevIndex][yKey] as number;

    let maxArea = -1;
    let maxIndex = rangeStart;

    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (prevX - avgX) * ((data[j][yKey] as number) - prevY) -
        (prevX - j) * (avgY - prevY)
      );
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(maxIndex);
    prevIndex = maxIndex;
  }

  sampled.push(length - 1);
  return sampled;
}

function formatDateTick(dateStr: string): string {
  const [, month, year] = dateStr.split('/');
  return `${month}/${year.slice(2)}`;
}

function currencyTickFormatter(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function PerformanceChart({ result, baseline }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const tradingDays = result.days.filter((day) => day.dayIndex >= WARMUP_DAYS);
    const sharesAcquired = baseline.startingCapital / baseline.purchasePrice;

    const allPoints: ChartDataPoint[] = tradingDays.map((day) => ({
      date: day.date,
      price: day.price,
      sma: day.sma,
      portfolioValue: day.portfolioValue,
      buyHoldValue: sharesAcquired * day.price,
      isAtrStop: day.action === 'ATR_PARTIAL_CLOSE',
    }));

    if (allPoints.length <= MAX_POINTS) return allPoints;

    const sampledIndices = downsampleLTTB(allPoints, MAX_POINTS, 'price');
    const indexSet = new Set(sampledIndices);

    allPoints.forEach((point, i) => {
      if (point.isAtrStop) indexSet.add(i);
    });

    const sortedIndices = Array.from(indexSet).sort((a, b) => a - b);
    return sortedIndices.map((i) => allPoints[i]);
  }, [result.days, baseline.startingCapital, baseline.purchasePrice]);

  const atrStopPoints = useMemo(
    () => chartData.filter((d) => d.isAtrStop),
    [chartData]
  );

  const [logScale, setLogScale] = useState(true);
  const yAxisScale = logScale ? 'log' : 'auto';
  const yAxisDomain = logScale ? (['auto', 'auto'] as const) : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance Chart</CardTitle>
        <div className="flex items-center gap-2">
          <Switch id="log-scale" checked={logScale} onCheckedChange={setLogScale} />
          <Label htmlFor="log-scale" className="text-sm font-normal">Log scale</Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-sm font-medium mb-2">Price &amp; SMA</h3>
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
          <h3 className="text-sm font-medium mb-2">Equity Curve</h3>
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
