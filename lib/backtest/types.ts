import type { CsvRow, StrategyConfig } from '../types';

export type PositionType = 'NONE' | 'LONG' | 'SHORT';

export type PositionAction =
  | 'OPEN_LONG'
  | 'OPEN_SHORT'
  | 'CLOSE_LONG'
  | 'CLOSE_SHORT'
  | 'TRANSITION_LONG_TO_SHORT'
  | 'TRANSITION_SHORT_TO_LONG'
  | 'HOLD';

export interface Position {
  type: PositionType;
  entryPrice: number;
  entryValue: number;
  leverage: number;
}

export interface DayResult {
  dayIndex: number;
  date: string;
  price: number;
  sma: number;
  action: PositionAction;
  position: Position | null;
  balance: number;
  pnl: number;
  fees: number;
  isLiquidated: boolean;
}

export interface BacktestConfig {
  smaPeriod: number;
  longLeverage: number;
  shortLeverage: number;
  startingCapital: number;
  feeRate: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  days: DayResult[];
  finalBalance: number;
  totalReturn: number;
  totalFees: number;
  totalTrades: number;
  isLiquidated: boolean;
  liquidationDay?: number;
}

export interface BacktestBatchInput {
  csvData: CsvRow[];
  strategyConfig: StrategyConfig;
}

export interface BacktestBatchResult {
  results: BacktestResult[];
  totalConfigurations: number;
  executionTimeMs: number;
}
