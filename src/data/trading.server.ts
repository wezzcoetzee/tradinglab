import { createServerFn } from "@tanstack/react-start";
import { db } from "../lib/db";
import type { PricePoint, StrategyParams, StrategyResult, OptimizationResult } from "../lib/types/trading";
import {
  generateSignals,
  calculateHODLReturns,
  calculateStrategyReturns,
  calculateAnnualizedReturn,
  calculateMaxDrawdown,
  runOptimization,
} from "../lib/calculations";

export const getPriceData = createServerFn({
  method: "GET",
}).handler(async (): Promise<PricePoint[]> => {
  const data = await db.priceData.findMany({
    orderBy: { unixTimestamp: "asc" },
  });

  return data.map((row) => ({
    unixTimestamp: Number(row.unixTimestamp),
    date: row.date,
    closePrice: Number(row.closePrice),
  }));
});

export const getStrategyConfig = createServerFn({
  method: "GET",
}).handler(async (): Promise<StrategyParams> => {
  const config = await db.strategyConfig.findUnique({
    where: { name: "default" },
  });

  if (!config) {
    return {
      maDuration: 44,
      buyOnLongSignal: true,
      shortOnShort: false,
      longLeverage: 2.25,
      shortLeverage: 1.0,
      initialCapital: 1000,
      gasFeePerTrade: 0,
      exchangeFee: 0.0005,
    };
  }

  return {
    maDuration: config.maDuration,
    buyOnLongSignal: config.buyOnLongSignal,
    shortOnShort: config.shortOnShort,
    longLeverage: Number(config.longLeverage),
    shortLeverage: Number(config.shortLeverage),
    initialCapital: Number(config.initialCapital),
    gasFeePerTrade: Number(config.gasFeePerTrade),
    exchangeFee: Number(config.exchangeFee),
  };
});

export const calculateStrategy = createServerFn({ method: "POST" })
  .inputValidator((params: StrategyParams) => params)
  .handler(async ({ data: params }): Promise<StrategyResult> => {
    const priceData = await getPriceData();
    const dataPoints = generateSignals(priceData, params.maDuration);

    const hodlReturns = calculateHODLReturns(dataPoints);
    const smaResult = calculateStrategyReturns(dataPoints, params, "sma");
    const emaResult = calculateStrategyReturns(dataPoints, params, "ema");

    const totalDays = priceData.length;
    const hodlFinal = hodlReturns[hodlReturns.length - 1] ?? 1;
    const smaFinal = smaResult.returns[smaResult.returns.length - 1] ?? 1;
    const emaFinal = emaResult.returns[emaResult.returns.length - 1] ?? 1;

    return {
      dataPoints,
      hodlReturns,
      smaReturns: smaResult.returns,
      emaReturns: emaResult.returns,
      hodlAnnualized: calculateAnnualizedReturn(hodlFinal, 1, totalDays),
      smaAnnualized: calculateAnnualizedReturn(smaFinal, 1, totalDays),
      emaAnnualized: calculateAnnualizedReturn(emaFinal, 1, totalDays),
      hodlMaxDrawdown: calculateMaxDrawdown(hodlReturns),
      smaMaxDrawdown: calculateMaxDrawdown(smaResult.returns),
      emaMaxDrawdown: calculateMaxDrawdown(emaResult.returns),
      smaTrades: smaResult.trades,
      emaTrades: emaResult.trades,
      totalDays,
    };
  });

interface OptimizationParams {
  baseParams: Omit<StrategyParams, "maDuration">;
  minPeriod?: number;
  maxPeriod?: number;
}

export const getOptimizationData = createServerFn({ method: "POST" })
  .inputValidator((params: OptimizationParams) => params)
  .handler(async ({ data }): Promise<OptimizationResult[]> => {
    const priceData = await getPriceData();
    return runOptimization(
      priceData,
      data.baseParams,
      data.minPeriod ?? 5,
      data.maxPeriod ?? 200
    );
  });

export const saveStrategyConfig = createServerFn({ method: "POST" })
  .inputValidator((config: StrategyParams) => config)
  .handler(async ({ data: config }): Promise<StrategyParams> => {
    await db.strategyConfig.upsert({
      where: { name: "default" },
      update: {
        maDuration: config.maDuration,
        buyOnLongSignal: config.buyOnLongSignal,
        shortOnShort: config.shortOnShort,
        longLeverage: config.longLeverage,
        shortLeverage: config.shortLeverage,
        initialCapital: config.initialCapital,
        gasFeePerTrade: config.gasFeePerTrade,
        exchangeFee: config.exchangeFee,
      },
      create: {
        name: "default",
        maDuration: config.maDuration,
        buyOnLongSignal: config.buyOnLongSignal,
        shortOnShort: config.shortOnShort,
        longLeverage: config.longLeverage,
        shortLeverage: config.shortLeverage,
        initialCapital: config.initialCapital,
        gasFeePerTrade: config.gasFeePerTrade,
        exchangeFee: config.exchangeFee,
      },
    });

    return config;
  });
