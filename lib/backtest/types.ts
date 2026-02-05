import type { CsvRow, StrategyConfig } from '../types';

export type PositionType = 'NONE' | 'LONG' | 'SHORT';

export type PositionAction =
  | 'OPEN_LONG'
  | 'OPEN_SHORT'
  | 'CLOSE_LONG'
  | 'CLOSE_SHORT'
  | 'TRANSITION_LONG_TO_SHORT'
  | 'TRANSITION_SHORT_TO_LONG'
  | 'HOLD'
  | 'ATR_PARTIAL_CLOSE';

export interface TrailingStopState {
  extremePrice: number;
  triggered: boolean;
}

export interface Position {
  type: PositionType;
  entryPrice: number;
  entryValue: number;
  leverage: number;
  trailingStop?: TrailingStopState;
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
  sidelineValue?: number;
}

export interface AtrConfig {
  period: 10 | 14 | 20;
  multiplier: 2 | 2.5 | 3 | 3.5 | 4;
  closePercent: 10 | 25 | 50 | 100;
}

export interface BacktestConfig {
  smaPeriod: number;
  longLeverage: number;
  shortLeverage: number;
  startingCapital: number;
  feeRate: number;
  atr?: AtrConfig;
}

export interface BacktestResult {
  config: BacktestConfig;
  days: DayResult[];
  finalBalance: number;
  totalReturn: number;
  totalFees: number;
  totalTrades: number;
  atrTriggerCount: number;
  isLiquidated: boolean;
  liquidationDay?: number;
  liquidationDate?: string;
}

export type BacktestResultSummary = Omit<BacktestResult, 'days'>;

export interface BacktestBatchInput {
  csvData: CsvRow[];
  strategyConfig: StrategyConfig;
}

export interface BuyAndHoldBaseline {
  purchasePrice: number;
  purchaseDate: string;
  finalPrice: number;
  finalDate: string;
  finalValue: number;
  percentGain: number;
  startingCapital: number;
}

export interface BacktestBatchResult {
  results: BacktestResult[];
  totalConfigurations: number;
  executionTimeMs: number;
  buyAndHoldBaseline: BuyAndHoldBaseline | null;
}
