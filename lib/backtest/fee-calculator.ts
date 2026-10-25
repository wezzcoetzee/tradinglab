import { PERCENTAGE_DIVISOR } from './constants';

export function calculateTradeFee(
  balance: number,
  leverage: number,
  feeRate: number
): number {
  return (balance * leverage * feeRate) / PERCENTAGE_DIVISOR;
}
