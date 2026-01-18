import type { Signal, PricePoint, DataPointWithIndicators } from "../types/trading";
import { calculateSMA, calculateEMA } from "./indicators";

export function generateSignal(price: number, ma: number | undefined): Signal {
  if (ma === undefined) {
    return "neutral";
  }
  return price > ma ? "long" : "short";
}

export function generateSignals(
  priceData: PricePoint[],
  maDuration: number
): DataPointWithIndicators[] {
  const prices = priceData.map((p) => p.closePrice);
  const smaValues = calculateSMA(prices, maDuration);
  const emaValues = calculateEMA(prices, maDuration);

  return priceData.map((point, i) => ({
    ...point,
    sma: smaValues[i],
    ema: emaValues[i],
    smaSignal: generateSignal(point.closePrice, smaValues[i]),
    emaSignal: generateSignal(point.closePrice, emaValues[i]),
  }));
}
