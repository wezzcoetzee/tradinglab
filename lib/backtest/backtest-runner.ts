import type { CsvRow } from '../types';
import type { BacktestConfig, BacktestResult, DayResult, Position, PositionAction } from './types';

import { PERCENTAGE_DIVISOR, WARMUP_DAYS } from './constants';
import { calculateTradeFee } from './fee-calculator';
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

/**
 * Account model: `balance` is the margin backing the open position (or idle cash when flat),
 * `sidelineValue` is cash realised by ATR partial closes. Equity is
 * `balance + sidelineValue + unrealized PnL`, and the account is liquidated (cross margin)
 * as soon as equity at the day's worst price reaches zero.
 */
export function runBacktest(
  csvData: CsvRow[],
  smaValues: number[],
  config: BacktestConfig,
  atrValues: number[] | null = null,
  summaryOnly: boolean = false
): BacktestResult {
  let balance = config.startingCapital;
  let sidelineValue = 0;
  let currentPosition: Position | null = null;
  let totalFees = 0;
  let totalTrades = 0;
  let atrTriggerCount = 0;
  let isLiquidated = false;
  let liquidationDay: number | undefined;
  let liquidationDate: string | undefined;

  const days: DayResult[] = [];

  const recordDay = (i: number, sma: number, action: PositionAction, pnl: number, fees: number) => {
    if (summaryOnly) return;
    const price = csvData[i].close;
    const unrealizedPnl = currentPosition ? calculatePositionProfit(currentPosition, price) : 0;
    days.push({
      dayIndex: i,
      date: csvData[i].date,
      price,
      sma,
      action,
      position: currentPosition,
      balance,
      pnl,
      fees,
      isLiquidated,
      sidelineValue,
      portfolioValue: isLiquidated ? MIN_BALANCE_THRESHOLD : balance + unrealizedPnl + sidelineValue,
    });
  };

  const liquidate = (i: number) => {
    isLiquidated = true;
    liquidationDay = i;
    liquidationDate = csvData[i].date;
    balance = MIN_BALANCE_THRESHOLD;
    sidelineValue = 0;
    currentPosition = null;
  };

  for (let i = WARMUP_DAYS; i < csvData.length; i++) {
    const row = csvData[i];
    const sma = smaValues[i];
    const price = row.close;

    if (isNaN(sma)) {
      continue;
    }

    if (currentPosition !== null) {
      const worstPrice = currentPosition.type === 'LONG' ? row.low : row.high;
      const worstPnl = calculatePositionProfit(currentPosition, worstPrice);
      if (balance + sidelineValue + worstPnl <= MIN_BALANCE_THRESHOLD) {
        const action: PositionAction = currentPosition.type === 'LONG' ? 'CLOSE_LONG' : 'CLOSE_SHORT';
        liquidate(i);
        recordDay(i, sma, action, worstPnl, 0);
        break;
      }
    }

    if (currentPosition?.trailingStop && config.atr && atrValues) {
      const updatedStop = updateExtremePrice(currentPosition.trailingStop, row, currentPosition.type);
      const position: Position = { ...currentPosition, trailingStop: updatedStop };
      currentPosition = position;

      if (!updatedStop.triggered && shouldTriggerStop(updatedStop, price, atrValues[i], config.atr.multiplier, position.type)) {
        const result = executePartialClose(position, price, config.atr.closePercent, config.feeRate);
        atrTriggerCount++;

        currentPosition = result.newPosition;
        sidelineValue += result.sidelineValue;
        balance -= result.closedCapital;
        totalFees += result.fees;
        totalTrades++;

        recordDay(i, sma, 'ATR_PARTIAL_CLOSE', result.pnl, result.fees);
        continue;
      }
    }

    const targetType = determinePositionType(price, sma);
    const action = determineAction(currentPosition, targetType);

    if (action === 'HOLD') {
      recordDay(i, sma, action, 0, 0);
      continue;
    }

    let pnl = 0;
    let fees = 0;

    if (isClosingAction(action) && currentPosition) {
      pnl = calculatePositionProfit(currentPosition, price);
      balance += pnl;
      fees += calculateTradeFee(balance, currentPosition.leverage, config.feeRate);
    }

    const newLeverage = isOpeningAction(action)
      ? isLongAction(action) ? config.longLeverage : config.shortLeverage
      : undefined;

    // Any trade folds the sidelined cash back in, so a new position is sized on all of it.
    if (newLeverage !== undefined) {
      fees += calculateTradeFee(balance + sidelineValue, newLeverage, config.feeRate);
    }
    balance += sidelineValue - fees;
    sidelineValue = 0;
    totalFees += fees;
    totalTrades++;

    if (balance <= MIN_BALANCE_THRESHOLD) {
      liquidate(i);
      recordDay(i, sma, action, pnl, fees);
      break;
    }

    if (newLeverage !== undefined) {
      const newPositionType = isLongAction(action) ? 'LONG' : 'SHORT';
      currentPosition = openPosition(newPositionType, price, balance, newLeverage);

      if (config.atr && atrValues) {
        currentPosition = {
          ...currentPosition,
          trailingStop: initTrailingStop(row, newPositionType),
        };
      }
    } else {
      currentPosition = null;
    }

    recordDay(i, sma, action, pnl, fees);
  }

  const lastPrice = csvData[csvData.length - 1].close;
  const finalPnl = currentPosition ? calculatePositionProfit(currentPosition, lastPrice) : 0;
  const finalBalance = isLiquidated ? MIN_BALANCE_THRESHOLD : balance + sidelineValue + finalPnl;
  const totalReturn = ((finalBalance - config.startingCapital) / config.startingCapital) * PERCENTAGE_DIVISOR;

  return {
    config,
    days,
    finalBalance,
    totalReturn,
    totalFees,
    totalTrades,
    atrTriggerCount,
    isLiquidated,
    liquidationDay,
    liquidationDate,
  };
}
