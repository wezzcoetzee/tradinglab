import type { BacktestFormData } from "@/components/backtest";

export const DEFAULT_BACKTEST_VALUES: BacktestFormData = {
  initialCapital: 1000,
  exchangeFeePercent: 0,
  smaMin: 2,
  smaMax: 200,
  buyOnLong: true,
  shortOnShort: true,
  optimizeLeverage: true,
};
