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
}

export type Signal = 1 | 0;

export interface MaResult {
  period: number;
  totalReturn: number;
  finalValue: number;
  trades: number;
}

export interface BacktestResult {
  params: BacktestParams;
  hodl: {
    totalReturn: number;
    finalValue: number;
  };
  smaResults: MaResult[];
  emaResults: MaResult[];
  bestSma: MaResult;
  bestEma: MaResult;
  dateRange: {
    start: Date;
    end: Date;
    days: number;
  };
}

export interface DailyData {
  day: number;
  date: Date;
  closePrice: number;
  sma: number | null;
  ema: number | null;
  smaSignal: Signal;
  emaSignal: Signal;
  hodlValue: number;
  smaBalance: number;
  emaBalance: number;
}

export interface DetailedBacktestResult extends BacktestResult {
  dailyData?: DailyData[];
}
