import { WARMUP_DAYS } from './backtest/constants';

export interface CsvRow {
  high: number;
  low: number;
  close: number;
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

export const REQUIRED_HEADERS = ['high', 'low', 'close', 'date'] as const;
// The backtest starts trading on the first row after the warmup window.
export const MIN_DATA_ROWS = WARMUP_DAYS + 1;

export const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  startingCapital: 1000,
  tradingFee: 0.05,
  atrEnabled: false,
  smaMin: 2,
  smaMax: 200,
};
