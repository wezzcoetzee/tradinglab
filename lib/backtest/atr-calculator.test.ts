import { describe, expect, test } from 'bun:test';
import type { CsvRow } from '../types';
import { calculateATR, calculateAllATRs, calculateTrueRange } from './atr-calculator';

describe('calculateTrueRange', () => {
  test.each([
    { name: 'high_minus_low', high: 110, low: 100, prevClose: 105, expected: 10 },
    { name: 'high_minus_prev_close_on_gap_up', high: 120, low: 115, prevClose: 100, expected: 20 },
    { name: 'prev_close_minus_low_on_gap_down', high: 105, low: 100, prevClose: 120, expected: 20 },
    { name: 'zero_when_no_movement', high: 100, low: 100, prevClose: 100, expected: 0 },
    { name: 'handle_negative_prices', high: -95, low: -105, prevClose: -100, expected: 10 },
  ])('should_use_$name', ({ high, low, prevClose, expected }) => {
    expect(calculateTrueRange(high, low, prevClose)).toBe(expected);
  });
});

describe('calculateATR', () => {
  test.each([10, 14, 20])('should_be_nan_for_i_below_period_and_defined_from_period_%d', (period) => {
    const length = period + 5;
    const highs = Array.from({ length }, (_, i) => 100 + i);
    const lows = highs.map((h) => h - 5);
    const closes = highs.map((h) => h - 2);

    const result = calculateATR(highs, lows, closes, period);

    expect(result.length).toBe(length);
    expect(result.slice(0, period).every(Number.isNaN)).toBe(true);
    expect(result.slice(period).some(Number.isNaN)).toBe(false);
  });

  test('should_exclude_first_bar_high_minus_low_from_first_window', () => {
    // bar 0 range is 50 and must not leak in; TR[1] = 10, TR[2] = 7
    const result = calculateATR([150, 115, 120], [100, 108, 113], [105, 113, 118], 2);

    expect(result[2]).toBe(8.5);
  });

  test('should_return_nan_for_single_data_point', () => {
    expect(calculateATR([105], [100], [103], 2).every(Number.isNaN)).toBe(true);
  });

  test('should_match_naive_sliding_window_on_volatile_data', () => {
    const n = 120;
    const highs = Array.from({ length: n }, (_, i) => 200 + Math.sin(i) * 40 + (i % 5) * 3);
    const lows = highs.map((h, i) => h - 2 - (i % 7) * 1.7);
    const closes = highs.map((h, i) => h - ((i * 13) % 5));
    const trueRanges = highs.map((h, i) => (i === 0 ? h - lows[i] : calculateTrueRange(h, lows[i], closes[i - 1])));

    for (const period of [1, 10, 14, 20]) {
      const result = calculateATR(highs, lows, closes, period);

      for (let i = 0; i < n; i++) {
        if (i < period) {
          expect(result[i]).toBeNaN();
        } else {
          const window = trueRanges.slice(i - period + 1, i + 1);
          expect(result[i]).toBeCloseTo(window.reduce((a, b) => a + b, 0) / period, 8);
        }
      }
    }
  });
});

describe('calculateAllATRs', () => {
  const makeRows = (length: number): CsvRow[] =>
    Array.from({ length }, (_, i) => ({
      date: `2024-01-${i + 1}`,
      high: 105 + i,
      low: 95 + i,
      close: 102 + i,
    }));

  test('should_calculate_full_length_atr_for_periods_10_14_20', () => {
    const result = calculateAllATRs(makeRows(30));

    expect([...result.keys()]).toEqual([10, 14, 20]);
    for (const atr of result.values()) {
      expect(atr.length).toBe(30);
    }
  });

  test('should_pin_nan_warmup_and_value_from_each_period', () => {
    const result = calculateAllATRs(makeRows(30));

    for (const period of [10, 14, 20] as const) {
      const atr = result.get(period)!;
      expect(atr.slice(0, period).every(Number.isNaN)).toBe(true);
      // constant 10 range with +1 drift: TR = max(10, |high-prevClose|=8, |low-prevClose|=2) = 10
      expect(atr[period]).toBe(10);
    }
  });

  test('should_return_all_nan_for_single_row', () => {
    const result = calculateAllATRs(makeRows(1));

    expect(result.get(10)!.length).toBe(1);
    expect(result.get(10)![0]).toBeNaN();
  });
});
