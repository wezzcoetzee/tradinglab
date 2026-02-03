import type { BacktestConfig } from './types';

const LEVERAGE_VALUES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0] as const;
const MIN_SMA_PERIOD = 20;
const MAX_SMA_PERIOD = 160;

export function generateBacktestConfigs(
  startingCapital: number,
  feeRate: number
): BacktestConfig[] {
  const configs: BacktestConfig[] = [];

  for (let smaPeriod = MIN_SMA_PERIOD; smaPeriod <= MAX_SMA_PERIOD; smaPeriod++) {
    for (const longLeverage of LEVERAGE_VALUES) {
      for (const shortLeverage of LEVERAGE_VALUES) {
        configs.push({
          smaPeriod,
          longLeverage,
          shortLeverage,
          startingCapital,
          feeRate,
        });
      }
    }
  }

  return configs;
}
