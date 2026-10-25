import { describe, expect, test } from 'bun:test';
import { calculateSMA, extractClosePrices, calculateAllSMAs } from './sma-calculator';
import type { CsvRow } from '../types';

describe('extractClosePrices', () => {
  test('should_extract_close_prices_from_csv_data', () => {
    const csvData: CsvRow[] = [
      { high: 102, low: 98, close: 100, date: '1/1/2024' },
      { high: 103, low: 99, close: 101, date: '2/1/2024' },
    ];

    expect(extractClosePrices(csvData)).toEqual([100, 101]);
  });

  test('should_return_empty_array_when_csv_data_is_empty', () => {
    expect(extractClosePrices([])).toEqual([]);
  });
});

describe('calculateSMA', () => {
  test('should_be_nan_until_window_is_full_then_average_window', () => {
    const result = calculateSMA([10, 20, 30, 40, 50], 3);

    expect(result.slice(0, 2).every(Number.isNaN)).toBe(true);
    expect(result.slice(2)).toEqual([20, 30, 40]);
  });

  test('should_return_all_nan_when_data_shorter_than_period', () => {
    const result = calculateSMA([10, 20, 30], 5);

    expect(result.length).toBe(3);
    expect(result.every(Number.isNaN)).toBe(true);
  });

  test('should_return_prices_unchanged_for_period_1', () => {
    expect(calculateSMA([10, 20, 30], 1)).toEqual([10, 20, 30]);
  });

  test('should_handle_negative_values', () => {
    const result = calculateSMA([-10, -20, -30], 2);

    expect(result[0]).toBeNaN();
    expect(result.slice(1)).toEqual([-15, -25]);
  });

  test('should_match_naive_sliding_window_on_volatile_data', () => {
    const prices = Array.from({ length: 300 }, (_, i) => 1000 + Math.sin(i) * 300 + (i % 7) * 13.37);

    for (const period of [1, 20, 77, 160]) {
      const result = calculateSMA(prices, period);

      prices.forEach((_, i) => {
        if (i < period - 1) {
          expect(result[i]).toBeNaN();
        } else {
          const window = prices.slice(i - period + 1, i + 1);
          const naive = window.reduce((a, b) => a + b, 0) / period;
          expect(result[i]).toBeCloseTo(naive, 8);
        }
      });
    }
  });
});

describe('calculateAllSMAs', () => {
  const prices = Array.from({ length: 200 }, (_, i) => 100 + i);

  test('should_include_every_period_in_inclusive_range_with_full_length', () => {
    const result = calculateAllSMAs(prices, 20, 160);

    expect(result.size).toBe(141);
    expect(result.has(19)).toBe(false);
    expect(result.has(161)).toBe(false);
    for (let period = 20; period <= 160; period++) {
      expect(result.get(period)!.length).toBe(200);
    }
  });

  test('should_calculate_each_period_independently', () => {
    const result = calculateAllSMAs(prices, 20, 160);

    expect(result.get(20)![19]).toBe(109.5);
    expect(result.get(160)![159]).toBe(179.5);
  });

  test('should_be_all_nan_for_periods_longer_than_data', () => {
    const result = calculateAllSMAs(prices.slice(0, 50), 20, 160);

    expect(result.get(20)![19]).toBe(109.5);
    expect(result.get(160)!.every(Number.isNaN)).toBe(true);
  });
});
