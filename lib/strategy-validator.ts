import type { StrategyConfig, StrategyConfigValidation } from './types';

const MIN_STARTING_CAPITAL = 100;
const MIN_TRADING_FEE = 0;
const MAX_TRADING_FEE_PERCENT = 100;
const MIN_SMA_PERIOD = 2;

export function validateStrategyConfig(config: StrategyConfig): StrategyConfigValidation {
  if (config.startingCapital <= 0) {
    return {
      valid: false,
      error: 'Starting capital must be greater than 0'
    };
  }

  if (config.startingCapital < MIN_STARTING_CAPITAL) {
    return {
      valid: false,
      error: `Starting capital must be at least $${MIN_STARTING_CAPITAL}`
    };
  }

  if (config.tradingFee < MIN_TRADING_FEE || config.tradingFee > MAX_TRADING_FEE_PERCENT) {
    return {
      valid: false,
      error: `Trading fee must be between ${MIN_TRADING_FEE}% and ${MAX_TRADING_FEE_PERCENT}%`
    };
  }

  if (config.smaMin < MIN_SMA_PERIOD) {
    return {
      valid: false,
      error: `SMA minimum must be at least ${MIN_SMA_PERIOD}`
    };
  }

  if (config.smaMax <= config.smaMin) {
    return {
      valid: false,
      error: 'SMA maximum must be greater than SMA minimum'
    };
  }

  return {
    valid: true,
    data: config
  };
}
