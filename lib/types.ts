export interface CsvRow {
  time: number;
  high: number;
  low: number;
  close: number;
  RSI: number;
  date: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: CsvRow[];
  rowCount?: number;
}

export const REQUIRED_HEADERS = ['time', 'high', 'low', 'close', 'RSI', 'date'] as const;
export const MIN_DATA_ROWS = 160;
