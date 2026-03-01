import { describe, expect, test } from 'bun:test';
import {
  calculatePositionSize,
  calculateProfitMetrics,
  validateTradingParameters,
} from './calculations';

describe('calculatePositionSize', () => {
  describe('LONG positions', () => {
    test('should_calculate_position_size_for_standard_long_trade', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 10,
        riskAmount: 100,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      expect(result.positionSize).toBe(10); // 100 / (100 - 90) = 10
    });

    test('should_calculate_margin_based_on_leverage', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 10,
        riskAmount: 100,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      // notionalValue = 10 * 100 = 1000, margin = 1000 / 10 = 100
      expect(result.margin).toBe(100);
    });

    test('should_set_potential_loss_equal_to_risk_amount', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 50000,
        stopLossPrice: 48000,
        leverage: 5,
        riskAmount: 500,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      expect(result.potentialLoss).toBe(500);
    });

    test('should_calculate_risk_percentage_correctly', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        riskAmount: 100,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      expect(result.riskPercentage).toBe(10); // (10 / 100) * 100 = 10%
    });

    test('should_produce_larger_position_size_with_tight_stop_loss', () => {
      // #given
      const tightStop = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 99,
        leverage: 1,
        riskAmount: 100,
      };
      const wideStop = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 80,
        leverage: 1,
        riskAmount: 100,
      };

      // #when
      const tightResult = calculatePositionSize(tightStop);
      const wideResult = calculatePositionSize(wideStop);

      // #then
      expect(tightResult.positionSize).toBeGreaterThan(wideResult.positionSize);
    });

    test('should_reduce_margin_with_higher_leverage', () => {
      // #given
      const lowLev = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        riskAmount: 100,
      };
      const highLev = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 100,
        riskAmount: 100,
      };

      // #when
      const lowResult = calculatePositionSize(lowLev);
      const highResult = calculatePositionSize(highLev);

      // #then
      expect(highResult.margin).toBeLessThan(lowResult.margin);
    });
  });

  describe('SHORT positions', () => {
    test('should_calculate_position_size_for_standard_short_trade', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 100,
        stopLossPrice: 110,
        leverage: 10,
        riskAmount: 100,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      // riskPerUnit = |110 - 100| = 10, positionSize = 100 / 10 = 10
      expect(result.positionSize).toBe(10);
    });

    test('should_calculate_risk_percentage_using_absolute_price_distance', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 100,
        stopLossPrice: 110,
        leverage: 1,
        riskAmount: 100,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      expect(result.riskPercentage).toBe(10);
    });

    test('should_set_potential_loss_equal_to_risk_amount_for_short', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 200,
        stopLossPrice: 210,
        leverage: 5,
        riskAmount: 250,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      expect(result.potentialLoss).toBe(250);
    });
  });

  describe('edge cases', () => {
    test('should_handle_high_leverage_correctly', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 99,
        leverage: 125,
        riskAmount: 100,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      // positionSize = 100 / 1 = 100
      // notional = 100 * 100 = 10000
      // margin = 10000 / 125 = 80
      expect(result.positionSize).toBe(100);
      expect(result.margin).toBe(80);
      expect(result.potentialLoss).toBe(100);
    });

    test('should_handle_fractional_price_differences', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 1.0,
        stopLossPrice: 0.995,
        leverage: 1,
        riskAmount: 10,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      expect(result.positionSize).toBeCloseTo(2000, 5);
      expect(result.riskPercentage).toBeCloseTo(0.5, 5);
    });

    test('should_handle_leverage_of_one_without_margin_reduction', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        riskAmount: 100,
      };

      // #when
      const result = calculatePositionSize(input);

      // #then
      // positionSize = 10, notional = 10 * 100 = 1000, margin = 1000 / 1 = 1000
      expect(result.margin).toBe(1000);
    });

    test('should_scale_linearly_with_risk_amount', () => {
      // #given
      const base = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 10,
        riskAmount: 100,
      };
      const doubled = { ...base, riskAmount: 200 };

      // #when
      const baseResult = calculatePositionSize(base);
      const doubledResult = calculatePositionSize(doubled);

      // #then
      expect(doubledResult.positionSize).toBeCloseTo(baseResult.positionSize * 2, 10);
      expect(doubledResult.margin).toBeCloseTo(baseResult.margin * 2, 10);
    });
  });
});

describe('calculateProfitMetrics', () => {
  describe('LONG positions', () => {
    test('should_calculate_profit_for_single_take_profit', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 10,
        positionSize: 10,
        takeProfits: [120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // profitPercentage = (120 - 100) / 100 = 0.2
      // positionPerTarget = 10 (all of it)
      // profit = 0.2 * 10 = 2
      expect(result.profits).toHaveLength(1);
      expect(result.profits[0]).toBeCloseTo(2, 10);
    });

    test('should_split_position_equally_across_multiple_take_profits', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [110, 120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // positionPerTarget = 10 / 2 = 5
      // tp1: (110 - 100) / 100 * 5 = 0.1 * 5 = 0.5
      // tp2: (120 - 100) / 100 * 5 = 0.2 * 5 = 1.0
      expect(result.profits).toHaveLength(2);
      expect(result.profits[0]).toBeCloseTo(0.5, 10);
      expect(result.profits[1]).toBeCloseTo(1.0, 10);
    });

    test('should_calculate_total_profit_as_sum_of_individual_profits', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [110, 120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      expect(result.totalProfit).toBeCloseTo(1.5, 10);
    });

    test('should_calculate_roi_as_total_profit_over_margin', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 10,
        positionSize: 10,
        takeProfits: [120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // margin = 10 / 10 = 1
      // totalProfit = 2
      // roi = (2 / 1) * 100 = 200
      expect(result.margin).toBeCloseTo(1, 10);
      expect(result.roi).toBeCloseTo(200, 10);
    });

    test('should_calculate_potential_loss_correctly', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // riskPercentage = |90 - 100| / 100 = 0.1
      // potentialLoss = 0.1 * 10 = 1
      expect(result.potentialLoss).toBeCloseTo(1, 10);
    });

    test('should_calculate_primary_risk_reward_as_total_profit_over_loss', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // totalProfit = 2, potentialLoss = 1
      // primaryRiskReward = 2 / 1 = 2
      expect(result.primaryRiskReward).toBeCloseTo(2, 10);
    });

    test('should_calculate_average_risk_reward', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [110, 120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // averageProfit = 1.5 / 2 = 0.75
      // potentialLoss = 1
      // averageRiskReward = 0.75 / 1 = 0.75
      expect(result.averageRiskReward).toBeCloseTo(0.75, 10);
    });

    test('should_build_take_profit_breakdown_with_price_profit_and_rr', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      expect(result.takeProfitBreakdown).toHaveLength(1);
      expect(result.takeProfitBreakdown[0].price).toBe(120);
      expect(result.takeProfitBreakdown[0].profit).toBeCloseTo(2, 10);
      expect(result.takeProfitBreakdown[0].riskReward).toBeCloseTo(2, 10);
    });

    test('should_filter_out_take_profits_below_entry_for_long', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [80, 120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // tp at 80 yields negative profitPercentage and is filtered
      expect(result.profits).toHaveLength(1);
    });
  });

  describe('SHORT positions', () => {
    test('should_calculate_profit_for_single_take_profit_on_short', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 100,
        stopLossPrice: 110,
        leverage: 1,
        positionSize: 10,
        takeProfits: [80],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // profitPercentage = (100 - 80) / 100 = 0.2
      // profit = 0.2 * 10 = 2
      expect(result.profits).toHaveLength(1);
      expect(result.profits[0]).toBeCloseTo(2, 10);
    });

    test('should_calculate_potential_loss_correctly_for_short', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 100,
        stopLossPrice: 110,
        leverage: 1,
        positionSize: 10,
        takeProfits: [80],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // riskPercentage = |110 - 100| / 100 = 0.1
      // potentialLoss = 0.1 * 10 = 1
      expect(result.potentialLoss).toBeCloseTo(1, 10);
    });

    test('should_split_position_equally_across_multiple_tps_for_short', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 100,
        stopLossPrice: 110,
        leverage: 1,
        positionSize: 10,
        takeProfits: [90, 80],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // positionPerTarget = 5
      // tp1: (100 - 90) / 100 * 5 = 0.5
      // tp2: (100 - 80) / 100 * 5 = 1.0
      expect(result.profits).toHaveLength(2);
      expect(result.profits[0]).toBeCloseTo(0.5, 10);
      expect(result.profits[1]).toBeCloseTo(1.0, 10);
    });

    test('should_filter_out_take_profits_above_entry_for_short', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 100,
        stopLossPrice: 110,
        leverage: 1,
        positionSize: 10,
        takeProfits: [120, 80],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // tp at 120 yields negative profitPercentage and is filtered
      expect(result.profits).toHaveLength(1);
    });

    test('should_calculate_roi_using_leverage_for_short', () => {
      // #given
      const input = {
        tradeType: 'SHORT' as const,
        entryPrice: 100,
        stopLossPrice: 110,
        leverage: 10,
        positionSize: 10,
        takeProfits: [80],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // margin = 10 / 10 = 1, totalProfit = 2, roi = 200
      expect(result.roi).toBeCloseTo(200, 10);
    });
  });

  describe('edge cases', () => {
    test('should_return_zero_profits_when_no_take_profits_provided', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      expect(result.profits).toHaveLength(0);
      expect(result.totalProfit).toBe(0);
      expect(result.averageProfit).toBe(0);
      expect(result.roi).toBe(0);
      expect(result.primaryRiskReward).toBe(0);
    });

    test('should_return_zero_profits_when_all_take_profits_are_zero', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [0, 0],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      expect(result.profits).toHaveLength(0);
      expect(result.totalProfit).toBe(0);
    });

    test('should_handle_four_take_profits_splitting_position_by_25_percent', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 100,
        takeProfits: [110, 120, 130, 140],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      // positionPerTarget = 25
      // tp1: 0.1 * 25 = 2.5
      // tp2: 0.2 * 25 = 5.0
      // tp3: 0.3 * 25 = 7.5
      // tp4: 0.4 * 25 = 10.0
      expect(result.profits).toHaveLength(4);
      expect(result.profits[0]).toBeCloseTo(2.5, 10);
      expect(result.profits[3]).toBeCloseTo(10, 10);
    });

    test('should_have_matching_breakdown_length_and_profits_length', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 10,
        takeProfits: [110, 120, 130],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      expect(result.takeProfitBreakdown).toHaveLength(result.profits.length);
    });

    test('should_return_zero_roi_when_margin_is_zero', () => {
      // #given
      const input = {
        tradeType: 'LONG' as const,
        entryPrice: 100,
        stopLossPrice: 90,
        leverage: 1,
        positionSize: 0,
        takeProfits: [120],
      };

      // #when
      const result = calculateProfitMetrics(input);

      // #then
      expect(result.roi).toBe(0);
    });
  });
});

describe('validateTradingParameters', () => {
  describe('LONG positions - valid', () => {
    test('should_return_valid_for_correct_long_configuration', () => {
      // #given / #when
      const result = validateTradingParameters('LONG', 100, 90, [110, 120]);

      // #then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should_return_valid_with_no_take_profits', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 90);

      // #then
      expect(result.isValid).toBe(true);
    });

    test('should_return_valid_with_empty_take_profits_array', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 90, []);

      // #then
      expect(result.isValid).toBe(true);
    });

    test('should_return_valid_with_single_take_profit_above_entry', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 90, [150]);

      // #then
      expect(result.isValid).toBe(true);
    });
  });

  describe('LONG positions - invalid', () => {
    test('should_reject_stop_loss_above_entry_for_long', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 110, [120]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('For LONG positions, stop loss must be below entry price');
    });

    test('should_reject_stop_loss_equal_to_entry_for_long', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 100, [120]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('For LONG positions, stop loss must be below entry price');
    });

    test('should_reject_take_profit_below_entry_for_long', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 90, [80]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Take profit 1 must be above entry price for LONG positions');
    });

    test('should_reject_take_profit_equal_to_entry_for_long', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 90, [100]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Take profit 1 must be above entry price for LONG positions');
    });

    test('should_not_reject_out_of_order_take_profits_for_long_due_to_pre_sort', () => {
      // NOTE: the implementation pre-sorts validTPs before the order check, making
      // the ordering validation unreachable for any set of distinct values.
      // This test documents the current (buggy) behavior — [120, 110] passes because
      // it is sorted to [110, 120] before the ascending check runs.
      // #when
      const result = validateTradingParameters('LONG', 100, 90, [120, 110]);

      // #then
      expect(result.isValid).toBe(true);
      expect(result.errors).not.toContain('Take profit levels must be in ascending order for LONG positions');
    });

    test('should_reject_zero_entry_price', () => {
      // #when
      const result = validateTradingParameters('LONG', 0, 90, [110]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Entry price must be positive');
    });

    test('should_reject_negative_entry_price', () => {
      // #when
      const result = validateTradingParameters('LONG', -50, 90, [110]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Entry price must be positive');
    });

    test('should_reject_zero_stop_loss', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 0, [110]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stop loss must be positive');
    });

    test('should_reject_negative_stop_loss', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, -10, [110]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stop loss must be positive');
    });

    test('should_accumulate_multiple_errors', () => {
      // #when
      const result = validateTradingParameters('LONG', 0, 0, [80]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    test('should_skip_zero_take_profits_when_checking_long_tp_validity', () => {
      // zero TPs are treated as unset and should not trigger the "below entry" error
      // #when
      const result = validateTradingParameters('LONG', 100, 90, [0, 120]);

      // #then
      expect(result.isValid).toBe(true);
    });
  });

  describe('SHORT positions - valid', () => {
    test('should_return_valid_for_correct_short_configuration', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 110, [90, 80]);

      // #then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should_return_valid_with_single_take_profit_below_entry_for_short', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 110, [80]);

      // #then
      expect(result.isValid).toBe(true);
    });

    test('should_return_valid_with_no_take_profits_for_short', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 110);

      // #then
      expect(result.isValid).toBe(true);
    });
  });

  describe('SHORT positions - invalid', () => {
    test('should_reject_stop_loss_below_entry_for_short', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 90, [80]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('For SHORT positions, stop loss must be above entry price');
    });

    test('should_reject_stop_loss_equal_to_entry_for_short', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 100, [80]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('For SHORT positions, stop loss must be above entry price');
    });

    test('should_reject_take_profit_above_entry_for_short', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 110, [120]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Take profit 1 must be below entry price for SHORT positions');
    });

    test('should_reject_take_profit_equal_to_entry_for_short', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 110, [100]);

      // #then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Take profit 1 must be below entry price for SHORT positions');
    });

    test('should_not_reject_out_of_order_take_profits_for_short_due_to_pre_sort', () => {
      // NOTE: same pre-sort bug as LONG — [80, 90] is sorted to [90, 80] before the
      // descending check runs, so the error is never produced.
      // #when
      const result = validateTradingParameters('SHORT', 100, 110, [80, 90]);

      // #then
      expect(result.isValid).toBe(true);
      expect(result.errors).not.toContain('Take profit levels must be in descending order for SHORT positions');
    });

    test('should_identify_correct_take_profit_index_in_error_message', () => {
      // #when
      const result = validateTradingParameters('LONG', 100, 90, [110, 80, 130]);

      // #then
      expect(result.errors.some(e => e.includes('Take profit 2'))).toBe(true);
    });

    test('should_skip_zero_take_profits_when_checking_short_tp_validity', () => {
      // #when
      const result = validateTradingParameters('SHORT', 100, 110, [0, 80]);

      // #then
      expect(result.isValid).toBe(true);
    });
  });
});
