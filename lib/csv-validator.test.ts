import { describe, expect, test } from 'bun:test';
import { validateCsv } from './csv-validator';
import { MIN_DATA_ROWS } from './types';

const goodRow = { high: 100, low: 90, close: 95, date: '01/01/2024' };

const rows = (overrides: Record<string, unknown> = {}, count = MIN_DATA_ROWS) =>
  Array(count).fill({ ...goodRow, ...overrides });

/** Valid rows except row `index`, which gets `overrides`. */
const rowsWithBadRow = (index: number, overrides: Record<string, unknown>) =>
  rows().map((row, i) => (i === index ? { ...row, ...overrides } : row));

describe('validateCsv', () => {
  describe('input validation', () => {
    test.each<[string, unknown, string]>([
      ['empty_array', [], 'CSV file is empty or invalid'],
      ['non_array_input', 'not an array', 'CSV file is empty or invalid'],
      ['null_input', null, 'CSV file is empty or invalid'],
      ['first_row_not_an_object', ['string'], 'Invalid CSV structure'],
      ['first_row_null', [null], 'Invalid CSV structure'],
    ])('should_reject_%s', (_name, input, error) => {
      const result = validateCsv(input as unknown[]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('header validation', () => {
    test.each(['high', 'low', 'close', 'date'])('should_reject_missing_%s_header', (header) => {
      const { [header]: _removed, ...row } = goodRow as Record<string, unknown>;
      const result = validateCsv([row]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid headers. Expected: high, low, close, date');
    });

    test('should_accept_case_insensitive_headers', () => {
      const input = rows().map(() => ({ High: 100, LOW: 90, Close: 95, Date: '01/01/2024' }));
      expect(validateCsv(input).valid).toBe(true);
    });
  });

  describe('row count validation', () => {
    test.each([1, MIN_DATA_ROWS - 1])('should_reject_%p_rows', (count) => {
      const result = validateCsv(rows({}, count));
      expect(result.valid).toBe(false);
      expect(result.error).toBe(`Insufficient data rows. Expected at least ${MIN_DATA_ROWS}, got ${count}`);
    });

    test.each([MIN_DATA_ROWS, MIN_DATA_ROWS + 40])('should_accept_%p_rows', (count) => {
      const result = validateCsv(rows({}, count));
      expect(result.valid).toBe(true);
      expect(result.rowCount).toBe(count);
    });
  });

  describe('row value validation', () => {
    test.each<[string, unknown, number, string]>([
      ['undefined', undefined, 0, "Missing value for 'high' at row 1"],
      ['null', null, 5, "Missing value for 'high' at row 6"],
      ['empty_string', '', 10, "Missing value for 'high' at row 11"],
    ])('should_reject_%s_value_and_report_row', (_name, value, index, error) => {
      const result = validateCsv(rowsWithBadRow(index, { high: value }));
      expect(result.valid).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('date format validation', () => {
    test.each([
      ['yyyy_mm_dd', '2024-01-01'],
      ['no_slashes', '01012024'],
      ['non_string', 12345],
    ])('should_reject_%s_date', (_name, date) => {
      const result = validateCsv(rows({ date }));
      expect(result.valid).toBe(false);
      expect(result.error).toBe(`Invalid date format at row 1. Expected DD/MM/YYYY, got: ${date}`);
    });

    test.each(['1/01/2024', '01/1/2024', '1/1/2024'])('should_accept_%s', (date) => {
      expect(validateCsv(rows({ date })).valid).toBe(true);
    });
  });

  describe('numeric value validation', () => {
    test('should_reject_non_numeric_value', () => {
      const result = validateCsv(rows({ low: 'abc' }));
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid number for 'low' at row 1. Got: abc");
    });

    test.each([0, -100])('should_reject_non_positive_price_%p', (value) => {
      const result = validateCsv(rows({ high: value }));
      expect(result.valid).toBe(false);
      expect(result.error).toBe(`Price for 'high' must be positive at row 1. Got: ${value}`);
    });

    test('should_accept_string_numbers', () => {
      expect(validateCsv(rows({ high: '100.5', low: '90.2', close: '95.8' })).valid).toBe(true);
    });
  });

  describe('successful validation', () => {
    test('should_return_numeric_rows_ignoring_extra_columns', () => {
      const result = validateCsv(
        rows({ high: '100.5', low: 90.2, close: 95.8, date: '15/03/2024', volume: 100000 })
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.rowCount).toBe(MIN_DATA_ROWS);
      expect(result.data?.[0]).toEqual({ high: 100.5, low: 90.2, close: 95.8, date: '15/03/2024' });
    });

    test('should_preserve_different_values_across_rows', () => {
      const input = rows().map((_, i) => ({ ...goodRow, high: 100 + i }));
      const result = validateCsv(input);
      expect(result.data?.[0].high).toBe(100);
      expect(result.data?.[MIN_DATA_ROWS - 1].high).toBe(100 + MIN_DATA_ROWS - 1);
    });
  });
});
