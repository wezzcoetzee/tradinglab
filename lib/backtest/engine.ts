import type {
  PricePoint,
  BacktestParams,
  BacktestResult,
  SmaResult,
  DetailedDailyState,
} from "./types";
import { calculateAllSmas } from "./sma";
import { calculateAtr } from "./atr";
import { simulateStrategy, calculateHodl } from "./simulator";

export interface DetailedBacktestResult extends BacktestResult {
  selectedPeriodTimeSeries?: DetailedDailyState[];
}

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
    longLeverage,
    shortLeverage,
    atrMultiplier,
    atrPeriod,
  } = params;

  const smaMap = calculateAllSmas(pricePoints, smaMin, smaMax);
  const closePrices = pricePoints.map((p) => p.closePrice);
  const atrValues = calculateAtr(closePrices, atrPeriod);

  const startIndex = WARMUP_DAYS - 1;
  const tradingPricePoints = pricePoints.slice(startIndex);
  const tradingAtrValues = atrValues.slice(startIndex);

  const hodl = calculateHodl(tradingPricePoints, initialCapital);

  const smaResults: SmaResult[] = [];
  let selectedPeriodTimeSeries: DetailedDailyState[] | undefined;

  for (let period = smaMin; period <= smaMax; period++) {
    const smaValues = smaMap.get(period);
    if (!smaValues) continue;

    const tradingSmaValues = smaValues.slice(startIndex);

    const { result, timeSeries } = simulateStrategy(
      tradingPricePoints,
      tradingSmaValues,
      tradingAtrValues,
      {
        initialCapital,
        exchangeFeePercent,
        gasFeePerTrade,
        buyOnLong,
        shortOnShort,
        longLeverage,
        shortLeverage,
        atrMultiplier,
        atrPeriod,
      }
    );

    result.period = period;
    smaResults.push(result);

    if (period === selectedPeriod) {
      selectedPeriodTimeSeries = timeSeries;
    }
  }

  const bestSma = smaResults.reduce((best, current) => {
    if (current.liquidated) return best;
    if (best.liquidated) return current;
    return current.annualizedReturn > best.annualizedReturn ? current : best;
  }, smaResults[0]);

  const dateRange = {
    start: tradingPricePoints[0].date,
    end: tradingPricePoints[tradingPricePoints.length - 1].date,
    days: tradingPricePoints.length,
  };

  return {
    params,
    hodl,
    smaResults,
    bestSma,
    dateRange,
    selectedPeriodTimeSeries,
  };
}

export function runSingleSmaBacktest(
  pricePoints: PricePoint[],
  params: BacktestParams,
  smaPeriod: number
): { result: SmaResult; timeSeries: DetailedDailyState[]; hodl: ReturnType<typeof calculateHodl> } {
  const smaMap = calculateAllSmas(pricePoints, smaPeriod, smaPeriod);
  const smaValues = smaMap.get(smaPeriod)!;

  const closePrices = pricePoints.map((p) => p.closePrice);
  const atrValues = calculateAtr(closePrices, params.atrPeriod);

  const startIndex = WARMUP_DAYS - 1;
  const tradingPricePoints = pricePoints.slice(startIndex);
  const tradingSmaValues = smaValues.slice(startIndex);
  const tradingAtrValues = atrValues.slice(startIndex);

  const { result, timeSeries } = simulateStrategy(
    tradingPricePoints,
    tradingSmaValues,
    tradingAtrValues,
    {
      initialCapital: params.initialCapital,
      exchangeFeePercent: params.exchangeFeePercent,
      gasFeePerTrade: params.gasFeePerTrade,
      buyOnLong: params.buyOnLong,
      shortOnShort: params.shortOnShort,
      longLeverage: params.longLeverage,
      shortLeverage: params.shortLeverage,
      atrMultiplier: params.atrMultiplier,
      atrPeriod: params.atrPeriod,
    }
  );

  result.period = smaPeriod;

  const hodl = calculateHodl(tradingPricePoints, params.initialCapital);

  return { result, timeSeries, hodl };
}
