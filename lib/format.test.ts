import { describe, expect, test } from 'bun:test';
import {
  formatCurrency,
  formatPercent,
  formatTime,
  formatNumber,
  getReturnColorClass,
  getVsHoldColorClass,
  formatAtrConfig,
  calculateVsHold,
  getVsHoldBackgroundClass,
  formatDateTick,
  currencyTickFormatter,
  formatPercentage,
  safeParseFloat,
  calculateBuyHoldValue,
} from './format';

describe('formatCurrency', () => {
  test.each([
    [1234.56, '$1,234.56'],
    [0, '$0.00'],
    [-1234.56, '-$1,234.56'],
    [1234567.89, '$1,234,567.89'],
  ])('should_format_%p', (value, expected) => {
    expect(formatCurrency(value)).toBe(expected);
  });
});

describe('formatPercent', () => {
  test.each([
    [15.456, '+15.46%'],
    [-12.345, '-12.35%'],
    [0, '+0.00%'],
  ])('should_format_%p', (value, expected) => {
    expect(formatPercent(value)).toBe(expected);
  });
});

describe('formatTime', () => {
  test.each([
    [0, '0s'],
    [5000, '5s'],
    [60000, '1m 0s'],
    [125000, '2m 5s'],
  ])('should_format_%pms', (ms, expected) => {
    expect(formatTime(ms)).toBe(expected);
  });
});

describe('formatNumber', () => {
  test('should_format_with_commas_and_round_decimals', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1234.56)).toBe('1,235');
  });
});

describe('getReturnColorClass', () => {
  test.each([
    [10, 'text-[var(--profit-green)]'],
    [0, 'text-[var(--profit-green)]'],
    [-10, 'text-destructive'],
  ])('should_classify_%p', (value, expected) => {
    expect(getReturnColorClass(value)).toBe(expected);
  });
});

describe('getVsHoldColorClass', () => {
  test.each([
    [5.01, 'text-[var(--profit-green)]'],
    [5, 'text-muted-foreground'],
    [0, 'text-muted-foreground'],
    [-5, 'text-muted-foreground'],
    [-5.01, 'text-destructive'],
  ])('should_classify_%p', (value, expected) => {
    expect(getVsHoldColorClass(value)).toBe(expected);
  });
});

describe('formatAtrConfig', () => {
  test('should_format_all_values', () => {
    expect(formatAtrConfig({ period: 20, multiplier: 2.5, closePercent: 25 })).toBe('20/2.5/25%');
  });

  test('should_return_dash_or_custom_value_when_undefined', () => {
    expect(formatAtrConfig(undefined)).toBe('-');
    expect(formatAtrConfig(undefined, 'None')).toBe('None');
  });
});

describe('calculateVsHold', () => {
  test.each([
    [1500, 1200, 25],
    [900, 1200, -25],
    [1200, 1200, 0],
  ])('should_calculate_%p_vs_%p', (final, baseline, expected) => {
    expect(calculateVsHold(final, baseline)).toBe(expected);
  });
});

describe('getVsHoldBackgroundClass', () => {
  const darkGreen = 'bg-[var(--profit-green)]/10';
  const lightGreen = 'bg-[var(--profit-green)]/5';
  const neutral = 'bg-muted/50';
  const lightRed = 'bg-[var(--loss-red)]/5';
  const darkRed = 'bg-[var(--loss-red)]/10';

  test.each([
    [Infinity, darkGreen],
    [50, darkGreen],
    [49.99, lightGreen],
    [20, lightGreen],
    [19.99, neutral],
    [0, neutral],
    [-0.01, lightRed],
    [-20, lightRed],
    [-20.01, darkRed],
    [-Infinity, darkRed],
  ])('should_classify_%p', (value, expected) => {
    expect(getVsHoldBackgroundClass(value)).toBe(expected);
  });
});

describe('formatDateTick', () => {
  test.each([
    ['15/06/2024', '06/24'],
    ['1/12/2023', '12/23'],
  ])('should_format_%s', (input, expected) => {
    expect(formatDateTick(input)).toBe(expected);
  });
});

describe('currencyTickFormatter', () => {
  test.each([
    [1_500_000, '$1.5M'],
    [1_000_000, '$1.0M'],
    [999_999, '$1000K'],
    [1_000, '$1K'],
    [999, '$999'],
    [0, '$0'],
  ])('should_format_%p', (value, expected) => {
    expect(currencyTickFormatter(value)).toBe(expected);
  });
});

describe('calculateBuyHoldValue', () => {
  test.each([
    [1000, 50, 100, 2000],
    [1000, 100, 100, 1000],
    [1000, 100, 50, 500],
  ])('should_value_%p_bought_at_%p_now_%p', (capital, buy, now, expected) => {
    expect(calculateBuyHoldValue(capital, buy, now)).toBe(expected);
  });

  test('should_handle_fractional_shares', () => {
    expect(calculateBuyHoldValue(1000, 3, 6)).toBeCloseTo(2000, 5);
  });
});

describe('formatPercentage', () => {
  test('should_format_without_sign_using_given_decimals', () => {
    expect(formatPercentage(12.345)).toBe('12.35%');
    expect(formatPercentage(-3.1, 1)).toBe('-3.1%');
  });
});

describe('safeParseFloat', () => {
  test('should_parse_numeric_input_and_fall_back_to_zero', () => {
    expect(safeParseFloat('42.5')).toBe(42.5);
    expect(safeParseFloat(7)).toBe(7);
    expect(safeParseFloat('abc')).toBe(0);
    expect(safeParseFloat(Infinity)).toBe(0);
  });
});
