import type { AtrConfig, BacktestConfig } from './types';

import { ATR_PERIODS, MAX_SMA_PERIOD, MIN_SMA_PERIOD } from './constants';

const LEVERAGE_VALUES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0] as const;
const ATR_MULTIPLIERS = [2, 2.5, 3, 3.5, 4] as const;
const ATR_CLOSE_PERCENTS = [10, 25, 50, 100] as const;

function generateAtrConfigs(): AtrConfig[] {
  const configs: AtrConfig[] = [];

  for (const period of ATR_PERIODS) {
    for (const multiplier of ATR_MULTIPLIERS) {
      for (const closePercent of ATR_CLOSE_PERCENTS) {
        configs.push({ period, multiplier, closePercent });
      }
    }
  }

  return configs;
}

export function generateBacktestConfigs(
  startingCapital: number,
  feeRate: number,
  atrEnabled: boolean = false
): BacktestConfig[] {
  const configs: BacktestConfig[] = [];
  const atrConfigs: (AtrConfig | undefined)[] = atrEnabled ? generateAtrConfigs() : [undefined];

  for (let smaPeriod = MIN_SMA_PERIOD; smaPeriod <= MAX_SMA_PERIOD; smaPeriod++) {
    for (const longLeverage of LEVERAGE_VALUES) {
      for (const shortLeverage of LEVERAGE_VALUES) {
        for (const atr of atrConfigs) {
          configs.push({
            smaPeriod,
            longLeverage,
            shortLeverage,
            startingCapital,
            feeRate,
            atr,
          });
        }
      }
    }
  }

  return configs;
}
