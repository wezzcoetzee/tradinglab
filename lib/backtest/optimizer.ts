import type { CsvRow, StrategyConfig } from '../types';
import type { BacktestConfig, BacktestResult, BacktestResultSummary, BuyAndHoldBaseline } from './types';

import { calculateAllATRs } from './atr-calculator';
import { runBacktest } from './backtest-runner';
import { calculateBuyAndHoldBaseline } from './baseline-calculator';
import { TOP_K_RESULTS, WORKER_PROGRESS_INTERVAL } from './constants';
import { generateBacktestConfigs } from './leverage-config';
import { compareResults, tallyResult, type OptimizationStats } from './ranking';
import { calculateAllSMAs, extractClosePrices } from './sma-calculator';
import { TopKHeap } from './top-k-heap';

export interface OptimizationOutcome {
  results: BacktestResultSummary[];
  bestResultWithDays: BacktestResult | null;
  baseline: BuyAndHoldBaseline | null;
  stats: OptimizationStats;
  isTruncated: boolean;
}

/**
 * Backtests every SMA × leverage (× ATR) combination. Stats cover every config,
 * while `results` is capped at the top `TOP_K_RESULTS` survivors when ATR is enabled.
 */
export function runOptimization(
  csvData: CsvRow[],
  strategyConfig: StrategyConfig,
  onProgress?: (current: number, total: number) => void
): OptimizationOutcome {
  const { startingCapital, tradingFee, atrEnabled, smaMin, smaMax } = strategyConfig;
  const allSMAs = calculateAllSMAs(extractClosePrices(csvData), smaMin, smaMax);
  const allATRs = atrEnabled ? calculateAllATRs(csvData) : null;
  const configs = generateBacktestConfigs(startingCapital, tradingFee, atrEnabled, smaMin, smaMax);

  const run = (config: BacktestConfig, summaryOnly: boolean) => {
    const smaValues = allSMAs.get(config.smaPeriod);
    if (!smaValues) {
      throw new Error(`SMA values not found for period ${config.smaPeriod}`);
    }
    const atrValues = config.atr && allATRs ? allATRs.get(config.atr.period) ?? null : null;
    return runBacktest(csvData, smaValues, config, atrValues, summaryOnly);
  };

  const topK = atrEnabled ? new TopKHeap(TOP_K_RESULTS) : null;
  const allResults: BacktestResultSummary[] = [];
  const stats: OptimizationStats = { total: 0, profitable: 0, liquidated: 0 };

  configs.forEach((config, i) => {
    const { days: _days, ...summary } = run(config, true);
    tallyResult(stats, summary);

    if (topK) {
      topK.insert(summary);
    } else {
      allResults.push(summary);
    }

    if ((i + 1) % WORKER_PROGRESS_INTERVAL === 0 || i === configs.length - 1) {
      onProgress?.(i + 1, configs.length);
    }
  });

  const results = topK ? topK.getResults() : allResults.sort(compareResults);
  const best = results.find((r) => !r.isLiquidated);

  return {
    results,
    bestResultWithDays: best ? run(best.config, false) : null,
    baseline: calculateBuyAndHoldBaseline(csvData, startingCapital),
    stats,
    isTruncated: atrEnabled,
  };
}
