import type { CsvRow, StrategyConfig } from '../types';
import type { OptimizationOutcome } from './optimizer';

export interface OptimizationProgress {
  status: 'idle' | 'running' | 'complete' | 'error';
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
  strategyConfig: StrategyConfig;
}

export type WorkerMessage =
  | { type: 'progress'; current: number; total: number; elapsedMs: number }
  | ({ type: 'complete'; totalTimeMs: number } & OptimizationOutcome)
  | { type: 'error'; error: string };
