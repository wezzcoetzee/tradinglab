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

  for (let period = minPeriod; period <= maxPeriod; period++) {
    const params: StrategyParams = { ...baseParams, maDuration: period };
    const dataPoints = generateSignals(priceData, period, baseParams.signalThreshold);

    const smaResult = calculateStrategyReturns(dataPoints, params, "sma");
    const emaResult = calculateStrategyReturns(dataPoints, params, "ema");

    const smaFinal = smaResult.returns[smaResult.returns.length - 1] ?? 1;
    const emaFinal = emaResult.returns[emaResult.returns.length - 1] ?? 1;

    results.push({
      maDuration: period,
      smaAnnualized: calculateAnnualizedReturn(smaFinal, 1, totalDays),
      emaAnnualized: calculateAnnualizedReturn(emaFinal, 1, totalDays),
      smaMaxDrawdown: calculateMaxDrawdown(smaResult.returns),
      emaMaxDrawdown: calculateMaxDrawdown(emaResult.returns),
      smaTrades: smaResult.trades.length,
      emaTrades: emaResult.trades.length,
    });
  }

  return results;
}
