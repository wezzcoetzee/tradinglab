import type { CsvRow, ValidationResult } from './types';
import { REQUIRED_HEADERS, MIN_DATA_ROWS } from './types';

const DATE_REGEX = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

export function validateCsv(parsedData: unknown[]): ValidationResult {
  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    return { valid: false, error: 'CSV file is empty or invalid' };
  }

  const firstRow = parsedData[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return { valid: false, error: 'Invalid CSV structure' };
  }

  const headers = Object.keys(firstRow).map(h => h.toLowerCase());
  const requiredHeaders = REQUIRED_HEADERS.map(h => h.toLowerCase());

  if (!requiredHeaders.every(h => headers.includes(h))) {
    return {
      valid: false,
      error: `Invalid headers. Expected: ${REQUIRED_HEADERS.join(', ')}`
    };
  }

  if (parsedData.length < MIN_DATA_ROWS) {
    return {
      valid: false,
      error: `Insufficient data rows. Expected at least ${MIN_DATA_ROWS}, got ${parsedData.length}`
    };
  }

  const validatedRows: CsvRow[] = [];

  for (let i = 0; i < parsedData.length; i++) {
    const row = parsedData[i] as Record<string, unknown>;
    const rowNum = i + 1;

    for (const header of REQUIRED_HEADERS) {
      const value = row[header];

      if (value === undefined || value === null || value === '') {
        return {
          valid: false,
          error: `Missing value for '${header}' at row ${rowNum}`
        };
      }

      if (header === 'date') {
        if (typeof value !== 'string' || !DATE_REGEX.test(value)) {
          return {
            valid: false,
            error: `Invalid date format at row ${rowNum}. Expected DD/MM/YYYY, got: ${value}`
          };
        }
      } else {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return {
            valid: false,
            error: `Invalid number for '${header}' at row ${rowNum}. Got: ${value}`
          };
        }
      }
    }

    validatedRows.push({
      time: Number(row.time),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      RSI: Number(row.RSI),
      date: row.date as string,
    });
  }

  return {
    valid: true,
    data: validatedRows,
    rowCount: validatedRows.length
  };
}
