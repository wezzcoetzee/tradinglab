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
  atrMultiplier: number;
  atrPeriod: number;
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

export type TradeAction = "ENTER_LONG" | "EXIT_LONG" | "ENTER_SHORT" | "EXIT_SHORT";

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
}
