import type { CsvRow } from '../types';
import type { BacktestConfig, BacktestResultSummary, BuyAndHoldBaseline } from './types';

export interface OptimizationProgress {
  status: 'idle' | 'preparing' | 'running' | 'complete' | 'error';
  current: number;
  total: number;
  percentComplete: number;
  elapsedMs: number;
  estimatedRemainingMs: number | null;
  configsPerSecond: number;
  errorMessage?: string;
}

export interface WorkerInput {
  csvData: CsvRow[];
  allSMAs: [number, number[]][];
  allATRs: [10 | 14 | 20, number[]][] | null;
  configs: BacktestConfig[];
  startingCapital: number;
  atrEnabled: boolean;
}

export type WorkerMessage =
  | { type: 'progress'; current: number; total: number; elapsedMs: number }
  | { type: 'complete'; results: BacktestResultSummary[]; totalConfigs: number; totalTimeMs: number; baseline: BuyAndHoldBaseline | null; isTruncated: boolean }
  | { type: 'error'; error: string };
