import { describe, expect, test } from 'bun:test';
import { validateStrategyConfig } from './strategy-validator';
import type { StrategyConfig } from './types';

describe('validateStrategyConfig', () => {
  describe('starting capital validation', () => {
    test('should_reject_zero_capital', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 0,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Starting capital must be greater than 0');
    });

    test('should_reject_negative_capital', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: -1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Starting capital must be greater than 0');
    });

    test('should_reject_capital_below_minimum', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 99,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Starting capital must be at least $100');
    });

    test('should_accept_exactly_100_capital', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 100,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_capital_above_minimum', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_large_capital', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('trading fee validation', () => {
    test('should_reject_negative_fee', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: -0.01,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Trading fee must be between 0% and 100%');
    });

    test('should_reject_fee_above_100', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 100.01,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Trading fee must be between 0% and 100%');
    });

    test('should_accept_exactly_0_fee', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_exactly_100_fee', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 100,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_typical_fee', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_decimal_fee', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 1.5,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('sma minimum validation', () => {
    test('should_reject_sma_min_below_2', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 1,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA minimum must be at least 2');
    });

    test('should_reject_sma_min_zero', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 0,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA minimum must be at least 2');
    });

    test('should_reject_sma_min_above_50', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 51,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA minimum must be 50 or less');
    });

    test('should_accept_sma_min_exactly_2', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_sma_min_exactly_50', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 50,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_sma_min_in_valid_range', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 20,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('sma maximum validation', () => {
    test('should_reject_sma_max_less_than_or_equal_to_sma_min', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 10,
        smaMax: 10,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA maximum must be greater than SMA minimum');
    });

    test('should_reject_sma_max_less_than_sma_min', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 10,
        smaMax: 5,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA maximum must be greater than SMA minimum');
    });

    test('should_reject_sma_max_below_3', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 2,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA maximum must be greater than SMA minimum');
    });

    test('should_reject_sma_max_above_200', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 201,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA maximum must be 200 or less');
    });

    test('should_accept_sma_max_exactly_3', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 3,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_sma_max_exactly_200', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_sma_max_in_valid_range', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 20,
        smaMax: 100,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('successful validation', () => {
    test('should_return_valid_result_with_data', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toEqual(config);
      expect(result.error).toBeUndefined();
    });

    test('should_accept_atr_enabled', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: true,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
      expect(result.data?.atrEnabled).toBe(true);
    });

    test('should_accept_atr_disabled', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
      expect(result.data?.atrEnabled).toBe(false);
    });

    test('should_accept_minimal_valid_range', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 100,
        tradingFee: 0,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 3,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_maximal_valid_range', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000000,
        tradingFee: 100,
        atrEnabled: true,
        smaMin: 50,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('validation order', () => {
    test('should_validate_capital_before_fee', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 0,
        tradingFee: -1,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Starting capital must be greater than 0');
    });

    test('should_validate_minimum_capital_before_fee', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 50,
        tradingFee: 101,
        atrEnabled: false,
        smaMin: 2,
        smaMax: 200,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Starting capital must be at least $100');
    });

    test('should_validate_sma_min_before_sma_max', () => {
      // #given
      const config: StrategyConfig = {
        startingCapital: 1000,
        tradingFee: 0.05,
        atrEnabled: false,
        smaMin: 1,
        smaMax: 201,
      };

      // #when
      const result = validateStrategyConfig(config);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('SMA minimum must be at least 2');
    });
  });
});
