import type { PricePoint } from "./types";

export function calculateSma(prices: number[], period: number): (number | null)[] {
  const smaValues: (number | null)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      smaValues.push(null);
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    smaValues.push(sum / period);
  }

  return smaValues;
}

export function calculateAllSmas(
  pricePoints: PricePoint[],
  minPeriod: number,
  maxPeriod: number
): Map<number, (number | null)[]> {
  const prices = pricePoints.map((p) => p.closePrice);
  const smaMap = new Map<number, (number | null)[]>();

  for (let period = minPeriod; period <= maxPeriod; period++) {
    smaMap.set(period, calculateSma(prices, period));
  }

  return smaMap;
}
