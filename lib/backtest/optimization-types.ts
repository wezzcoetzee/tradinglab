import type { CsvRow } from '../types';
import type { BacktestConfig, BacktestResult, BuyAndHoldBaseline } from './types';

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
}

export type WorkerMessage =
  | { type: 'progress'; current: number; total: number; elapsedMs: number }
  | { type: 'complete'; results: BacktestResult[]; totalTimeMs: number; baseline: BuyAndHoldBaseline | null }
  | { type: 'error'; error: string };
