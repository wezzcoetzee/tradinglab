import type {
  PricePoint,
  BacktestParams,
  MaResult,
  DailyData,
  DetailedBacktestResult,
} from "./types";
import { calculateAllSmas } from "./sma";
import { calculateAllEmas } from "./ema";
import { simulateMaStrategy, calculateHodl, generateDailyData } from "./simulator";

const WARMUP_DAYS = 200;

export function runBacktest(
  pricePoints: PricePoint[],
  params: BacktestParams,
  selectedPeriod?: number
): DetailedBacktestResult {
  const {
    initialCapital,
    exchangeFeePercent,
    gasFeePerTrade,
    smaMin,
    smaMax,
    buyOnLong,
    shortOnShort,
  } = params;

  const startIndex = WARMUP_DAYS - 1;
  const tradingPricePoints = pricePoints.slice(startIndex);

  const smaMap = calculateAllSmas(pricePoints, smaMin, smaMax);
  const emaMap = calculateAllEmas(pricePoints, smaMin, smaMax);

  const hodl = calculateHodl(tradingPricePoints, initialCapital);

  const smaResults: MaResult[] = [];
  const emaResults: MaResult[] = [];

  const simulatorParams = {
    initialCapital,
    exchangeFeePercent,
    gasFeePerTrade,
    buyOnLong,
    shortOnShort,
  };

  for (let period = smaMin; period <= smaMax; period++) {
    const smaValues = smaMap.get(period);
    const emaValues = emaMap.get(period);

    if (!smaValues || !emaValues) continue;

    const tradingSmaValues = smaValues.slice(startIndex);
    const tradingEmaValues = emaValues.slice(startIndex);

    const smaSimResult = simulateMaStrategy(tradingPricePoints, tradingSmaValues, simulatorParams);
    smaSimResult.result.period = period;
    smaResults.push(smaSimResult.result);

    const emaSimResult = simulateMaStrategy(tradingPricePoints, tradingEmaValues, simulatorParams);
    emaSimResult.result.period = period;
    emaResults.push(emaSimResult.result);
  }

  const bestSma = smaResults.reduce((best, current) =>
    current.totalReturn > best.totalReturn ? current : best
  , smaResults[0]);

  const bestEma = emaResults.reduce((best, current) =>
    current.totalReturn > best.totalReturn ? current : best
  , emaResults[0]);

  const dateRange = {
    start: tradingPricePoints[0].date,
    end: tradingPricePoints[tradingPricePoints.length - 1].date,
    days: tradingPricePoints.length,
  };

  let dailyData: DailyData[] | undefined;

  if (selectedPeriod !== undefined) {
    const smaValues = smaMap.get(selectedPeriod);
    const emaValues = emaMap.get(selectedPeriod);

    if (smaValues && emaValues) {
      const tradingSmaValues = smaValues.slice(startIndex);
      const tradingEmaValues = emaValues.slice(startIndex);

      dailyData = generateDailyData(
        tradingPricePoints,
        tradingSmaValues,
        tradingEmaValues,
        simulatorParams
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
    emaResults,
    bestSma,
    bestEma,
    dateRange,
    dailyData,
  };
}
