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

  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      trueRanges.push(highs[i] - lows[i]);
      atr.push(NaN);
    } else {
      trueRanges.push(calculateTrueRange(highs[i], lows[i], closes[i - 1]));

      if (i < period) {
        atr.push(NaN);
      } else {
        const sum = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        atr.push(sum / period);
      }
    }
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
