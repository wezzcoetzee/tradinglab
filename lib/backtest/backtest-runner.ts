import type { CsvRow } from '../types';
import type { BacktestConfig, BacktestResult, DayResult, Position, PositionAction } from './types';

import { PERCENTAGE_DIVISOR, WARMUP_DAYS } from './constants';
import { calculateTransitionFees } from './fee-calculator';
import {
  calculatePositionProfit,
  determineAction,
  determinePositionType,
  openPosition,
} from './position-manager';
import {
  executePartialClose,
  initTrailingStop,
  shouldTriggerStop,
  updateExtremePrice,
} from './trailing-stop-manager';

const MIN_BALANCE_THRESHOLD = 0;

const CLOSING_ACTIONS: PositionAction[] = [
  'CLOSE_LONG',
  'CLOSE_SHORT',
  'TRANSITION_LONG_TO_SHORT',
  'TRANSITION_SHORT_TO_LONG',
];

const OPENING_ACTIONS: PositionAction[] = [
  'OPEN_LONG',
  'OPEN_SHORT',
  'TRANSITION_LONG_TO_SHORT',
  'TRANSITION_SHORT_TO_LONG',
];

const LONG_ACTIONS: PositionAction[] = ['OPEN_LONG', 'TRANSITION_SHORT_TO_LONG'];

function isClosingAction(action: PositionAction): boolean {
  return CLOSING_ACTIONS.includes(action);
}

function isOpeningAction(action: PositionAction): boolean {
  return OPENING_ACTIONS.includes(action);
}

function isLongAction(action: PositionAction): boolean {
  return LONG_ACTIONS.includes(action);
}

export function runBacktest(
  csvData: CsvRow[],
  smaValues: number[],
  config: BacktestConfig,
  atrValues: number[] | null = null,
  summaryOnly: boolean = false
): BacktestResult {
  let balance = config.startingCapital;
  let currentPosition: Position | null = null;
  let totalFees = 0;
  let totalTrades = 0;
  let isLiquidated = false;
  let liquidationDay: number | undefined;
  let liquidationDate: string | undefined;
  let sidelineValue = 0;

  const days: DayResult[] = [];

  for (let i = WARMUP_DAYS; i < csvData.length; i++) {
    if (isLiquidated) break;

    const row = csvData[i];
    const sma = smaValues[i];
    const price = row.close;

    if (isNaN(sma)) {
      continue;
    }

    if (currentPosition !== null && currentPosition.trailingStop && config.atr && atrValues) {
      const stopState = currentPosition.trailingStop;
      const updatedStop = updateExtremePrice(stopState, row, currentPosition.type);
      const posWithUpdatedStop: Position = { ...currentPosition, trailingStop: updatedStop };
      currentPosition = posWithUpdatedStop;

      const atr = atrValues[i];
      if (!updatedStop.triggered && shouldTriggerStop(updatedStop, price, atr, config.atr.multiplier, posWithUpdatedStop.type)) {
        const result = executePartialClose(posWithUpdatedStop, price, config.atr.closePercent, config.feeRate);

        currentPosition = result.newPosition;
        sidelineValue += result.sidelineValue;
        balance -= result.closedCapital;
        totalFees += result.fees;
        totalTrades++;

        if (!summaryOnly) {
          days.push({
            dayIndex: i,
            date: row.date,
            price,
            sma,
            action: 'ATR_PARTIAL_CLOSE',
            position: currentPosition,
            balance,
            pnl: result.pnl,
            fees: result.fees,
            isLiquidated: false,
            sidelineValue,
          });
        }
        continue;
      }
    }

    const targetType = determinePositionType(price, sma);
    const action = determineAction(currentPosition, targetType);

    if (action === 'HOLD') {
      if (!summaryOnly) {
        days.push({
          dayIndex: i,
          date: row.date,
          price,
          sma,
          action,
          position: currentPosition,
          balance,
          pnl: 0,
          fees: 0,
          isLiquidated: false,
        });
      }
      continue;
    }

    let pnl = 0;
    let fees = 0;

    if (isClosingAction(action) && currentPosition) {
      pnl = calculatePositionProfit(currentPosition, price);
      balance += pnl;
    }

    const newLeverage = isOpeningAction(action)
      ? isLongAction(action) ? config.longLeverage : config.shortLeverage
      : undefined;

    fees = calculateTransitionFees(
      action,
      balance,
      currentPosition?.leverage ?? newLeverage ?? 1,
      config.feeRate,
      newLeverage
    );

    balance -= fees;
    totalFees += fees;
    totalTrades++;

    if (balance <= MIN_BALANCE_THRESHOLD) {
      isLiquidated = true;
      liquidationDay = i;
      liquidationDate = row.date;
      balance = MIN_BALANCE_THRESHOLD;
      currentPosition = null;

      if (!summaryOnly) {
        days.push({
          dayIndex: i,
          date: row.date,
          price,
          sma,
          action,
          position: null,
          balance: MIN_BALANCE_THRESHOLD,
          pnl,
          fees,
          isLiquidated: true,
        });
      }
      break;
    }

    if (isOpeningAction(action)) {
      const newPositionType = isLongAction(action) ? 'LONG' : 'SHORT';
      const capitalForPosition = balance + sidelineValue;
      sidelineValue = 0;

      if (newLeverage === undefined) {
        throw new Error('newLeverage is required for opening position');
      }

      currentPosition = openPosition(
        newPositionType,
        price,
        capitalForPosition,
        newLeverage
      );

      if (config.atr && atrValues) {
        currentPosition = {
          ...currentPosition,
          trailingStop: initTrailingStop(csvData[i], newPositionType),
        };
      }

      balance = capitalForPosition;
    } else if (isClosingAction(action)) {
      currentPosition = null;
    }

    if (!summaryOnly) {
      days.push({
        dayIndex: i,
        date: row.date,
        price,
        sma,
        action,
        position: currentPosition,
        balance,
        pnl,
        fees,
        isLiquidated: false,
      });
    }
  }

  if (currentPosition && !isLiquidated) {
    const lastRow = csvData[csvData.length - 1];
    const lastPrice = lastRow.close;
    const finalPnl = calculatePositionProfit(currentPosition, lastPrice);
    balance += finalPnl;
  }

  const finalBalance = isLiquidated ? MIN_BALANCE_THRESHOLD : balance + sidelineValue;
  const totalReturn = ((finalBalance - config.startingCapital) / config.startingCapital) * PERCENTAGE_DIVISOR;

  return {
    config,
    days,
    finalBalance,
    totalReturn,
    totalFees,
    totalTrades,
    isLiquidated,
    liquidationDay,
    liquidationDate,
  };
}
