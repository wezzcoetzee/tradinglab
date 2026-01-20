import type { PricePoint } from "./types";

export function calculateEma(prices: number[], period: number): (number | null)[] {
  const emaValues: (number | null)[] = [];
  const k = 2 / (period + 1);

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      emaValues.push(null);
      continue;
    }

    if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      emaValues.push(sum / period);
      continue;
    }

    const prevEma = emaValues[i - 1];
    if (prevEma !== null) {
      emaValues.push(prices[i] * k + prevEma * (1 - k));
    } else {
      emaValues.push(null);
    }
  }

  return emaValues;
}

export function calculateAllEmas(
  pricePoints: PricePoint[],
  minPeriod: number,
  maxPeriod: number
): Map<number, (number | null)[]> {
  const prices = pricePoints.map((p) => p.closePrice);
  const emaMap = new Map<number, (number | null)[]>();

  for (let period = minPeriod; period <= maxPeriod; period++) {
    emaMap.set(period, calculateEma(prices, period));
  }

  return emaMap;
}
