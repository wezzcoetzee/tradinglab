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

    let simulationStartIndex = 0;
    if (params.simulationStartDate) {
      simulationStartIndex = dataPoints.findIndex(
        (p) => p.unixTimestamp >= params.simulationStartDate!
      );
      if (simulationStartIndex === -1) simulationStartIndex = 0;
    }

    const hodlReturns = calculateHODLReturns(dataPoints, simulationStartIndex);
    const smaResult = calculateStrategyReturns(dataPoints, params, "sma", simulationStartIndex);
    const emaResult = calculateStrategyReturns(dataPoints, params, "ema", simulationStartIndex);

    const simulationDataPoints = dataPoints.slice(simulationStartIndex);
    const totalDays = simulationDataPoints.length;
    const hodlFinal = hodlReturns[hodlReturns.length - 1] ?? 1;
    const smaFinal = smaResult.returns[smaResult.returns.length - 1] ?? 1;
    const emaFinal = emaResult.returns[emaResult.returns.length - 1] ?? 1;

    return {
      dataPoints: simulationDataPoints,
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

export const getPriceDataRange = createServerFn({
  method: "GET",
}).handler(async (): Promise<{ minTimestamp: number; maxTimestamp: number }> => {
  const [minResult, maxResult] = await Promise.all([
    db.priceData.findFirst({
      orderBy: { unixTimestamp: "asc" },
      select: { unixTimestamp: true },
    }),
    db.priceData.findFirst({
      orderBy: { unixTimestamp: "desc" },
      select: { unixTimestamp: true },
    }),
  ]);

  return {
    minTimestamp: minResult ? Number(minResult.unixTimestamp) : 0,
    maxTimestamp: maxResult ? Number(maxResult.unixTimestamp) : Date.now(),
  };
});

interface SaveOptimizationInput {
  name: string;
  bestSmaPeriod: number;
  bestEmaPeriod: number;
  smaAnnualized: number;
  emaAnnualized: number;
  smaMaxDrawdown: number;
  emaMaxDrawdown: number;
  params: Omit<StrategyParams, "maDuration">;
}

export const saveOptimizationResult = createServerFn({ method: "POST" })
  .inputValidator((input: SaveOptimizationInput) => input)
  .handler(async ({ data }): Promise<SavedOptimizationResult> => {
    const result = await db.savedOptimizationResult.upsert({
      where: { name: data.name },
      update: {
        bestSmaPeriod: data.bestSmaPeriod,
        bestEmaPeriod: data.bestEmaPeriod,
        smaAnnualized: data.smaAnnualized,
        emaAnnualized: data.emaAnnualized,
        smaMaxDrawdown: data.smaMaxDrawdown,
        emaMaxDrawdown: data.emaMaxDrawdown,
        params: data.params,
        calculatedAt: new Date(),
      },
      create: {
        name: data.name,
        bestSmaPeriod: data.bestSmaPeriod,
        bestEmaPeriod: data.bestEmaPeriod,
        smaAnnualized: data.smaAnnualized,
        emaAnnualized: data.emaAnnualized,
        smaMaxDrawdown: data.smaMaxDrawdown,
        emaMaxDrawdown: data.emaMaxDrawdown,
        params: data.params,
      },
    });

    return {
      id: result.id,
      name: result.name,
      bestSmaPeriod: result.bestSmaPeriod,
      bestEmaPeriod: result.bestEmaPeriod,
      smaAnnualized: Number(result.smaAnnualized),
      emaAnnualized: Number(result.emaAnnualized),
      smaMaxDrawdown: Number(result.smaMaxDrawdown),
      emaMaxDrawdown: Number(result.emaMaxDrawdown),
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
    bestEmaPeriod: r.bestEmaPeriod,
    smaAnnualized: Number(r.smaAnnualized),
    emaAnnualized: Number(r.emaAnnualized),
    smaMaxDrawdown: Number(r.smaMaxDrawdown),
    emaMaxDrawdown: Number(r.emaMaxDrawdown),
    calculatedAt: r.calculatedAt,
    params: r.params as Omit<StrategyParams, "maDuration">,
  }));
});
