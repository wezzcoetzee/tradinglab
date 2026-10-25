import { describe, expect, test } from 'bun:test';
import { validateStrategyConfig } from './strategy-validator';
import type { StrategyConfig } from './types';

const base: StrategyConfig = {
  startingCapital: 1000,
  tradingFee: 0.05,
  atrEnabled: false,
  smaMin: 2,
  smaMax: 200,
};

const validate = (overrides: Partial<StrategyConfig>) =>
  validateStrategyConfig({ ...base, ...overrides });

describe('validateStrategyConfig', () => {
  test.each<[string, Partial<StrategyConfig>, string]>([
    ['zero_capital', { startingCapital: 0 }, 'Starting capital must be greater than 0'],
    ['negative_capital', { startingCapital: -1000 }, 'Starting capital must be greater than 0'],
    ['capital_below_100', { startingCapital: 99 }, 'Starting capital must be at least $100'],
    ['negative_fee', { tradingFee: -0.01 }, 'Trading fee must be between 0% and 100%'],
    ['fee_above_100', { tradingFee: 100.01 }, 'Trading fee must be between 0% and 100%'],
    ['sma_min_below_2', { smaMin: 1 }, 'SMA minimum must be at least 2'],
    ['sma_min_above_50', { smaMin: 51 }, 'SMA minimum must be 50 or less'],
    ['sma_max_equal_to_min', { smaMin: 10, smaMax: 10 }, 'SMA maximum must be greater than SMA minimum'],
    ['sma_max_below_min', { smaMin: 10, smaMax: 5 }, 'SMA maximum must be greater than SMA minimum'],
    ['sma_max_above_200', { smaMax: 201 }, 'SMA maximum must be 200 or less'],
  ])('should_reject_%s', (_name, overrides, error) => {
    const result = validate(overrides);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(error);
  });

  test.each<[string, Partial<StrategyConfig>]>([
    ['capital_exactly_100', { startingCapital: 100 }],
    ['fee_exactly_0', { tradingFee: 0 }],
    ['fee_exactly_100', { tradingFee: 100 }],
    ['sma_min_exactly_2', { smaMin: 2 }],
    ['sma_min_exactly_50', { smaMin: 50 }],
    ['sma_max_one_above_min', { smaMin: 2, smaMax: 3 }],
    ['sma_max_exactly_200', { smaMax: 200 }],
  ])('should_accept_%s', (_name, overrides) => {
    expect(validate(overrides).valid).toBe(true);
  });

  test('should_return_config_as_data_without_error', () => {
    const result = validate({ atrEnabled: true });
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ ...base, atrEnabled: true });
    expect(result.error).toBeUndefined();
  });

  test('should_report_first_failing_check_when_multiple_invalid', () => {
    expect(validate({ startingCapital: 0, tradingFee: -1 }).error).toBe('Starting capital must be greater than 0');
    expect(validate({ startingCapital: 50, tradingFee: 101 }).error).toBe('Starting capital must be at least $100');
    expect(validate({ smaMin: 1, smaMax: 201 }).error).toBe('SMA minimum must be at least 2');
  });
});
