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
  atrPeriod?: 10 | 14 | 20;
  atrMultiplier?: 2 | 2.5 | 3 | 3.5 | 4;
  atrClosePercent?: 10 | 25 | 50 | 100;
}

export interface StrategyConfigValidation {
  valid: boolean;
  error?: string;
  data?: StrategyConfig;
}

export const REQUIRED_HEADERS = ['time', 'high', 'low', 'close', 'RSI', 'date'] as const;
export const MIN_DATA_ROWS = 160;

export const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  startingCapital: 10000,
  tradingFee: 0.1,
  atrEnabled: false,
};

export const ATR_PERIOD_OPTIONS = [10, 14, 20] as const;
export const ATR_MULTIPLIER_OPTIONS = [2, 2.5, 3, 3.5, 4] as const;
export const ATR_CLOSE_PERCENT_OPTIONS = [10, 25, 50, 100] as const;
