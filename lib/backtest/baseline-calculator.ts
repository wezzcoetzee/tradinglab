import type { CsvRow } from '../types';
import type { BuyAndHoldBaseline } from './types';
import { PERCENTAGE_DIVISOR, WARMUP_DAYS } from './constants';

export function calculateBuyAndHoldBaseline(
  csvData: CsvRow[],
  startingCapital: number
): BuyAndHoldBaseline | null {
  // Buy on the same close the strategy can first trade on.
  const purchaseIndex = WARMUP_DAYS;
  if (csvData.length <= purchaseIndex) {
    return null;
  }

  const finalIndex = csvData.length - 1;

  const purchasePrice = csvData[purchaseIndex].close;
  const finalPrice = csvData[finalIndex].close;

  const sharesAcquired = startingCapital / purchasePrice;
  const finalValue = sharesAcquired * finalPrice;
  const percentGain = ((finalValue - startingCapital) / startingCapital) * PERCENTAGE_DIVISOR;

  return {
    purchasePrice,
    purchaseDate: csvData[purchaseIndex].date,
    finalPrice,
    finalDate: csvData[finalIndex].date,
    finalValue,
    percentGain,
    startingCapital,
  };
}
