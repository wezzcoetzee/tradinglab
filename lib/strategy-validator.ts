import type { StrategyConfig, StrategyConfigValidation } from './types';

export function validateStrategyConfig(config: StrategyConfig): StrategyConfigValidation {
  if (config.startingCapital <= 0) {
    return {
      valid: false,
      error: 'Starting capital must be greater than 0'
    };
  }

  if (config.startingCapital < 100) {
    return {
      valid: false,
      error: 'Starting capital must be at least $100'
    };
  }

  if (config.tradingFee < 0 || config.tradingFee > 100) {
    return {
      valid: false,
      error: 'Trading fee must be between 0% and 100%'
    };
  }

  if (config.atrEnabled) {
    if (!config.atrPeriod) {
      return {
        valid: false,
        error: 'ATR period is required when ATR is enabled'
      };
    }

    if (!config.atrMultiplier) {
      return {
        valid: false,
        error: 'ATR multiplier is required when ATR is enabled'
      };
    }

    if (!config.atrClosePercent) {
      return {
        valid: false,
        error: 'ATR close percent is required when ATR is enabled'
      };
    }
  }

  return {
    valid: true,
    data: config
  };
}
