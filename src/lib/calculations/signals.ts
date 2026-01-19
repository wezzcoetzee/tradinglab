import type { Signal, PricePoint, DataPointWithIndicators } from "../types/trading";
import { calculateSMA, calculateEMA } from "./indicators";

export function generateSignal(
  price: number,
  ma: number | undefined,
  previousSignal: Signal,
  threshold: number
): Signal {
  if (ma === undefined) {
    return "neutral";
  }

  const lowerBand = ma * (1 - threshold);
  const upperBand = ma * (1 + threshold);

  if (price < lowerBand) return "short";
  if (price > upperBand) return "long";
  return previousSignal === "neutral" ? "short" : previousSignal;
}

export function generateSignals(
  priceData: PricePoint[],
  maDuration: number,
  threshold: number = 0
): DataPointWithIndicators[] {
  const prices = priceData.map((p) => p.closePrice);
  const smaValues = calculateSMA(prices, maDuration);
  const emaValues = calculateEMA(prices, maDuration);

  let previousSmaSignal: Signal = "neutral";
  let previousEmaSignal: Signal = "neutral";

  return priceData.map((point, i) => {
    const smaSignal = generateSignal(point.closePrice, smaValues[i], previousSmaSignal, threshold);
    const emaSignal = generateSignal(point.closePrice, emaValues[i], previousEmaSignal, threshold);

    previousSmaSignal = smaSignal;
    previousEmaSignal = emaSignal;

    return {
      ...point,
      sma: smaValues[i],
      ema: emaValues[i],
      smaSignal,
      emaSignal,
    };
  });
}
