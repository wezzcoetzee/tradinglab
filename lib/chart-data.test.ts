import { describe, expect, test } from 'bun:test';
import { WARMUP_DAYS } from '@/lib/backtest/constants';
import type { DayResult } from '@/lib/backtest/types';
import { buildChartData } from './chart-data';

function makeDayResult(overrides: Partial<DayResult> & { dayIndex: number; price: number }): DayResult {
  return {
    date: `01/01/2024`,
    sma: 100,
    action: 'HOLD',
    position: null,
    balance: 1000,
    pnl: 0,
    fees: 0,
    isLiquidated: false,
    portfolioValue: 1000,
    ...overrides,
  };
}

describe('buildChartData', () => {
  test('should_filter_warmup_days', () => {
    // #given
    const days: DayResult[] = [
      makeDayResult({ dayIndex: 0, price: 100 }),
      makeDayResult({ dayIndex: WARMUP_DAYS - 1, price: 110 }),
      makeDayResult({ dayIndex: WARMUP_DAYS, price: 120 }),
      makeDayResult({ dayIndex: WARMUP_DAYS + 1, price: 130 }),
    ];

    // #when
    const result = buildChartData(days, 1000, 100, 2000);

    // #then
    expect(result.length).toBe(2);
    expect(result[0].price).toBe(120);
    expect(result[1].price).toBe(130);
  });

  test('should_calculate_buy_hold_values', () => {
    // #given - $1000 capital, $50 purchase price = 20 shares
    const days: DayResult[] = [
      makeDayResult({ dayIndex: WARMUP_DAYS, price: 100 }),
      makeDayResult({ dayIndex: WARMUP_DAYS + 1, price: 200 }),
    ];

    // #when
    const result = buildChartData(days, 1000, 50, 2000);

    // #then
    expect(result[0].buyHoldValue).toBe(2000);
    expect(result[1].buyHoldValue).toBe(4000);
  });

  test('should_return_all_points_when_under_threshold', () => {
    const days: DayResult[] = Array.from({ length: 5 }, (_, i) =>
      makeDayResult({ dayIndex: WARMUP_DAYS + i, price: 100 + i })
    );

    const result = buildChartData(days, 1000, 100, 2000);
    expect(result.length).toBe(5);
  });

  test('should_downsample_when_over_threshold', () => {
    const days: DayResult[] = Array.from({ length: 100 }, (_, i) =>
      makeDayResult({ dayIndex: WARMUP_DAYS + i, price: 100 + i })
    );

    const result = buildChartData(days, 1000, 100, 20);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result.length).toBeGreaterThanOrEqual(20);
  });

  test('should_preserve_atr_stop_points_after_downsampling', () => {
    // #given - 100 points, one ATR stop in the middle
    const days: DayResult[] = Array.from({ length: 100 }, (_, i) =>
      makeDayResult({
        dayIndex: WARMUP_DAYS + i,
        price: 100 + i,
        action: i === 50 ? 'ATR_PARTIAL_CLOSE' : 'HOLD',
      })
    );

    // #when
    const result = buildChartData(days, 1000, 100, 10);

    // #then
    const hasAtrStop = result.some((p) => p.isAtrStop);
    expect(hasAtrStop).toBe(true);
  });

  test('should_map_correct_fields', () => {
    const days: DayResult[] = [
      makeDayResult({
        dayIndex: WARMUP_DAYS,
        price: 150,
        date: '15/06/2024',
        sma: 140,
        portfolioValue: 1200,
        action: 'ATR_PARTIAL_CLOSE',
      }),
    ];

    const result = buildChartData(days, 1000, 100, 2000);

    expect(result[0]).toEqual({
      date: '15/06/2024',
      price: 150,
      sma: 140,
      portfolioValue: 1200,
      buyHoldValue: 1500,
      isAtrStop: true,
    });
  });
});
