import type { PricePoint, StrategyParams, OptimizationResult } from "../types/trading";
import { generateSignals } from "./signals";
import {
  calculateStrategyReturns,
  calculateAnnualizedReturn,
  calculateMaxDrawdown,
} from "./returns";

export function runOptimization(
  priceData: PricePoint[],
  baseParams: Omit<StrategyParams, "maDuration">,
  minPeriod: number = 5,
  maxPeriod: number = 200
): OptimizationResult[] {
  const results: OptimizationResult[] = [];
  const totalDays = priceData.length;

  const hodlFinal = priceData.length > 0
    ? priceData[priceData.length - 1].closePrice / priceData[0].closePrice
    : 1;
  const hodlAnnualized = calculateAnnualizedReturn(hodlFinal, 1, totalDays);

  for (let period = minPeriod; period <= maxPeriod; period++) {
    const params: StrategyParams = { ...baseParams, maDuration: period };
    const dataPoints = generateSignals(priceData, period, baseParams.signalThreshold);

    const smaResult = calculateStrategyReturns(dataPoints, params);
    const smaFinal = smaResult.returns[smaResult.returns.length - 1] ?? 1;

    results.push({
      maDuration: period,
      smaAnnualized: calculateAnnualizedReturn(smaFinal, 1, totalDays),
      smaMaxDrawdown: calculateMaxDrawdown(smaResult.returns),
      smaTrades: smaResult.trades.length,
      hodlAnnualized,
    });
  }

  return results;
}
