import { describe, expect, test } from 'bun:test';
import { validateCsv } from './csv-validator';
import type { CsvRow } from './types';

describe('validateCsv', () => {
  describe('input validation', () => {
    test('should_reject_empty_array', () => {
      // #given
      const input: unknown[] = [];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSV file is empty or invalid');
    });

    test('should_reject_non_array_input', () => {
      // #given
      const input = 'not an array' as unknown as unknown[];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSV file is empty or invalid');
    });

    test('should_reject_null_input', () => {
      // #given
      const input = null as unknown as unknown[];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSV file is empty or invalid');
    });

    test('should_reject_first_row_not_an_object', () => {
      // #given
      const input = ['string'] as unknown[];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid CSV structure');
    });

    test('should_reject_first_row_null', () => {
      // #given
      const input = [null] as unknown[];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid CSV structure');
    });
  });

  describe('header validation', () => {
    test('should_reject_missing_high_header', () => {
      // #given
      const input = [{ low: 100, close: 100, date: '01/01/2024' }];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid headers. Expected: high, low, close, date');
    });

    test('should_reject_missing_low_header', () => {
      // #given
      const input = [{ high: 100, close: 100, date: '01/01/2024' }];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid headers. Expected: high, low, close, date');
    });

    test('should_reject_missing_close_header', () => {
      // #given
      const input = [{ high: 100, low: 100, date: '01/01/2024' }];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid headers. Expected: high, low, close, date');
    });

    test('should_reject_missing_date_header', () => {
      // #given
      const input = [{ high: 100, low: 100, close: 100 }];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid headers. Expected: high, low, close, date');
    });

    test('should_accept_case_insensitive_headers', () => {
      // #given
      const input = Array(160)
        .fill(null)
        .map(() => ({
          high: 100,
          low: 90,
          close: 95,
          date: '01/01/2024',
          time: 1640995200,
        }));

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('row count validation', () => {
    test('should_reject_insufficient_rows_with_1_row', () => {
      // #given
      const input = [{ high: 100, low: 90, close: 95, date: '01/01/2024' }];

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Insufficient data rows. Expected at least 160, got 1');
    });

    test('should_reject_insufficient_rows_with_159_rows', () => {
      // #given
      const input = Array(159).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Insufficient data rows. Expected at least 160, got 159');
    });

    test('should_accept_exactly_160_rows', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
      expect(result.rowCount).toBe(160);
    });

    test('should_accept_more_than_160_rows', () => {
      // #given
      const input = Array(200).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
      expect(result.rowCount).toBe(200);
    });
  });

  describe('row value validation', () => {
    test('should_reject_missing_high_value', () => {
      // #given
      const input = Array(160)
        .fill(null)
        .map((_, i) => ({
          high: i === 0 ? undefined : 100,
          low: 90,
          close: 95,
          date: '01/01/2024',
          time: 1640995200,
        }));

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Missing value for 'high' at row 1");
    });

    test('should_reject_null_value', () => {
      // #given
      const input = Array(160)
        .fill(null)
        .map((_, i) => ({
          high: 100,
          low: i === 5 ? null : 90,
          close: 95,
          date: '01/01/2024',
          time: 1640995200,
        }));

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Missing value for 'low' at row 6");
    });

    test('should_reject_empty_string_value', () => {
      // #given
      const input = Array(160)
        .fill(null)
        .map((_, i) => ({
          high: 100,
          low: 90,
          close: i === 10 ? '' : 95,
          date: '01/01/2024',
          time: 1640995200,
        }));

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Missing value for 'close' at row 11");
    });
  });

  describe('date format validation', () => {
    test('should_reject_invalid_date_format_yyyy_mm_dd', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '2024-01-01',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'Invalid date format at row 1. Expected DD/MM/YYYY, got: 2024-01-01'
      );
    });

    test('should_reject_date_without_slashes', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01012024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'Invalid date format at row 1. Expected DD/MM/YYYY, got: 01012024'
      );
    });

    test('should_reject_non_string_date', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: 12345,
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid date format at row 1');
    });

    test('should_accept_single_digit_day', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '1/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_single_digit_month', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01/1/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_single_digit_day_and_month', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '1/1/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('numeric value validation', () => {
    test('should_reject_non_numeric_high', () => {
      // #given
      const input = Array(160).fill({
        high: 'not a number',
        low: 90,
        close: 95,
        date: '01/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid number for 'high' at row 1. Got: not a number");
    });

    test('should_reject_non_numeric_low', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 'abc',
        close: 95,
        date: '01/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid number for 'low' at row 1. Got: abc");
    });

    test('should_reject_non_numeric_close', () => {
      // #given
      const input = Array(160)
        .fill(null)
        .map((_, i) => ({
          high: 100,
          low: 90,
          close: i === 0 ? {} : 95,
          date: '01/01/2024',
          time: 1640995200,
        }));

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid number for 'close' at row 1");
    });

    test('should_accept_string_numbers', () => {
      // #given
      const input = Array(160).fill({
        high: '100.5',
        low: '90.2',
        close: '95.8',
        date: '01/01/2024',
        time: '1640995200',
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_zero_values', () => {
      // #given
      const input = Array(160).fill({
        high: 0,
        low: 0,
        close: 0,
        date: '01/01/2024',
        time: 0,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_negative_values', () => {
      // #given
      const input = Array(160).fill({
        high: -100,
        low: -110,
        close: -105,
        date: '01/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });

    test('should_accept_decimal_values', () => {
      // #given
      const input = Array(160).fill({
        high: 100.123456,
        low: 90.987654,
        close: 95.5,
        date: '01/01/2024',
        time: 1640995200.5,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
    });
  });

  describe('successful validation', () => {
    test('should_return_valid_result_with_data', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01/01/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(160);
      expect(result.rowCount).toBe(160);
      expect(result.error).toBeUndefined();
    });

    test('should_coerce_time_field_to_number', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01/01/2024',
        time: '1640995200',
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
      expect(result.data?.[0].time).toBe(1640995200);
      expect(typeof result.data?.[0].time).toBe('number');
    });

    test('should_return_csv_row_structure', () => {
      // #given
      const input = Array(160).fill({
        high: 100.5,
        low: 90.2,
        close: 95.8,
        date: '15/03/2024',
        time: 1640995200,
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
      const row = result.data?.[0] as CsvRow;
      expect(row.time).toBe(1640995200);
      expect(row.high).toBe(100.5);
      expect(row.low).toBe(90.2);
      expect(row.close).toBe(95.8);
      expect(row.date).toBe('15/03/2024');
    });

    test('should_handle_extra_columns', () => {
      // #given
      const input = Array(160).fill({
        high: 100,
        low: 90,
        close: 95,
        date: '01/01/2024',
        time: 1640995200,
        volume: 100000,
        extraField: 'ignored',
      });

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
      expect(result.data?.length).toBe(160);
    });

    test('should_preserve_different_values_across_rows', () => {
      // #given
      const input = Array(160)
        .fill(null)
        .map((_, i) => ({
          high: 100 + i,
          low: 90 + i,
          close: 95 + i,
          date: `${(i % 28) + 1}/01/2024`,
          time: 1640995200 + i * 86400,
        }));

      // #when
      const result = validateCsv(input);

      // #then
      expect(result.valid).toBe(true);
      expect(result.data?.[0].high).toBe(100);
      expect(result.data?.[159].high).toBe(259);
      expect(result.data?.[0].time).toBe(1640995200);
      expect(result.data?.[159].time).toBe(1640995200 + 159 * 86400);
    });
  });
});
