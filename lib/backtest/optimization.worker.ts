import type { WorkerInput, WorkerMessage } from './optimization-types';
import type { BacktestResult, BacktestResultSummary } from './types';

import { calculateBuyAndHoldBaseline } from './baseline-calculator';
import { runBacktest } from './backtest-runner';
import { WORKER_PROGRESS_INTERVAL } from './constants';

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const { csvData, allSMAs, allATRs, configs, startingCapital } = event.data;
  const startTime = performance.now();

  const smaMap = new Map(allSMAs);
  const atrMap = allATRs ? new Map(allATRs) : null;

  const results: BacktestResult[] = [];
  const total = configs.length;

  try {
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];

      const smaValues = smaMap.get(config.smaPeriod);
      if (!smaValues) {
        throw new Error(`SMA values not found for period ${config.smaPeriod}`);
      }

      const atrValues = config.atr && atrMap ? atrMap.get(config.atr.period) ?? null : null;

      const result = runBacktest(csvData, smaValues, config, atrValues);
      results.push(result);

      if ((i + 1) % WORKER_PROGRESS_INTERVAL === 0 || i === configs.length - 1) {
        const message: WorkerMessage = {
          type: 'progress',
          current: i + 1,
          total,
          elapsedMs: performance.now() - startTime,
        };
        self.postMessage(message);
      }
    }

    const baseline = calculateBuyAndHoldBaseline(csvData, startingCapital);
    const totalTimeMs = performance.now() - startTime;

    const summaries: BacktestResultSummary[] = results.map(
      ({ days: _days, ...summary }) => summary
    );

    const completeMessage: WorkerMessage = {
      type: 'complete',
      results: summaries,
      totalTimeMs,
      baseline,
    };
    self.postMessage(completeMessage);
  } catch (error) {
    const errorMessage: WorkerMessage = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
    self.postMessage(errorMessage);
  }
};
