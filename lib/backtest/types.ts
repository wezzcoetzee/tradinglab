export interface PricePoint {
  date: Date;
  closePrice: number;
}

export interface LeverageConfig {
  long: number;
  short: number;
}

export interface BacktestParams {
  initialCapital: number;
  exchangeFeePercent: number;
  smaMin: number;
  smaMax: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  leverage: LeverageConfig;
  optimizeLeverage: boolean;
}

export type Signal = 1 | 0;

export interface MaResult {
  period: number;
  totalReturn: number;
  finalValue: number;
  trades: number;
  leverage: LeverageConfig;
  liquidated: boolean;
}

export interface BacktestResult {
  params: BacktestParams;
  hodl: {
    totalReturn: number;
    finalValue: number;
  };
  smaResults: MaResult[];
  bestSma: MaResult;
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
  smaSignal: Signal;
  hodlValue: number;
  smaBalance: number;
}

export interface DetailedBacktestResult extends BacktestResult {
  dailyData?: DailyData[];
}
