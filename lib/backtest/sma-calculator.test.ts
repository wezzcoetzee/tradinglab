import { describe, expect, test } from 'bun:test';
import { calculateSMA, extractClosePrices, calculateAllSMAs } from './sma-calculator';
import type { CsvRow } from '../types';

describe('extractClosePrices', () => {
  test('should_extract_close_prices_from_csv_data', () => {
    const csvData: CsvRow[] = [
      { time: 1, high: 102, low: 98, close: 100,  date: '1/1/2024' },
      { time: 2, high: 103, low: 99, close: 101, RSI: 51, date: '2/1/2024' },
      { time: 3, high: 104, low: 100, close: 102, RSI: 52, date: '3/1/2024' },
    ];

    const result = extractClosePrices(csvData);

    expect(result).toEqual([100, 101, 102]);
  });

  test('should_return_empty_array_when_csv_data_is_empty', () => {
    const result = extractClosePrices([]);

    expect(result).toEqual([]);
  });

  test('should_handle_single_row', () => {
    const csvData: CsvRow[] = [
      { time: 1, high: 102, low: 98, close: 100,  date: '1/1/2024' },
    ];

    const result = extractClosePrices(csvData);

    expect(result).toEqual([100]);
  });
});

describe('calculateSMA', () => {
  test('should_calculate_correct_sma_for_period_3', () => {
    const prices = [10, 20, 30, 40, 50];
    const period = 3;

    const result = calculateSMA(prices, period);

    expect(result[0]).toBeNaN();
    expect(result[1]).toBeNaN();
    expect(result[2]).toBe(20); // (10 + 20 + 30) / 3
    expect(result[3]).toBe(30); // (20 + 30 + 40) / 3
    expect(result[4]).toBe(40); // (30 + 40 + 50) / 3
  });

  test('should_calculate_correct_sma_for_period_5', () => {
    const prices = [100, 110, 120, 130, 140, 150];
    const period = 5;

    const result = calculateSMA(prices, period);

    expect(result[0]).toBeNaN();
    expect(result[1]).toBeNaN();
    expect(result[2]).toBeNaN();
    expect(result[3]).toBeNaN();
    expect(result[4]).toBe(120); // (100 + 110 + 120 + 130 + 140) / 5
    expect(result[5]).toBe(130); // (110 + 120 + 130 + 140 + 150) / 5
  });

  test('should_return_all_nan_when_data_length_less_than_period', () => {
    const prices = [10, 20, 30];
    const period = 5;

    const result = calculateSMA(prices, period);

    expect(result.length).toBe(3);
    expect(result[0]).toBeNaN();
    expect(result[1]).toBeNaN();
    expect(result[2]).toBeNaN();
  });

  test('should_handle_period_1', () => {
    const prices = [10, 20, 30];
    const period = 1;

    const result = calculateSMA(prices, period);

    expect(result).toEqual([10, 20, 30]);
  });

  test('should_handle_exact_period_length_data', () => {
    const prices = [10, 20, 30, 40, 50];
    const period = 5;

    const result = calculateSMA(prices, period);

    expect(result[0]).toBeNaN();
    expect(result[1]).toBeNaN();
    expect(result[2]).toBeNaN();
    expect(result[3]).toBeNaN();
    expect(result[4]).toBe(30); // (10 + 20 + 30 + 40 + 50) / 5
  });

  test('should_calculate_min_boundary_period_20', () => {
    const prices = Array.from({ length: 25 }, (_, i) => 100 + i);
    const period = 20;

    const result = calculateSMA(prices, period);

    expect(result.slice(0, 19).every(v => isNaN(v))).toBe(true);
    expect(result[19]).toBe(109.5); // average of 100-119
  });

  test('should_handle_max_boundary_period_160', () => {
    const prices = Array.from({ length: 165 }, (_, i) => 100 + i);
    const period = 160;

    const result = calculateSMA(prices, period);

    expect(result.slice(0, 159).every(v => isNaN(v))).toBe(true);
    expect(result[159]).toBe(179.5); // average of 100-259
  });

  test('should_handle_zero_values', () => {
    const prices = [0, 0, 0, 0, 0];
    const period = 3;

    const result = calculateSMA(prices, period);

    expect(result[2]).toBe(0);
    expect(result[3]).toBe(0);
    expect(result[4]).toBe(0);
  });

  test('should_handle_negative_values', () => {
    const prices = [-10, -20, -30];
    const period = 2;

    const result = calculateSMA(prices, period);

    expect(result[0]).toBeNaN();
    expect(result[1]).toBe(-15); // (-10 + -20) / 2
    expect(result[2]).toBe(-25); // (-20 + -30) / 2
  });

  test('should_handle_decimal_values', () => {
    const prices = [100.5, 200.5, 300.5];
    const period = 2;

    const result = calculateSMA(prices, period);

    expect(result[0]).toBeNaN();
    expect(result[1]).toBe(150.5);
    expect(result[2]).toBe(250.5);
  });
});

describe('calculateAllSMAs', () => {
  test('should_generate_smas_for_all_periods_20_to_160', () => {
    const prices = Array.from({ length: 200 }, (_, i) => 100 + i);

    const result = calculateAllSMAs(prices, 20, 160);

    expect(result.size).toBe(141); // 20 to 160 inclusive
    expect(result.has(20)).toBe(true);
    expect(result.has(160)).toBe(true);
    expect(result.has(19)).toBe(false);
    expect(result.has(161)).toBe(false);
  });

  test('should_correctly_calculate_sma_for_each_period', () => {
    const prices = Array.from({ length: 200 }, (_, i) => 100 + i);

    const result = calculateAllSMAs(prices, 20, 160);

    const sma20 = result.get(20)!;
    const sma160 = result.get(160)!;

    expect(sma20[19]).toBe(109.5); // average of first 20 values
    expect(sma160[159]).toBe(179.5); // average of first 160 values
  });

  test('should_memoize_all_smas_in_single_pass', () => {
    const prices = Array.from({ length: 200 }, (_, i) => 100 + i);

    const result = calculateAllSMAs(prices, 20, 160);

    for (let period = 20; period <= 160; period++) {
      expect(result.has(period)).toBe(true);
      expect(result.get(period)!.length).toBe(200);
    }
  });

  test('should_handle_insufficient_data_for_larger_periods', () => {
    const prices = Array.from({ length: 50 }, (_, i) => 100 + i);

    const result = calculateAllSMAs(prices, 20, 160);

    const sma20 = result.get(20)!;
    const sma160 = result.get(160)!;

    expect(sma20.slice(0, 19).every(v => isNaN(v))).toBe(true);
    expect(sma20[19]).toBeDefined();
    expect(sma160.every(v => isNaN(v))).toBe(true);
  });

  test('should_return_consistent_results_across_calls', () => {
    const prices = Array.from({ length: 200 }, (_, i) => 100 + i);

    const result1 = calculateAllSMAs(prices);
    const result2 = calculateAllSMAs(prices);

    expect(result1.size).toBe(result2.size);

    for (let period = 20; period <= 160; period++) {
      expect(result1.get(period)).toEqual(result2.get(period));
    }
  });

  test('should_handle_edge_case_with_exactly_160_prices', () => {
    const prices = Array.from({ length: 160 }, (_, i) => 100 + i);

    const result = calculateAllSMAs(prices, 20, 160);

    const sma160 = result.get(160)!;

    expect(sma160.slice(0, 159).every(v => isNaN(v))).toBe(true);
    expect(sma160[159]).toBe(179.5);
  });
});
