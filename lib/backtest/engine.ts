import type {
  PricePoint,
  BacktestParams,
  MaResult,
  DailyData,
  DetailedBacktestResult,
  LeverageConfig,
} from "./types";
import { calculateAllSmas } from "./sma";
import { simulateMaStrategy, calculateHodl, generateDailyData } from "./simulator";

const WARMUP_DAYS = 200;
const LEVERAGE_VALUES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

export interface SelectedConfig {
  period: number;
  leverage: LeverageConfig;
}

export function runBacktest(
  pricePoints: PricePoint[],
  params: BacktestParams,
  selectedConfig?: SelectedConfig
): DetailedBacktestResult {
  const {
    initialCapital,
    exchangeFeePercent,
    smaMin,
    smaMax,
    buyOnLong,
    shortOnShort,
    leverage,
    optimizeLeverage,
  } = params;

  const startIndex = WARMUP_DAYS - 1;
  const tradingPricePoints = pricePoints.slice(startIndex);

  const smaMap = calculateAllSmas(pricePoints, smaMin, smaMax);

  const hodl = calculateHodl(tradingPricePoints, initialCapital);

  const smaResults: MaResult[] = [];

  const baseSim = {
    initialCapital,
    exchangeFeePercent,
    buyOnLong,
    shortOnShort,
  };

  const longLeverages = optimizeLeverage ? LEVERAGE_VALUES : [leverage.long];
  const shortLeverages = optimizeLeverage ? LEVERAGE_VALUES : [leverage.short];

  for (let period = smaMin; period <= smaMax; period++) {
    const smaValues = smaMap.get(period);

    if (!smaValues) continue;

    const tradingSmaValues = smaValues.slice(startIndex);

    for (const longLev of longLeverages) {
      for (const shortLev of shortLeverages) {
        const simulatorParams = {
          ...baseSim,
          leverage: { long: longLev, short: shortLev },
        };

        const smaSimResult = simulateMaStrategy(tradingPricePoints, tradingSmaValues, simulatorParams);
        smaSimResult.result.period = period;
        smaResults.push(smaSimResult.result);
      }
    }
  }

  const bestSma = smaResults.reduce((best, current) =>
    current.totalReturn > best.totalReturn ? current : best
  , smaResults[0]);

  const dateRange = {
    start: tradingPricePoints[0].date,
    end: tradingPricePoints[tradingPricePoints.length - 1].date,
    days: tradingPricePoints.length,
  };

  let dailyData: DailyData[] | undefined;

  if (selectedConfig !== undefined) {
    const smaValues = smaMap.get(selectedConfig.period);

    if (smaValues) {
      const tradingSmaValues = smaValues.slice(startIndex);

      dailyData = generateDailyData(
        tradingPricePoints,
        tradingSmaValues,
        { ...baseSim, leverage: selectedConfig.leverage }
      );
    }
  }

  return {
    params,
    hodl: {
      totalReturn: hodl.totalReturn,
      finalValue: hodl.finalValue,
    },
    smaResults,
    bestSma,
    dateRange,
    dailyData,
  };
}
