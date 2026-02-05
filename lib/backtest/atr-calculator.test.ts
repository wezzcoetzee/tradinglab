import { describe, expect, test } from 'bun:test';
import type { CsvRow } from '../types';
import { calculateATR, calculateAllATRs, calculateTrueRange } from './atr-calculator';

describe('calculateTrueRange', () => {
  test('should_use_high_minus_low_when_largest', () => {
    const high = 110;
    const low = 100;
    const previousClose = 105;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(10);
  });

  test('should_use_high_minus_prev_close_when_largest', () => {
    const high = 110;
    const low = 105;
    const previousClose = 95;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(15);
  });

  test('should_use_prev_close_minus_low_when_largest', () => {
    const high = 105;
    const low = 95;
    const previousClose = 110;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(15);
  });

  test('should_handle_gap_up', () => {
    const high = 120;
    const low = 115;
    const previousClose = 100;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(20);
  });

  test('should_handle_gap_down', () => {
    const high = 105;
    const low = 100;
    const previousClose = 120;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(20);
  });

  test('should_handle_no_movement', () => {
    const high = 100;
    const low = 100;
    const previousClose = 100;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(0);
  });

  test('should_handle_small_intraday_range_with_gap', () => {
    const high = 100.5;
    const low = 100;
    const previousClose = 95;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(5.5);
  });

  test('should_handle_large_volatility', () => {
    const high = 200;
    const low = 150;
    const previousClose = 180;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(50);
  });

  test('should_handle_fractional_values', () => {
    const high = 105.75;
    const low = 100.25;
    const previousClose = 102.5;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBeCloseTo(5.5, 10);
  });

  test('should_handle_negative_prices', () => {
    const high = -95;
    const low = -105;
    const previousClose = -100;

    const result = calculateTrueRange(high, low, previousClose);

    expect(result).toBe(10);
  });
});

describe('calculateATR', () => {
  test('should_return_nan_for_first_value', () => {
    const highs = [105, 110, 108];
    const lows = [100, 105, 103];
    const closes = [103, 108, 106];

    const result = calculateATR(highs, lows, closes, 2);

    expect(isNaN(result[0])).toBe(true);
  });

  test('should_return_nan_until_period_reached', () => {
    const highs = [105, 110, 108, 112];
    const lows = [100, 105, 103, 107];
    const closes = [103, 108, 106, 110];

    const result = calculateATR(highs, lows, closes, 3);

    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(isNaN(result[2])).toBe(true);
    expect(isNaN(result[3])).toBe(false);
  });

  test('should_calculate_simple_average_at_period', () => {
    const highs = [105, 110, 115];
    const lows = [100, 105, 110];
    const closes = [103, 108, 113];

    const result = calculateATR(highs, lows, closes, 2);

    const tr0 = 5;
    const tr1 = Math.max(5, 7, 3);
    const tr2 = Math.max(5, 7, 3);
    const expectedAtr = (tr1 + tr2) / 2;

    expect(result[2]).toBe(expectedAtr);
  });

  test('should_handle_period_10', () => {
    const highs = Array(15).fill(0).map((_, i) => 100 + i);
    const lows = Array(15).fill(0).map((_, i) => 95 + i);
    const closes = Array(15).fill(0).map((_, i) => 98 + i);

    const result = calculateATR(highs, lows, closes, 10);

    for (let i = 0; i < 10; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
    expect(isNaN(result[10])).toBe(false);
  });

  test('should_handle_period_14', () => {
    const highs = Array(20).fill(0).map((_, i) => 100 + i);
    const lows = Array(20).fill(0).map((_, i) => 95 + i);
    const closes = Array(20).fill(0).map((_, i) => 98 + i);

    const result = calculateATR(highs, lows, closes, 14);

    for (let i = 0; i < 14; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
    expect(isNaN(result[14])).toBe(false);
  });

  test('should_handle_period_20', () => {
    const highs = Array(25).fill(0).map((_, i) => 100 + i);
    const lows = Array(25).fill(0).map((_, i) => 95 + i);
    const closes = Array(25).fill(0).map((_, i) => 98 + i);

    const result = calculateATR(highs, lows, closes, 20);

    for (let i = 0; i < 20; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
    expect(isNaN(result[20])).toBe(false);
  });

  test('should_calculate_with_varying_volatility', () => {
    const highs = [100, 105, 110, 115, 120];
    const lows = [95, 100, 105, 110, 115];
    const closes = [98, 103, 108, 113, 118];

    const result = calculateATR(highs, lows, closes, 3);

    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(isNaN(result[2])).toBe(true);
    expect(isNaN(result[3])).toBe(false);
  });

  test('should_handle_single_data_point', () => {
    const highs = [105];
    const lows = [100];
    const closes = [103];

    const result = calculateATR(highs, lows, closes, 2);

    expect(isNaN(result[0])).toBe(true);
  });

  test('should_handle_known_values', () => {
    const highs = [110, 115, 112, 118, 120];
    const lows = [105, 110, 108, 113, 115];
    const closes = [108, 113, 110, 116, 118];

    const result = calculateATR(highs, lows, closes, 3);

    const tr0 = 5;
    const tr1 = Math.max(5, 7, 3);
    const tr2 = Math.max(4, 5, 3);
    const tr3 = Math.max(5, 8, 6);
    const atr3 = (tr1 + tr2 + tr3) / 3;

    expect(result[3]).toBeCloseTo(atr3, 10);
  });

  test('should_use_high_minus_low_for_first_true_range', () => {
    const highs = [110, 115];
    const lows = [100, 105];
    const closes = [105, 110];

    const result = calculateATR(highs, lows, closes, 1);

    expect(result[0]).toBeUndefined;
    expect(result[1]).toBe(10);
  });

  test('should_handle_zero_volatility', () => {
    const highs = [100, 100, 100];
    const lows = [100, 100, 100];
    const closes = [100, 100, 100];

    const result = calculateATR(highs, lows, closes, 2);

    expect(result[2]).toBe(0);
  });

  test('should_maintain_correct_array_length', () => {
    const dataLength = 50;
    const highs = Array(dataLength).fill(0).map((_, i) => 100 + i);
    const lows = Array(dataLength).fill(0).map((_, i) => 95 + i);
    const closes = Array(dataLength).fill(0).map((_, i) => 98 + i);

    const result = calculateATR(highs, lows, closes, 14);

    expect(result.length).toBe(dataLength);
  });

  test('should_calculate_rolling_average', () => {
    const highs = [105, 110, 115, 120, 125];
    const lows = [100, 105, 110, 115, 120];
    const closes = [103, 108, 113, 118, 123];

    const result = calculateATR(highs, lows, closes, 2);

    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(isNaN(result[2])).toBe(false);
    expect(isNaN(result[3])).toBe(false);
    expect(isNaN(result[4])).toBe(false);
  });
});

describe('calculateAllATRs', () => {
  test('should_calculate_atr_for_all_three_periods', () => {
    const csvData: CsvRow[] = Array(30).fill(0).map((_, i) => ({
      date: `2024-01-${i + 1}`,
      time: 100 + i,
      high: 105 + i,
      low: 95 + i,
      close: 102 + i,
          }));

    const result = calculateAllATRs(csvData);

    expect(result.size).toBe(3);
    expect(result.has(10)).toBe(true);
    expect(result.has(14)).toBe(true);
    expect(result.has(20)).toBe(true);
  });

  test('should_return_arrays_matching_input_length', () => {
    const csvData: CsvRow[] = Array(50).fill(0).map((_, i) => ({
      date: `2024-01-${i + 1}`,
      time: 100 + i,
      high: 105 + i,
      low: 95 + i,
      close: 102 + i,
          }));

    const result = calculateAllATRs(csvData);

    expect(result.get(10)?.length).toBe(50);
    expect(result.get(14)?.length).toBe(50);
    expect(result.get(20)?.length).toBe(50);
  });

  test('should_have_nan_values_until_period_reached', () => {
    const csvData: CsvRow[] = Array(25).fill(0).map((_, i) => ({
      date: `2024-01-${i + 1}`,
      time: 100 + i,
      high: 105 + i,
      low: 95 + i,
      close: 102 + i,
          }));

    const result = calculateAllATRs(csvData);

    const atr10 = result.get(10)!;
    const atr14 = result.get(14)!;
    const atr20 = result.get(20)!;

    for (let i = 0; i < 10; i++) {
      expect(isNaN(atr10[i])).toBe(true);
    }
    expect(isNaN(atr10[10])).toBe(false);

    for (let i = 0; i < 14; i++) {
      expect(isNaN(atr14[i])).toBe(true);
    }
    expect(isNaN(atr14[14])).toBe(false);

    for (let i = 0; i < 20; i++) {
      expect(isNaN(atr20[i])).toBe(true);
    }
    expect(isNaN(atr20[20])).toBe(false);
  });

  test('should_handle_minimal_dataset', () => {
    const csvData: CsvRow[] = Array(25).fill(0).map((_, i) => ({
      date: `2024-01-${i + 1}`,
      time: 100,
      high: 105,
      low: 95,
      close: 102,
          }));

    const result = calculateAllATRs(csvData);

    expect(result.size).toBe(3);
    expect(result.get(10)?.length).toBe(25);
    expect(result.get(14)?.length).toBe(25);
    expect(result.get(20)?.length).toBe(25);
  });

  test('should_handle_high_volatility_data', () => {
    const csvData: CsvRow[] = Array(30).fill(0).map((_, i) => ({
      date: `2024-01-${i + 1}`,
      time: 100 + (i % 2 === 0 ? 10 : -10),
      high: 110 + (i % 2 === 0 ? 10 : -10),
      low: 90 + (i % 2 === 0 ? 10 : -10),
      close: 105 + (i % 2 === 0 ? 10 : -10),
          }));

    const result = calculateAllATRs(csvData);

    const atr10 = result.get(10)!;
    const atr14 = result.get(14)!;
    const atr20 = result.get(20)!;

    expect(atr10[10]).toBeGreaterThan(0);
    expect(atr14[14]).toBeGreaterThan(0);
    expect(atr20[20]).toBeGreaterThan(0);
  });

  test('should_handle_low_volatility_data', () => {
    const csvData: CsvRow[] = Array(30).fill(0).map((_, i) => ({
      date: `2024-01-${i + 1}`,
      time: 100,
      high: 100.1,
      low: 99.9,
      close: 100,
          }));

    const result = calculateAllATRs(csvData);

    const atr10 = result.get(10)!;
    const atr14 = result.get(14)!;
    const atr20 = result.get(20)!;

    expect(atr10[10]).toBeCloseTo(0.2, 1);
    expect(atr14[14]).toBeCloseTo(0.2, 1);
    expect(atr20[20]).toBeCloseTo(0.2, 1);
  });

  test('should_handle_single_row', () => {
    const csvData: CsvRow[] = [{
      date: '2024-01-01',
      time: 100,
      high: 105,
      low: 95,
      close: 102,
          }];

    const result = calculateAllATRs(csvData);

    expect(result.size).toBe(3);
    expect(result.get(10)?.length).toBe(1);
    expect(result.get(14)?.length).toBe(1);
    expect(result.get(20)?.length).toBe(1);
  });

  test('should_use_correct_ohlc_values', () => {
    const csvData: CsvRow[] = [
      { date: '2024-01-01', time: 100, high: 105, low: 95, close: 102, RSI: 1000 },
      { date: '2024-01-02', time: 102, high: 108, low: 100, close: 106, RSI: 1000 },
      { date: '2024-01-03', time: 106, high: 112, low: 104, close: 110, RSI: 1000 },
    ];

    const result = calculateAllATRs(csvData);

    const atr10 = result.get(10)!;

    expect(atr10[0]).toBeNaN();
    expect(atr10[1]).toBeNaN();
    expect(atr10[2]).toBeNaN();
  });

  test('should_calculate_different_values_for_different_periods', () => {
    const csvData: CsvRow[] = Array(30).fill(0).map((_, i) => {
      const variation = Math.sin(i * 0.5) * 20;
      return {
        date: `2024-01-${i + 1}`,
        time: 100 + variation,
        high: 110 + variation,
        low: 90 + variation,
        close: 105 + variation,
              };
    });

    const result = calculateAllATRs(csvData);

    const atr10 = result.get(10)!;
    const atr14 = result.get(14)!;
    const atr20 = result.get(20)!;

    expect(atr10[25]).not.toBe(atr14[25]);
    expect(atr14[25]).not.toBe(atr20[25]);
    expect(atr10[25]).not.toBe(atr20[25]);
  });

  test('should_handle_gaps_and_volatility', () => {
    const csvData: CsvRow[] = [
      { date: '2024-01-01', time: 100, high: 105, low: 95, close: 102, RSI: 1000 },
      { date: '2024-01-02', time: 120, high: 125, low: 118, close: 122, RSI: 1000 },
      { date: '2024-01-03', time: 110, high: 115, low: 105, close: 112, RSI: 1000 },
    ];

    const result = calculateAllATRs(csvData);

    expect(result.size).toBe(3);
    expect(result.get(10)).toBeDefined();
  });
});
