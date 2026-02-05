import type { CsvRow } from '../types';

export function extractClosePrices(csvData: CsvRow[]): number[] {
  return csvData.map(row => row.close);
}

export function calculateSMA(closePrices: number[], period: number): number[] {
  const sma: number[] = [];

  for (let i = 0; i < closePrices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = closePrices
        .slice(i - period + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }

  return sma;
}

export function calculateAllSMAs(
  closePrices: number[],
  minPeriod: number,
  maxPeriod: number
): Map<number, number[]> {
  const smaMap = new Map<number, number[]>();

  for (let period = minPeriod; period <= maxPeriod; period++) {
    smaMap.set(period, calculateSMA(closePrices, period));
  }

  return smaMap;
}
