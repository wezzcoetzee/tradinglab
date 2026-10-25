import type { CsvRow } from '../types';

import { ATR_PERIODS } from './constants';

export function calculateTrueRange(
  high: number,
  low: number,
  previousClose: number
): number {
  const highLow = high - low;
  const highPrevClose = Math.abs(high - previousClose);
  const lowPrevClose = Math.abs(low - previousClose);
  return Math.max(highLow, highPrevClose, lowPrevClose);
}

export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number
): number[] {
  const atr: number[] = [];
  const trueRanges: number[] = [];
  let windowSum = 0;

  for (let i = 0; i < highs.length; i++) {
    const trueRange = i === 0
      ? highs[i] - lows[i]
      : calculateTrueRange(highs[i], lows[i], closes[i - 1]);
    trueRanges.push(trueRange);
    windowSum += trueRange;
    if (i >= period) windowSum -= trueRanges[i - period];

    // Starting at `period` keeps bar 0 (no previous close, so only high - low) out of every window.
    atr.push(i < period ? NaN : windowSum / period);
  }

  return atr;
}

export function calculateAllATRs(csvData: CsvRow[]): Map<10 | 14 | 20, number[]> {
  const highs = csvData.map(row => row.high);
  const lows = csvData.map(row => row.low);
  const closes = csvData.map(row => row.close);

  const atrMap = new Map<10 | 14 | 20, number[]>();

  for (const period of ATR_PERIODS) {
    atrMap.set(period, calculateATR(highs, lows, closes, period));
  }

  return atrMap;
}
