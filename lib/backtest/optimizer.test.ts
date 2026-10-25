import { describe, expect, test } from 'bun:test';

import type { CsvRow, StrategyConfig } from '../types';
import { TOP_K_RESULTS, WARMUP_DAYS } from './constants';
import { runOptimization } from './optimizer';
import { compareResults } from './ranking';

// Trend up with one -40% wick (liquidates the high-leverage longs), crash, then recover.
function generateCsvData(): CsvRow[] {
  const closes = [
    ...Array.from({ length: WARMUP_DAYS }, (_, i) => 100 + i * 0.1),
    ...Array.from({ length: 60 }, (_, i) => 116 + i * 2),
    ...Array.from({ length: 20 }, (_, i) => 236 - i * 8),
    ...Array.from({ length: 60 }, (_, i) => 76 + i * 3),
  ];
  const wickIndex = WARMUP_DAYS + 2;
  return closes.map((close, i) => ({
    high: close * 1.03,
    low: close * (i === wickIndex ? 0.6 : 0.97),
    close,
    date: `${(i % 28) + 1}/1/2024`,
  }));
}

const baseConfig: StrategyConfig = { startingCapital: 1000, tradingFee: 0.05, atrEnabled: false, smaMin: 10, smaMax: 30 };

describe('runOptimization', () => {
  test('should_return_every_config_ranked_with_the_best_replayed_in_full', () => {
    const progress: number[] = [];
    const outcome = runOptimization(generateCsvData(), baseConfig, (current) => progress.push(current));

    const configCount = 21 * 9 * 9;
    expect(outcome.stats.total).toBe(configCount);
    expect(outcome.results).toHaveLength(configCount);
    expect(outcome.isTruncated).toBe(false);
    expect(progress.at(-1)).toBe(configCount);
    expect(outcome.stats.liquidated).toBeGreaterThan(0);
    expect([...outcome.results].sort(compareResults)).toEqual(outcome.results);

    const best = outcome.results[0];
    expect(outcome.bestResultWithDays?.config).toEqual(best.config);
    expect(outcome.bestResultWithDays?.finalBalance).toBe(best.finalBalance);
    expect(outcome.bestResultWithDays?.days.length).toBeGreaterThan(0);
  });

  test('should_count_stats_over_all_configs_when_atr_results_are_truncated', () => {
    const outcome = runOptimization(generateCsvData(), { ...baseConfig, atrEnabled: true });

    expect(outcome.isTruncated).toBe(true);
    expect(outcome.results).toHaveLength(TOP_K_RESULTS);
    expect(outcome.results.every((r) => !r.isLiquidated)).toBe(true);
    expect(outcome.stats.total).toBe(21 * 9 * 9 * 60);
    expect(outcome.stats.liquidated).toBeGreaterThan(0);
  });
});
