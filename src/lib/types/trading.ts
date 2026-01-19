export interface PricePoint {
  unixTimestamp: number;
  date: Date;
  closePrice: number;
}

export interface StrategyParams {
  maDuration: number;
  buyOnLongSignal: boolean;
  shortOnShort: boolean;
  longLeverage: number;
  shortLeverage: number;
  initialCapital: number;
  gasFeePerTrade: number;
  exchangeFee: number;
  signalThreshold: number;
  simulationStartDate?: number;
}

export type Signal = "long" | "short" | "neutral";

export interface DataPointWithIndicators extends PricePoint {
  sma?: number;
  ema?: number;
  smaSignal: Signal;
  emaSignal: Signal;
}

export interface TradeRecord {
  entryTimestamp: number;
  exitTimestamp: number;
  entryPrice: number;
  exitPrice: number;
  position: "long" | "short";
  returnPct: number;
  capitalAfter: number;
}

export interface StrategyResult {
  dataPoints: DataPointWithIndicators[];
  hodlReturns: number[];
  smaReturns: number[];
  emaReturns: number[];
  hodlAnnualized: number;
  smaAnnualized: number;
  emaAnnualized: number;
  hodlMaxDrawdown: number;
  smaMaxDrawdown: number;
  emaMaxDrawdown: number;
  smaTrades: TradeRecord[];
  emaTrades: TradeRecord[];
  totalDays: number;
}

export interface OptimizationResult {
  maDuration: number;
  smaAnnualized: number;
  emaAnnualized: number;
  smaMaxDrawdown: number;
  emaMaxDrawdown: number;
  smaTrades: number;
  emaTrades: number;
}

export interface SavedOptimizationResult {
  id: number;
  name: string;
  bestSmaPeriod: number;
  bestEmaPeriod: number;
  smaAnnualized: number;
  emaAnnualized: number;
  smaMaxDrawdown: number;
  emaMaxDrawdown: number;
  calculatedAt: Date;
  params: Omit<StrategyParams, "maDuration">;
}
