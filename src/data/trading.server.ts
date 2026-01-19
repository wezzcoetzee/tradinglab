import { createServerFn } from "@tanstack/react-start";
import { db } from "../lib/db";
import type { PricePoint, StrategyParams, StrategyResult, OptimizationResult, SavedOptimizationResult } from "../lib/types/trading";
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
      signalThreshold: 0,
      simulationStartDate: undefined,
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
    signalThreshold: Number(config.signalThreshold),
    simulationStartDate: config.simulationStartDate ? Number(config.simulationStartDate) : undefined,
  };
});

export const calculateStrategy = createServerFn({ method: "POST" })
  .inputValidator((params: StrategyParams) => params)
  .handler(async ({ data: params }): Promise<StrategyResult> => {
    const priceData = await getPriceData();
    const dataPoints = generateSignals(priceData, params.maDuration, params.signalThreshold);

    let simulationStartIndex = params.maDuration - 1;
    if (params.simulationStartDate) {
      const dateIndex = dataPoints.findIndex(
        (p) => p.unixTimestamp >= params.simulationStartDate!
      );
      if (dateIndex !== -1) {
        simulationStartIndex = Math.max(simulationStartIndex, dateIndex);
      }
    }

    const hodlReturns = calculateHODLReturns(dataPoints, simulationStartIndex);
    const smaResult = calculateStrategyReturns(dataPoints, params, simulationStartIndex);

    const simulationDataPoints = dataPoints.slice(simulationStartIndex);
    const totalDays = simulationDataPoints.length;
    const hodlFinal = hodlReturns[hodlReturns.length - 1] ?? 1;
    const smaFinal = smaResult.returns[smaResult.returns.length - 1] ?? 1;

    return {
      dataPoints: simulationDataPoints,
      hodlReturns,
      smaReturns: smaResult.returns,
      hodlAnnualized: calculateAnnualizedReturn(hodlFinal, 1, totalDays),
      smaAnnualized: calculateAnnualizedReturn(smaFinal, 1, totalDays),
      hodlMaxDrawdown: calculateMaxDrawdown(hodlReturns),
      smaMaxDrawdown: calculateMaxDrawdown(smaResult.returns),
      smaTrades: smaResult.trades,
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
        signalThreshold: config.signalThreshold,
        simulationStartDate: config.simulationStartDate ?? null,
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
        signalThreshold: config.signalThreshold,
        simulationStartDate: config.simulationStartDate ?? null,
      },
    });

    return config;
  });

interface SaveOptimizationInput {
  name: string;
  bestSmaPeriod: number;
  smaAnnualized: number;
  smaMaxDrawdown: number;
  params: Omit<StrategyParams, "maDuration">;
}

export const saveOptimizationResult = createServerFn({ method: "POST" })
  .inputValidator((input: SaveOptimizationInput) => input)
  .handler(async ({ data }): Promise<SavedOptimizationResult> => {
    const result = await db.savedOptimizationResult.upsert({
      where: { name: data.name },
      update: {
        bestSmaPeriod: data.bestSmaPeriod,
        smaAnnualized: data.smaAnnualized,
        smaMaxDrawdown: data.smaMaxDrawdown,
        params: data.params,
        calculatedAt: new Date(),
      },
      create: {
        name: data.name,
        bestSmaPeriod: data.bestSmaPeriod,
        smaAnnualized: data.smaAnnualized,
        smaMaxDrawdown: data.smaMaxDrawdown,
        params: data.params,
      },
    });

    return {
      id: result.id,
      name: result.name,
      bestSmaPeriod: result.bestSmaPeriod,
      smaAnnualized: Number(result.smaAnnualized),
      smaMaxDrawdown: Number(result.smaMaxDrawdown),
      calculatedAt: result.calculatedAt,
      params: result.params as Omit<StrategyParams, "maDuration">,
    };
  });

export const getSavedOptimizationResults = createServerFn({
  method: "GET",
}).handler(async (): Promise<SavedOptimizationResult[]> => {
  const results = await db.savedOptimizationResult.findMany({
    orderBy: { calculatedAt: "desc" },
  });

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    bestSmaPeriod: r.bestSmaPeriod,
    smaAnnualized: Number(r.smaAnnualized),
    smaMaxDrawdown: Number(r.smaMaxDrawdown),
    calculatedAt: r.calculatedAt,
    params: r.params as Omit<StrategyParams, "maDuration">,
  }));
});
