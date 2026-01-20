/**
 * ATR (Average True Range) calculation using close-only approximation.
 * Since database only stores closePrice (no OHLC), we use:
 * True Range = abs(close - prev_close)
 *
 * This is valid for crypto markets (24/7 trading, minimal gaps).
 */

/**
 * Calculate ATR values using Wilder's RMA smoothing.
 * @param closePrices Array of close prices
 * @param period ATR period (typically 14)
 * @returns Array of ATR values (null for first `period` entries)
 */
export function calculateATR(
  closePrices: number[],
  period: number
): (number | null)[] {
  if (closePrices.length < 2) {
    return closePrices.map(() => null);
  }

  const atrValues: (number | null)[] = new Array(closePrices.length).fill(null);
  const trueRanges: number[] = [];

  for (let i = 1; i < closePrices.length; i++) {
    const tr = Math.abs(closePrices[i] - closePrices[i - 1]);
    trueRanges.push(tr);

    if (i < period) {
      continue;
    }

    if (i === period) {
      const sum = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
      atrValues[i] = sum / period;
    } else {
      const prevATR = atrValues[i - 1];
      if (prevATR !== null) {
        atrValues[i] = (prevATR * (period - 1) + tr) / period;
      }
    }
  }

  return atrValues;
}
