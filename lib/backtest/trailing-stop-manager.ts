import type { CsvRow } from '../types';
import type { Position, PositionType, TrailingStopState } from './types';

import { PERCENTAGE_DIVISOR } from './constants';
import { calculateLongProfit, calculateShortProfit } from './position-manager';

export function initTrailingStop(row: CsvRow, positionType: PositionType): TrailingStopState {
  return {
    extremePrice: positionType === 'LONG' ? row.high : row.low,
    triggered: false,
  };
}

export function updateExtremePrice(
  state: TrailingStopState,
  row: CsvRow,
  positionType: PositionType
): TrailingStopState {
  if (state.triggered) return state;

  const newExtreme =
    positionType === 'LONG'
      ? Math.max(state.extremePrice, row.high)
      : Math.min(state.extremePrice, row.low);

  if (newExtreme === state.extremePrice) return state;

  return { ...state, extremePrice: newExtreme };
}

export function shouldTriggerStop(
  state: TrailingStopState,
  price: number,
  atr: number,
  multiplier: number,
  positionType: PositionType
): boolean {
  if (state.triggered || isNaN(atr)) return false;

  const stopDistance = atr * multiplier;

  if (positionType === 'LONG') {
    return price <= state.extremePrice - stopDistance;
  }

  return price >= state.extremePrice + stopDistance;
}

export interface PartialCloseResult {
  newPosition: Position;
  sidelineValue: number;
  closedCapital: number;
  pnl: number;
  fees: number;
}

export function executePartialClose(
  position: Position,
  price: number,
  closePercent: number,
  feeRate: number
): PartialCloseResult {
  const closeRatio = closePercent / PERCENTAGE_DIVISOR;
  const remainRatio = 1 - closeRatio;

  const closingValue = position.entryValue * closeRatio;
  const remainingValue = position.entryValue * remainRatio;

  const pnl =
    position.type === 'LONG'
      ? calculateLongProfit(position.entryPrice, price, closingValue)
      : calculateShortProfit(position.entryPrice, price, closingValue);

  const closedCapital = closingValue / position.leverage;
  const fees = (closedCapital * position.leverage * feeRate) / PERCENTAGE_DIVISOR;
  const sidelineValue = closedCapital + pnl - fees;

  const newPosition: Position = {
    ...position,
    entryValue: remainingValue,
    trailingStop: {
      extremePrice: position.trailingStop?.extremePrice ?? price,
      triggered: true,
    },
  };

  return { newPosition, sidelineValue, closedCapital, pnl, fees };
}
