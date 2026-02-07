import { WARMUP_DAYS } from '@/lib/backtest/constants';
import type { DayResult } from '@/lib/backtest/types';
import { downsampleLTTB } from '@/lib/downsample';

export interface ChartDataPoint {
  date: string;
  price: number;
  sma: number;
  portfolioValue: number;
  buyHoldValue: number;
  isAtrStop: boolean;
}

export function buildChartData(
  days: DayResult[],
  startingCapital: number,
  purchasePrice: number,
  maxPoints: number
): ChartDataPoint[] {
  const tradingDays = days.filter((day) => day.dayIndex >= WARMUP_DAYS);
  const sharesAcquired = startingCapital / purchasePrice;

  const allPoints: ChartDataPoint[] = tradingDays.map((day) => ({
    date: day.date,
    price: day.price,
    sma: day.sma,
    portfolioValue: day.portfolioValue,
    buyHoldValue: sharesAcquired * day.price,
    isAtrStop: day.action === 'ATR_PARTIAL_CLOSE',
  }));

  if (allPoints.length <= maxPoints) return allPoints;

  const sampledIndices = downsampleLTTB(allPoints, maxPoints, (p) => p.price);
  const indexSet = new Set(sampledIndices);

  allPoints.forEach((point, i) => {
    if (point.isAtrStop) indexSet.add(i);
  });

  const sortedIndices = Array.from(indexSet).sort((a, b) => a - b);
  return sortedIndices.map((i) => allPoints[i]);
}
