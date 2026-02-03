import type { Position, PositionAction, PositionType } from './types';

export function determinePositionType(close: number, sma: number): PositionType {
  if (close > sma) return 'LONG';
  if (close < sma) return 'SHORT';
  return 'NONE';
}

export function determineAction(
  currentPosition: Position | null,
  targetType: PositionType
): PositionAction {
  const currentType = currentPosition?.type ?? 'NONE';

  if (currentType === targetType) {
    return 'HOLD';
  }

  if (currentType === 'NONE') {
    if (targetType === 'LONG') return 'OPEN_LONG';
    if (targetType === 'SHORT') return 'OPEN_SHORT';
    return 'HOLD';
  }

  if (targetType === 'NONE') {
    if (currentType === 'LONG') return 'CLOSE_LONG';
    if (currentType === 'SHORT') return 'CLOSE_SHORT';
    return 'HOLD';
  }

  if (currentType === 'LONG' && targetType === 'SHORT') {
    return 'TRANSITION_LONG_TO_SHORT';
  }

  if (currentType === 'SHORT' && targetType === 'LONG') {
    return 'TRANSITION_SHORT_TO_LONG';
  }

  return 'HOLD';
}

function calculatePriceRatio(entryPrice: number, exitPrice: number): number {
  return exitPrice / entryPrice;
}

export function calculateLongProfit(
  entryPrice: number,
  exitPrice: number,
  positionValue: number
): number {
  return (calculatePriceRatio(entryPrice, exitPrice) - 1) * positionValue;
}

export function calculateShortProfit(
  entryPrice: number,
  exitPrice: number,
  positionValue: number
): number {
  return (1 / calculatePriceRatio(entryPrice, exitPrice) - 1) * positionValue;
}

export function calculatePositionProfit(
  position: Position,
  exitPrice: number
): number {
  if (position.type === 'LONG') {
    return calculateLongProfit(position.entryPrice, exitPrice, position.entryValue);
  }

  if (position.type === 'SHORT') {
    return calculateShortProfit(position.entryPrice, exitPrice, position.entryValue);
  }

  return 0;
}

export function openPosition(
  type: PositionType,
  price: number,
  balance: number,
  leverage: number
): Position {
  return {
    type,
    entryPrice: price,
    entryValue: balance * leverage,
    leverage,
  };
}
