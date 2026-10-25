import { describe, expect, test } from 'bun:test';
import {
  determinePositionType,
  determineAction,
  calculateLongProfit,
  calculateShortProfit,
  calculatePositionProfit,
  openPosition,
} from './position-manager';
import type { Position, PositionAction, PositionType } from './types';

const position = (type: PositionType, entryValue = 1000): Position => ({
  type,
  entryPrice: 100,
  entryValue,
  leverage: 2,
});

describe('determinePositionType', () => {
  test.each([
    { close: 105, sma: 100, expected: 'LONG' },
    { close: 95, sma: 100, expected: 'SHORT' },
    { close: 100, sma: 100, expected: 'NONE' },
    { close: -50, sma: -100, expected: 'LONG' },
    { close: -150, sma: -100, expected: 'SHORT' },
  ] as const)('should_return_$expected_when_close_$close_vs_sma_$sma', ({ close, sma, expected }) => {
    expect(determinePositionType(close, sma)).toBe(expected);
  });
});

describe('determineAction', () => {
  const cases: { current: PositionType | null; target: PositionType; expected: PositionAction }[] = [
    { current: null, target: 'LONG', expected: 'OPEN_LONG' },
    { current: null, target: 'SHORT', expected: 'OPEN_SHORT' },
    { current: null, target: 'NONE', expected: 'HOLD' },
    { current: 'NONE', target: 'LONG', expected: 'OPEN_LONG' },
    { current: 'NONE', target: 'SHORT', expected: 'OPEN_SHORT' },
    { current: 'NONE', target: 'NONE', expected: 'HOLD' },
    { current: 'LONG', target: 'LONG', expected: 'HOLD' },
    { current: 'LONG', target: 'NONE', expected: 'CLOSE_LONG' },
    { current: 'LONG', target: 'SHORT', expected: 'TRANSITION_LONG_TO_SHORT' },
    { current: 'SHORT', target: 'SHORT', expected: 'HOLD' },
    { current: 'SHORT', target: 'NONE', expected: 'CLOSE_SHORT' },
    { current: 'SHORT', target: 'LONG', expected: 'TRANSITION_SHORT_TO_LONG' },
  ];

  test.each(cases)('should_return_$expected_when_current_$current_and_target_$target', ({ current, target, expected }) => {
    expect(determineAction(current && position(current), target)).toBe(expected);
  });
});

describe('calculateLongProfit', () => {
  test.each([
    { name: 'profit_when_price_increases', entry: 100, exit: 110, value: 1000, expected: 100 },
    { name: 'loss_when_price_decreases', entry: 100, exit: 90, value: 1000, expected: -100 },
    { name: 'zero_when_price_unchanged', entry: 100, exit: 100, value: 1000, expected: 0 },
    { name: 'scales_with_leveraged_value', entry: 100, exit: 110, value: 3000, expected: 300 },
  ])('should_return_$name', ({ entry, exit, value, expected }) => {
    expect(calculateLongProfit(entry, exit, value)).toBeCloseTo(expected, 10);
  });
});

describe('calculateShortProfit', () => {
  test.each([
    { name: 'profit_when_price_decreases', entry: 100, exit: 90, value: 1000, expected: 100 },
    { name: 'loss_when_price_increases', entry: 100, exit: 110, value: 1000, expected: -100 },
    { name: 'zero_when_price_unchanged', entry: 100, exit: 100, value: 1000, expected: 0 },
    { name: 'scales_with_leveraged_value', entry: 100, exit: 90, value: 3000, expected: 300 },
  ])('should_return_$name', ({ entry, exit, value, expected }) => {
    expect(calculateShortProfit(entry, exit, value)).toBeCloseTo(expected, 10);
  });
});

describe('calculatePositionProfit', () => {
  test.each([
    { type: 'LONG', exit: 110, expected: 100 },
    { type: 'SHORT', exit: 90, expected: 100 },
    { type: 'LONG', exit: 95, expected: -50 },
    { type: 'SHORT', exit: 105, expected: -50 },
    { type: 'NONE', exit: 110, expected: 0 },
  ] as const)('should_return_$expected_for_$type_exiting_at_$exit', ({ type, exit, expected }) => {
    expect(calculatePositionProfit(position(type), exit)).toBeCloseTo(expected, 10);
  });
});

describe('openPosition', () => {
  test.each([
    { type: 'LONG', balance: 1000, leverage: 2, entryValue: 2000 },
    { type: 'SHORT', balance: 1000, leverage: 2.5, entryValue: 2500 },
    { type: 'NONE', balance: 1000, leverage: 1, entryValue: 1000 },
  ] as const)('should_open_$type_with_entry_value_balance_times_leverage', ({ type, balance, leverage, entryValue }) => {
    expect(openPosition(type, 123.45, balance, leverage)).toEqual({
      type,
      entryPrice: 123.45,
      entryValue,
      leverage,
    });
  });
});
