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
  smaSignal: Signal;
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
  hodlAnnualized: number;
  smaAnnualized: number;
  hodlMaxDrawdown: number;
  smaMaxDrawdown: number;
  smaTrades: TradeRecord[];
  totalDays: number;
}

export interface OptimizationResult {
  maDuration: number;
  smaAnnualized: number;
  smaMaxDrawdown: number;
  smaTrades: number;
  hodlAnnualized: number;
}

export interface SavedOptimizationResult {
  id: number;
  name: string;
  bestSmaPeriod: number;
  smaAnnualized: number;
  smaMaxDrawdown: number;
  calculatedAt: Date;
  params: Omit<StrategyParams, "maDuration">;
}
