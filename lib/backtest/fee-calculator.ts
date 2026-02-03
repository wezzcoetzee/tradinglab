import type { PositionAction } from './types';

import { PERCENTAGE_DIVISOR } from './constants';

export function calculateTradeFee(
  balance: number,
  leverage: number,
  feeRate: number
): number {
  return (balance * leverage * leverage * feeRate) / PERCENTAGE_DIVISOR;
}

export function calculateTransitionFees(
  action: PositionAction,
  balance: number,
  currentLeverage: number,
  feeRate: number,
  newLeverage?: number
): number {
  switch (action) {
    case 'OPEN_LONG':
    case 'OPEN_SHORT':
    case 'CLOSE_LONG':
    case 'CLOSE_SHORT':
      return calculateTradeFee(balance, currentLeverage, feeRate);

    case 'TRANSITION_LONG_TO_SHORT':
    case 'TRANSITION_SHORT_TO_LONG':
      if (newLeverage === undefined) {
        throw new Error('newLeverage required for transition actions');
      }
      return (
        calculateTradeFee(balance, currentLeverage, feeRate) +
        calculateTradeFee(balance, newLeverage, feeRate)
      );

    case 'HOLD':
    case 'ATR_PARTIAL_CLOSE':
      return 0;

    default:
      const _exhaustive: never = action;
      throw new Error(`Unhandled action: ${_exhaustive}`);
  }
}
