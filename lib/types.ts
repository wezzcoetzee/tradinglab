export interface CsvRow {
  time: number;
  high: number;
  low: number;
  close: number;
  RSI: number;
  date: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: CsvRow[];
  rowCount?: number;
}

export interface StrategyConfig {
  startingCapital: number;
  tradingFee: number;
  atrEnabled: boolean;
  smaMin: number;
  smaMax: number;
}

export interface StrategyConfigValidation {
  valid: boolean;
  error?: string;
  data?: StrategyConfig;
}

import { WARMUP_DAYS } from './backtest/constants';

export const REQUIRED_HEADERS = ['time', 'high', 'low', 'close', 'RSI', 'date'] as const;
export const MIN_DATA_ROWS = WARMUP_DAYS;

export const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  startingCapital: 1000,
  tradingFee: 0.05,
  atrEnabled: false,
  smaMin: 20,
  smaMax: 160,
};
