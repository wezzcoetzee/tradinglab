export interface PricePoint {
  date: Date;
  closePrice: number;
}

export interface BacktestParams {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade: number;
  smaMin: number;
  smaMax: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  longLeverage: number;
  shortLeverage: number;
  trailingStop?: TrailingStopConfig;
}

export type Position = "LONG" | "SHORT" | "NONE";

export interface DailyState {
  date: Date;
  closePrice: number;
  sma: number | null;
  signal: Position;
  portfolioValue: number;
  hodlValue: number;
  drawdown: number;
  hodlDrawdown: number;
}

export interface SmaResult {
  period: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  finalValue: number;
  trades: number;
  liquidated: boolean;
  trailingStopTriggers?: number;
  tradeAuditTrail?: TradeAuditEntry[];
}

export interface BacktestResult {
  params: BacktestParams;
  hodl: {
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    finalValue: number;
  };
  smaResults: SmaResult[];
  bestSma: SmaResult;
  dateRange: {
    start: Date;
    end: Date;
    days: number;
  };
}

export interface PortfolioTimeSeries {
  date: Date;
  smaValue: number;
  hodlValue: number;
}

export type TradeAction =
  | "ENTER_LONG"
  | "EXIT_LONG"
  | "ENTER_SHORT"
  | "EXIT_SHORT"
  | "PARTIAL_CLOSE_LONG"
  | "PARTIAL_CLOSE_SHORT"
  | "STOP_EXIT_LONG"
  | "STOP_EXIT_SHORT";

export interface TrailingStopConfig {
  enabled: boolean;
  atrPeriod: number;
  atrMultiplier: number;
  partialClosePercent: number;
}

export interface TradeAuditEntry {
  date: Date;
  action: TradeAction;
  price: number;
  quantity: number;
  value: number;
  fee: number;
  pnl: number;
  pnlPercent: number;
  stopPrice: number | null;
  atr: number | null;
  positionSizeRemaining: number;
}

export interface DetailedDailyState {
  date: Date;
  closePrice: number;
  sma: number | null;
  signal: Position;
  portfolioValue: number;
  hodlValue: number;
  drawdown: number;
  hodlDrawdown: number;
  tradeAction?: TradeAction;
  atr?: number | null;
  trailingStopPrice?: number | null;
  tradeAudit?: TradeAuditEntry;
}
