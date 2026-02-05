import { describe, expect, test } from 'bun:test';
import { calculateBuyAndHoldBaseline } from './baseline-calculator';
import type { CsvRow } from '../types';
import { WARMUP_DAYS } from './constants';

function generateCsvData(days: number, startPrice: number = 100): CsvRow[] {
  return Array.from({ length: days }, (_, i) => ({
    time: i + 1,
    high: startPrice + i + 2,
    low: startPrice + i - 2,
    close: startPrice + i,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  }));
}

describe('calculateBuyAndHoldBaseline', () => {
  test('should_use_warmup_day_as_purchase_date', () => {
    // #given
    const csvData = generateCsvData(200);

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, 1000);

    // #then
    expect(baseline!.purchaseDate).toBe(csvData[WARMUP_DAYS - 1].date);
    expect(baseline!.purchasePrice).toBe(csvData[WARMUP_DAYS - 1].close);
  });

  test('should_use_last_day_as_final_date', () => {
    // #given
    const csvData = generateCsvData(200);
    const lastIndex = csvData.length - 1;

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, 1000);

    // #then
    expect(baseline!.finalDate).toBe(csvData[lastIndex].date);
    expect(baseline!.finalPrice).toBe(csvData[lastIndex].close);
  });

  test('should_calculate_final_value_correctly', () => {
    // #given
    const csvData = generateCsvData(200, 100);
    const startingCapital = 1000;
    const purchasePrice = csvData[WARMUP_DAYS - 1].close;
    const finalPrice = csvData[csvData.length - 1].close;
    const expectedShares = startingCapital / purchasePrice;
    const expectedFinalValue = expectedShares * finalPrice;

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, startingCapital);

    // #then
    expect(baseline!.finalValue).toBeCloseTo(expectedFinalValue, 6);
  });

  test('should_calculate_percent_gain_correctly', () => {
    // #given
    const csvData = generateCsvData(200, 100);
    const startingCapital = 1000;
    const purchasePrice = csvData[WARMUP_DAYS - 1].close;
    const finalPrice = csvData[csvData.length - 1].close;
    const sharesAcquired = startingCapital / purchasePrice;
    const finalValue = sharesAcquired * finalPrice;
    const expectedPercentGain = ((finalValue - startingCapital) / startingCapital) * 100;

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, startingCapital);

    // #then
    expect(baseline!.percentGain).toBeCloseTo(expectedPercentGain, 6);
  });

  test('should_preserve_starting_capital', () => {
    // #given
    const csvData = generateCsvData(200);
    const startingCapital = 5000;

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, startingCapital);

    // #then
    expect(baseline!.startingCapital).toBe(5000);
  });

  test('should_handle_price_decrease', () => {
    // #given: price decreases over time
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 202 - i,
      low: 198 - i,
      close: 200 - i,
            date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }));
    const startingCapital = 1000;

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, startingCapital);

    // #then
    expect(baseline!.percentGain).toBeLessThan(0);
    expect(baseline!.finalValue).toBeLessThan(startingCapital);
  });

  test('should_handle_flat_price', () => {
    // #given: price stays constant
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 102,
      low: 98,
      close: 100,
            date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }));
    const startingCapital = 1000;

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, startingCapital);

    // #then
    expect(baseline!.percentGain).toBeCloseTo(0, 6);
    expect(baseline!.finalValue).toBeCloseTo(startingCapital, 6);
  });

  test('should_handle_minimal_dataset', () => {
    // #given
    const csvData = generateCsvData(WARMUP_DAYS + 1);
    const startingCapital = 1000;

    // #when
    const baseline = calculateBuyAndHoldBaseline(csvData, startingCapital);

    // #then
    expect(baseline!.purchaseDate).toBe(csvData[WARMUP_DAYS - 1].date);
    expect(baseline!.finalDate).toBe(csvData[WARMUP_DAYS].date);
  });

  test('should_handle_different_starting_capitals', () => {
    // #given
    const csvData = generateCsvData(200, 100);

    // #when
    const baseline1000 = calculateBuyAndHoldBaseline(csvData, 1000);
    const baseline5000 = calculateBuyAndHoldBaseline(csvData, 5000);

    // #then: same percent gain regardless of capital
    expect(baseline1000!.percentGain).toBeCloseTo(baseline5000!.percentGain, 6);
    expect(baseline5000!.finalValue).toBe(baseline1000!.finalValue * 5);
  });
});
