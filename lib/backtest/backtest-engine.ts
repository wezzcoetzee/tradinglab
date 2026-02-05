import type { BacktestBatchInput, BacktestBatchResult, BacktestResult } from './types';

import { calculateAllATRs } from './atr-calculator';
import { calculateBuyAndHoldBaseline } from './baseline-calculator';
import { runBacktest } from './backtest-runner';
import { generateBacktestConfigs } from './leverage-config';
import { calculateAllSMAs, extractClosePrices } from './sma-calculator';

export function runAllBacktests(input: BacktestBatchInput): BacktestBatchResult {
  const startTime = performance.now();

  const closePrices = extractClosePrices(input.csvData);
  const allSMAs = calculateAllSMAs(
    closePrices,
    input.strategyConfig.smaMin,
    input.strategyConfig.smaMax
  );

  const allATRs = input.strategyConfig.atrEnabled
    ? calculateAllATRs(input.csvData)
    : null;

  const configs = generateBacktestConfigs(
    input.strategyConfig.startingCapital,
    input.strategyConfig.tradingFee,
    input.strategyConfig.atrEnabled,
    input.strategyConfig.smaMin,
    input.strategyConfig.smaMax
  );

  const results: BacktestResult[] = [];

  for (const config of configs) {
    const smaValues = allSMAs.get(config.smaPeriod);
    if (!smaValues) {
      throw new Error(`SMA values not found for period ${config.smaPeriod}`);
    }

    const atrValues = config.atr && allATRs ? allATRs.get(config.atr.period) ?? null : null;

    const result = runBacktest(input.csvData, smaValues, config, atrValues);
    results.push(result);
  }

  const buyAndHoldBaseline = calculateBuyAndHoldBaseline(
    input.csvData,
    input.strategyConfig.startingCapital
  );

  const executionTimeMs = performance.now() - startTime;

  return {
    results,
    totalConfigurations: configs.length,
    executionTimeMs,
    buyAndHoldBaseline,
  };
}

export function findBestResult(results: BacktestResult[]): BacktestResult | null {
  const validResults = results.filter(r => !r.isLiquidated);

  if (validResults.length === 0) {
    return null;
  }

  return validResults.reduce((best, current) =>
    current.totalReturn > best.totalReturn ? current : best
  );
}
