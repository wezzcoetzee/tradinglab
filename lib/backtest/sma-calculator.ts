import type { CsvRow } from '../types';

export function extractClosePrices(csvData: CsvRow[]): number[] {
  return csvData.map(row => row.close);
}

export function calculateSMA(closePrices: number[], period: number): number[] {
  const sma: number[] = [];
  let windowSum = 0;

  for (let i = 0; i < closePrices.length; i++) {
    windowSum += closePrices[i];
    if (i >= period) windowSum -= closePrices[i - period];
    sma.push(i < period - 1 ? NaN : windowSum / period);
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
