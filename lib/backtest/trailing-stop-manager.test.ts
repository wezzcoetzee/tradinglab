import { describe, expect, test } from 'bun:test';
import type { CsvRow } from '../types';
import type { Position, PositionType, TrailingStopState } from './types';
import {
  executePartialClose,
  initTrailingStop,
  shouldTriggerStop,
  updateExtremePrice,
} from './trailing-stop-manager';

const row = (high: number, low: number): CsvRow => ({ date: '2024-01-01', high, low, close: (high + low) / 2 });
const state = (extremePrice: number, triggered = false): TrailingStopState => ({ extremePrice, triggered });

describe('initTrailingStop', () => {
  test.each([
    { type: 'LONG', expected: 105 },
    { type: 'SHORT', expected: 95 },
  ] as const)('should_seed_extreme_from_$expected_for_$type', ({ type, expected }) => {
    expect(initTrailingStop(row(105, 95), type)).toEqual({ extremePrice: expected, triggered: false });
  });
});

describe('updateExtremePrice', () => {
  test.each([
    { type: 'LONG', extreme: 100, high: 105, low: 95, expected: 105 },
    { type: 'SHORT', extreme: 100, high: 105, low: 95, expected: 95 },
  ] as const)('should_move_extreme_to_$expected_for_$type_when_new_extreme_reached', ({ type, extreme, high, low, expected }) => {
    const initial = state(extreme);

    const result = updateExtremePrice(initial, row(high, low), type);

    expect(result).toEqual({ extremePrice: expected, triggered: false });
    expect(result).not.toBe(initial);
  });

  test.each([
    { name: 'long_high_lower', type: 'LONG', extreme: 100, high: 95, low: 90 },
    { name: 'long_high_equal', type: 'LONG', extreme: 100, high: 100, low: 90 },
    { name: 'short_low_higher', type: 'SHORT', extreme: 100, high: 115, low: 105 },
    { name: 'short_low_equal', type: 'SHORT', extreme: 100, high: 115, low: 100 },
  ] as const)('should_return_same_state_when_$name', ({ type, extreme, high, low }) => {
    const initial = state(extreme);

    expect(updateExtremePrice(initial, row(high, low), type)).toBe(initial);
  });

  test.each(['LONG', 'SHORT'] as const)('should_return_same_state_when_already_triggered_for_%s', (type) => {
    const initial = state(100, true);

    expect(updateExtremePrice(initial, row(120, 80), type)).toBe(initial);
  });
});

describe('shouldTriggerStop', () => {
  // stop distance = atr 5 * multiplier 2 = 10; long stop at 90, short stop at 110
  test.each([
    { name: 'below_stop_level', type: 'LONG', price: 85, expected: true },
    { name: 'exactly_at_stop_level', type: 'LONG', price: 90, expected: true },
    { name: 'above_stop_level', type: 'LONG', price: 95, expected: false },
    { name: 'above_stop_level', type: 'SHORT', price: 115, expected: true },
    { name: 'exactly_at_stop_level', type: 'SHORT', price: 110, expected: true },
    { name: 'below_stop_level', type: 'SHORT', price: 105, expected: false },
  ] as const)('should_return_$expected_for_$type_when_price_$name', ({ type, price, expected }) => {
    expect(shouldTriggerStop(state(100), price, 5, 2, type)).toBe(expected);
  });

  test.each(['LONG', 'SHORT'] as const)('should_not_trigger_when_already_triggered_for_%s', (type) => {
    expect(shouldTriggerStop(state(100, true), type === 'LONG' ? 0 : 1000, 5, 2, type)).toBe(false);
  });

  test.each(['LONG', 'SHORT'] as const)('should_not_trigger_when_atr_is_nan_for_%s', (type) => {
    expect(shouldTriggerStop(state(100), type === 'LONG' ? 0 : 1000, NaN, 2, type)).toBe(false);
  });

  test.each([2, 2.5, 3, 3.5, 4])('should_scale_stop_distance_with_multiplier_%d', (multiplier) => {
    const stopPrice = 100 - 5 * multiplier;

    expect(shouldTriggerStop(state(100), stopPrice, 5, multiplier, 'LONG')).toBe(true);
    expect(shouldTriggerStop(state(100), stopPrice + 0.01, 5, multiplier, 'LONG')).toBe(false);
    expect(shouldTriggerStop(state(100), 200 - stopPrice, 5, multiplier, 'SHORT')).toBe(true);
    expect(shouldTriggerStop(state(100), 200 - stopPrice - 0.01, 5, multiplier, 'SHORT')).toBe(false);
  });
});

describe('executePartialClose', () => {
  const makePosition = (type: PositionType, overrides: Partial<Position> = {}): Position => ({
    type,
    entryPrice: 100,
    entryValue: 2000,
    leverage: 2,
    ...overrides,
  });

  // fees = closedCapital * leverage(2) * 0.1 / 100
  test.each([
    { type: 'LONG', price: 110, percent: 10, remaining: 1800, capital: 100, pnl: 20, fees: 0.2, sideline: 119.8 },
    { type: 'LONG', price: 110, percent: 25, remaining: 1500, capital: 250, pnl: 50, fees: 0.5, sideline: 299.5 },
    { type: 'LONG', price: 110, percent: 50, remaining: 1000, capital: 500, pnl: 100, fees: 1, sideline: 599 },
    { type: 'LONG', price: 110, percent: 100, remaining: 0, capital: 1000, pnl: 200, fees: 2, sideline: 1198 },
    { type: 'LONG', price: 95, percent: 50, remaining: 1000, capital: 500, pnl: -50, fees: 1, sideline: 449 },
    { type: 'SHORT', price: 90, percent: 50, remaining: 1000, capital: 500, pnl: 100, fees: 1, sideline: 599 },
    { type: 'SHORT', price: 90, percent: 100, remaining: 0, capital: 1000, pnl: 200, fees: 2, sideline: 1198 },
    { type: 'SHORT', price: 105, percent: 50, remaining: 1000, capital: 500, pnl: -50, fees: 1, sideline: 449 },
  ] as const)(
    'should_close_$percent_percent_of_$type_at_$price',
    ({ type, price, percent, remaining, capital, pnl, fees, sideline }) => {
      const result = executePartialClose(makePosition(type), price, percent, 0.1);

      expect(result.newPosition.entryValue).toBe(remaining);
      expect(result.closedCapital).toBe(capital);
      expect(result.pnl).toBeCloseTo(pnl, 10);
      expect(result.fees).toBeCloseTo(fees, 10);
      expect(result.sidelineValue).toBeCloseTo(sideline, 10);
    }
  );

  test('should_keep_position_properties_and_mark_trailing_stop_triggered', () => {
    const result = executePartialClose(
      makePosition('LONG', { leverage: 2.5, trailingStop: state(115) }),
      110,
      50,
      0.1
    );

    expect(result.newPosition).toMatchObject({
      type: 'LONG',
      entryPrice: 100,
      leverage: 2.5,
      trailingStop: { extremePrice: 115, triggered: true },
    });
  });

  test('should_seed_trailing_stop_from_price_when_missing', () => {
    const result = executePartialClose(makePosition('LONG'), 110, 50, 0.1);

    expect(result.newPosition.trailingStop).toEqual({ extremePrice: 110, triggered: true });
  });

  test('should_charge_fees_on_notional_value_using_leverage', () => {
    const result = executePartialClose(makePosition('LONG', { entryValue: 3000, leverage: 3 }), 110, 100, 0.1);

    expect(result.closedCapital).toBe(1000);
    expect(result.fees).toBeCloseTo(3, 10); // 1000 * 3 * 0.1 / 100
  });
});
