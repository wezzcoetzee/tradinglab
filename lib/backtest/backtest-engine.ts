import type { BacktestBatchInput, BacktestBatchResult, BacktestResult } from './types';

import { runBacktest } from './backtest-runner';
import { generateBacktestConfigs } from './leverage-config';
import { calculateAllSMAs, extractClosePrices } from './sma-calculator';

export function runAllBacktests(input: BacktestBatchInput): BacktestBatchResult {
  const startTime = performance.now();

  const closePrices = extractClosePrices(input.csvData);
  const allSMAs = calculateAllSMAs(closePrices);

  const configs = generateBacktestConfigs(
    input.strategyConfig.startingCapital,
    input.strategyConfig.tradingFee
  );

  const results: BacktestResult[] = [];

  for (const config of configs) {
    const smaValues = allSMAs.get(config.smaPeriod);
    if (!smaValues) {
      throw new Error(`SMA values not found for period ${config.smaPeriod}`);
    }

    const result = runBacktest(input.csvData, smaValues, config);
    results.push(result);
  }

  const executionTimeMs = performance.now() - startTime;

  return {
    results,
    totalConfigurations: configs.length,
    executionTimeMs,
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
