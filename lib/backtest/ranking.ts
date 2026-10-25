import type { BacktestResultSummary } from './types';

export interface OptimizationStats {
  total: number;
  profitable: number;
  liquidated: number;
}

/** Surviving configs first, then highest return. */
export function compareResults(a: BacktestResultSummary, b: BacktestResultSummary): number {
  if (a.isLiquidated !== b.isLiquidated) return a.isLiquidated ? 1 : -1;
  return b.totalReturn - a.totalReturn;
}

export function tallyResult(stats: OptimizationStats, result: BacktestResultSummary): void {
  stats.total++;
  if (result.isLiquidated) stats.liquidated++;
  else if (result.totalReturn > 0) stats.profitable++;
}

export function summarizeResults(results: BacktestResultSummary[]): OptimizationStats {
  const stats: OptimizationStats = { total: 0, profitable: 0, liquidated: 0 };
  for (const result of results) tallyResult(stats, result);
  return stats;
}
