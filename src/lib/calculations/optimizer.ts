import type { PricePoint, StrategyParams, OptimizationResult } from "../types/trading";
import { generateSignals } from "./signals";
import {
  calculateStrategyReturns,
  calculateAnnualizedReturn,
  calculateMaxDrawdown,
} from "./returns";

const FAIR_COMPARISON_START_DAY = 200;

export function runOptimization(
  priceData: PricePoint[],
  baseParams: Omit<StrategyParams, "maDuration">,
  minPeriod: number = 5,
  maxPeriod: number = 200
): OptimizationResult[] {
  const results: OptimizationResult[] = [];
  const simulationStartIdx = FAIR_COMPARISON_START_DAY - 1;
  const tradingDays = priceData.length - simulationStartIdx;

  const hodlFinal = priceData.length > FAIR_COMPARISON_START_DAY
    ? priceData[priceData.length - 1].closePrice / priceData[simulationStartIdx].closePrice
    : 1;
  const hodlAnnualized = calculateAnnualizedReturn(hodlFinal, 1, tradingDays);

  for (let period = minPeriod; period <= maxPeriod; period++) {
    const params: StrategyParams = { ...baseParams, maDuration: period };
    const dataPoints = generateSignals(priceData, period, baseParams.signalThreshold);

    const smaResult = calculateStrategyReturns(dataPoints, params, simulationStartIdx);
    const smaFinal = smaResult.returns[smaResult.returns.length - 1] ?? 1;

    results.push({
      maDuration: period,
      smaAnnualized: calculateAnnualizedReturn(smaFinal, 1, tradingDays),
      smaMaxDrawdown: calculateMaxDrawdown(smaResult.returns),
      smaTrades: smaResult.trades.length,
      hodlAnnualized,
    });
  }

  return results;
}
