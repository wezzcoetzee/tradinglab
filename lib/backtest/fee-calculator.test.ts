import { describe, expect, test } from 'bun:test';
import { calculateTradeFee } from './fee-calculator';

describe('calculateTradeFee', () => {
  test('should_calculate_fee_on_notional_value', () => {
    const balance = 1000;
    const leverage = 2;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(2); // 1000 * 2 * 0.1 / 100 = 2
  });

  test('should_calculate_fee_with_leverage_1', () => {
    const balance = 1000;
    const leverage = 1;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(1); // 1000 * 1 * 0.1 / 100 = 1
  });

  test('should_calculate_fee_with_max_leverage_3', () => {
    const balance = 1000;
    const leverage = 3;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(3); // 1000 * 3 * 0.1 / 100 = 3
  });

  test('should_calculate_fee_with_fractional_leverage', () => {
    const balance = 1000;
    const leverage = 1.5;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(1.5); // 1000 * 1.5 * 0.1 / 100 = 1.5
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

    expect(result).toBe(20); // 1000 * 2 * 1.0 / 100 = 20
  });

  test('should_calculate_fee_with_large_balance', () => {
    const balance = 100000;
    const leverage = 2.5;
    const feeRate = 0.05;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBe(125); // 100000 * 2.5 * 0.05 / 100 = 125
  });

  test('should_calculate_fee_with_decimal_balance', () => {
    const balance = 1234.56;
    const leverage = 1.25;
    const feeRate = 0.1;

    const result = calculateTradeFee(balance, leverage, feeRate);

    expect(result).toBeCloseTo(1.5432, 4); // 1234.56 * 1.25 * 0.1 / 100
  });
});
