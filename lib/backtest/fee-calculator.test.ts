import { describe, expect, test } from 'bun:test';
import { calculateTradeFee, calculateTransitionFees } from './fee-calculator';
import type { PositionAction } from './types';

describe('calculateTradeFee', () => {
  test('should_calculate_fee_using_correct_formula', () => {
    const balance = 1000;
    const leverage = 2;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(4); // 1000 * 2 * 2 * 0.1 / 100 = 4
  });

  test('should_calculate_fee_with_leverage_1', () => {
    const balance = 1000;
    const leverage = 1;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(1); // 1000 * 1 * 1 * 0.1 / 100 = 1
  });

  test('should_calculate_fee_with_max_leverage_3', () => {
    const balance = 1000;
    const leverage = 3;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(9); // 1000 * 3 * 3 * 0.1 / 100 = 9
  });

  test('should_calculate_fee_with_fractional_leverage', () => {
    const balance = 1000;
    const leverage = 1.5;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(2.25); // 1000 * 1.5 * 1.5 * 0.1 / 100 = 2.25
  });

  test('should_return_zero_when_balance_is_zero', () => {
    const balance = 0;
    const leverage = 2;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(0);
  });

  test('should_return_zero_when_fee_rate_is_zero', () => {
    const balance = 1000;
    const leverage = 2;
    const feeRate = 0;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(0);
  });

  test('should_calculate_fee_with_high_fee_rate', () => {
    const balance = 1000;
    const leverage = 2;
    const feeRate = 1.0;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(40); // 1000 * 2 * 2 * 1.0 / 100 = 40
  });

  test('should_calculate_fee_with_large_balance', () => {
    const balance = 100000;
    const leverage = 2.5;
    const feeRate = 0.05;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(312.5); // 100000 * 2.5 * 2.5 * 0.05 / 100 = 312.5
  });

  test('should_calculate_fee_with_decimal_balance', () => {
    const balance = 1234.56;
    const leverage = 1.25;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBeCloseTo(1.929, 3);
  });
});

describe('calculateTransitionFees', () => {
  describe('single fee actions', () => {
    test('should_calculate_fee_for_open_long', () => {
      const action: PositionAction = 'OPEN_LONG';
      const balance = 1000;
      const currentLeverage = 2;
      const feeRate = 0.1;

      const result = calculateTransitionFees(action, balance, currentLeverage, feeRate);

      expect(result).toBe(4);
    });

    test('should_calculate_fee_for_open_short', () => {
      const action: PositionAction = 'OPEN_SHORT';
      const balance = 1000;
      const currentLeverage = 2.5;
      const feeRate = 0.1;

      const result = calculateTransitionFees(action, balance, currentLeverage, feeRate);

      expect(result).toBe(6.25);
    });

    test('should_calculate_fee_for_close_long', () => {
      const action: PositionAction = 'CLOSE_LONG';
      const balance = 1000;
      const currentLeverage = 1.5;
      const feeRate = 0.1;

      const result = calculateTransitionFees(action, balance, currentLeverage, feeRate);

      expect(result).toBe(2.25);
    });

    test('should_calculate_fee_for_close_short', () => {
      const action: PositionAction = 'CLOSE_SHORT';
      const balance = 1000;
      const currentLeverage = 3;
      const feeRate = 0.1;

      const result = calculateTransitionFees(action, balance, currentLeverage, feeRate);

      expect(result).toBe(9);
    });
  });

  describe('double fee transitions', () => {
    test('should_calculate_double_fee_for_long_to_short_transition', () => {
      const action: PositionAction = 'TRANSITION_LONG_TO_SHORT';
      const balance = 1000;
      const currentLeverage = 2;
      const feeRate = 0.1;
      const newLeverage = 2.5;

      const result = calculateTransitionFees(
        action,
        balance,
        currentLeverage,
        feeRate,
        newLeverage
      );

      // Close LONG: 1000 * 2 * 2 * 0.1 / 100 = 4
      // Open SHORT: 1000 * 2.5 * 2.5 * 0.1 / 100 = 6.25
      // Total: 10.25
      expect(result).toBe(10.25);
    });

    test('should_calculate_double_fee_for_short_to_long_transition', () => {
      const action: PositionAction = 'TRANSITION_SHORT_TO_LONG';
      const balance = 1000;
      const currentLeverage = 3;
      const feeRate = 0.1;
      const newLeverage = 1.5;

      const result = calculateTransitionFees(
        action,
        balance,
        currentLeverage,
        feeRate,
        newLeverage
      );

      // Close SHORT: 1000 * 3 * 3 * 0.1 / 100 = 9
      // Open LONG: 1000 * 1.5 * 1.5 * 0.1 / 100 = 2.25
      // Total: 11.25
      expect(result).toBe(11.25);
    });

    test('should_throw_error_when_transition_missing_new_leverage', () => {
      const action: PositionAction = 'TRANSITION_LONG_TO_SHORT';
      const balance = 1000;
      const currentLeverage = 2;
      const feeRate = 0.1;

      expect(() => {
        calculateTransitionFees(action, balance, currentLeverage, feeRate);
      }).toThrow('newLeverage required for transition actions');
    });

    test('should_calculate_transition_with_same_leverage', () => {
      const action: PositionAction = 'TRANSITION_SHORT_TO_LONG';
      const balance = 1000;
      const currentLeverage = 2;
      const feeRate = 0.1;
      const newLeverage = 2;

      const result = calculateTransitionFees(
        action,
        balance,
        currentLeverage,
        feeRate,
        newLeverage
      );

      expect(result).toBe(8); // 4 + 4
    });

    test('should_calculate_transition_with_different_fee_rates', () => {
      const action: PositionAction = 'TRANSITION_LONG_TO_SHORT';
      const balance = 1000;
      const currentLeverage = 2;
      const feeRate = 0.5;
      const newLeverage = 2.5;

      const result = calculateTransitionFees(
        action,
        balance,
        currentLeverage,
        feeRate,
        newLeverage
      );

      // Close LONG: 1000 * 2 * 2 * 0.5 / 100 = 20
      // Open SHORT: 1000 * 2.5 * 2.5 * 0.5 / 100 = 31.25
      // Total: 51.25
      expect(result).toBe(51.25);
    });
  });

  describe('hold action', () => {
    test('should_return_zero_fee_for_hold_action', () => {
      const action: PositionAction = 'HOLD';
      const balance = 1000;
      const currentLeverage = 2;
      const feeRate = 0.1;

      const result = calculateTransitionFees(action, balance, currentLeverage, feeRate);

      expect(result).toBe(0);
    });

    test('should_return_zero_for_hold_regardless_of_balance', () => {
      const action: PositionAction = 'HOLD';
      const balance = 1000000;
      const currentLeverage = 3;
      const feeRate = 1.0;

      const result = calculateTransitionFees(action, balance, currentLeverage, feeRate);

      expect(result).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('should_handle_zero_balance_in_transition', () => {
      const action: PositionAction = 'TRANSITION_LONG_TO_SHORT';
      const balance = 0;
      const currentLeverage = 2;
      const feeRate = 0.1;
      const newLeverage = 2.5;

      const result = calculateTransitionFees(
        action,
        balance,
        currentLeverage,
        feeRate,
        newLeverage
      );

      expect(result).toBe(0);
    });

    test('should_handle_max_leverage_values', () => {
      const action: PositionAction = 'TRANSITION_SHORT_TO_LONG';
      const balance = 1000;
      const currentLeverage = 3;
      const feeRate = 0.1;
      const newLeverage = 3;

      const result = calculateTransitionFees(
        action,
        balance,
        currentLeverage,
        feeRate,
        newLeverage
      );

      expect(result).toBe(18); // 9 + 9
    });

    test('should_handle_fractional_leverage_in_transition', () => {
      const action: PositionAction = 'TRANSITION_LONG_TO_SHORT';
      const balance = 1000;
      const currentLeverage = 1.75;
      const feeRate = 0.1;
      const newLeverage = 2.25;

      const result = calculateTransitionFees(
        action,
        balance,
        currentLeverage,
        feeRate,
        newLeverage
      );

      expect(result).toBeCloseTo(8.125, 3);
    });
  });
});
