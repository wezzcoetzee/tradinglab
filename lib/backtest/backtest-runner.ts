import type { CsvRow } from '../types';
import type { BacktestConfig, BacktestResult, DayResult, Position } from './types';

import { calculateTransitionFees } from './fee-calculator';
import {
  calculatePositionProfit,
  determineAction,
  determinePositionType,
  openPosition,
} from './position-manager';

const WARMUP_DAYS = 160;
const PERCENTAGE_MULTIPLIER = 100;
const MIN_BALANCE_THRESHOLD = 0;

export function runBacktest(
  csvData: CsvRow[],
  smaValues: number[],
  config: BacktestConfig
): BacktestResult {
  let balance = config.startingCapital;
  let currentPosition: Position | null = null;
  let totalFees = 0;
  let totalTrades = 0;
  let isLiquidated = false;
  let liquidationDay: number | undefined;

  const days: DayResult[] = [];

  for (let i = WARMUP_DAYS; i < csvData.length; i++) {
    if (isLiquidated) break;

    const row = csvData[i];
    const sma = smaValues[i];
    const price = row.close;

    if (isNaN(sma)) {
      continue;
    }

    const targetType = determinePositionType(price, sma);
    const action = determineAction(currentPosition, targetType);

    if (action === 'HOLD') {
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
      continue;
    }

    let pnl = 0;
    let fees = 0;

    const isClosingAction =
      action === 'CLOSE_LONG' ||
      action === 'CLOSE_SHORT' ||
      action === 'TRANSITION_LONG_TO_SHORT' ||
      action === 'TRANSITION_SHORT_TO_LONG';

    if (isClosingAction && currentPosition) {
      pnl = calculatePositionProfit(currentPosition, price);
      balance += pnl;
    }

    const isOpeningAction =
      action === 'OPEN_LONG' ||
      action === 'OPEN_SHORT' ||
      action === 'TRANSITION_LONG_TO_SHORT' ||
      action === 'TRANSITION_SHORT_TO_LONG';

    const isLongAction = action === 'OPEN_LONG' || action === 'TRANSITION_SHORT_TO_LONG';

    const newLeverage = isOpeningAction
      ? isLongAction ? config.longLeverage : config.shortLeverage
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
      balance = MIN_BALANCE_THRESHOLD;
      currentPosition = null;

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
      break;
    }

    if (isOpeningAction) {
      const newPositionType = isLongAction ? 'LONG' : 'SHORT';
      currentPosition = openPosition(
        newPositionType,
        price,
        balance,
        newLeverage!
      );
    } else if (isClosingAction) {
      currentPosition = null;
    }

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

  if (currentPosition && !isLiquidated) {
    const lastRow = csvData[csvData.length - 1];
    const lastPrice = lastRow.close;
    const finalPnl = calculatePositionProfit(currentPosition, lastPrice);
    balance += finalPnl;
  }

  const finalBalance = isLiquidated ? MIN_BALANCE_THRESHOLD : balance;
  const totalReturn = ((finalBalance - config.startingCapital) / config.startingCapital) * PERCENTAGE_MULTIPLIER;

  return {
    config,
    days,
    finalBalance,
    totalReturn,
    totalFees,
    totalTrades,
    isLiquidated,
    liquidationDay,
  };
}
