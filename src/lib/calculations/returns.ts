import type {
  DataPointWithIndicators,
  Position,
  Signal,
  StrategyParams,
  TradeRecord,
} from "../types/trading";

export type { Position };

function getTargetPosition(
  signal: Signal,
  params: Pick<StrategyParams, "buyOnLongSignal" | "shortOnShort">
): Position {
  if (signal === "long" && params.buyOnLongSignal) return "long";
  if (signal === "short" && params.shortOnShort) return "short";
  return "neutral";
}

export function calculateHODLReturns(
  dataPoints: DataPointWithIndicators[],
  simulationStartIndex = 0
): number[] {
  if (dataPoints.length === 0) return [];

  const startIdx = Math.max(0, Math.min(simulationStartIndex, dataPoints.length - 1));
  const simulationPoints = dataPoints.slice(startIdx);
  if (simulationPoints.length === 0) return [];

  const initialPrice = simulationPoints[0].closePrice;
  return simulationPoints.map((point) => point.closePrice / initialPrice);
}

interface StrategyState {
  capital: number;
  position: Position;
  entryPrice: number;
  entryTimestamp: number;
  previousPrice: number;
}

function applyTradeFees(
  capital: number,
  gasFee: number,
  exchangeFee: number
): number {
  const feeAmount = capital * exchangeFee;
  return capital - gasFee - feeAmount;
}

function applyDailyReturn(state: StrategyState, price: number, params: StrategyParams): void {
  if (state.position === "long") {
    const dailyReturn = (price - state.previousPrice) / state.previousPrice;
    state.capital = state.capital * (1 + dailyReturn * params.longLeverage);
  }
}

function createTradeRecord(
  state: StrategyState,
  point: DataPointWithIndicators,
  params: StrategyParams
): TradeRecord {
  return {
    entryTimestamp: state.entryTimestamp,
    exitTimestamp: point.unixTimestamp,
    entryPrice: state.entryPrice,
    exitPrice: point.closePrice,
    position: state.position as Exclude<Position, "neutral">,
    returnPct: (state.capital - params.initialCapital) / params.initialCapital,
    capitalAfter: state.capital,
  };
}

function handlePositionTransition(
  state: StrategyState,
  targetPosition: Position,
  point: DataPointWithIndicators,
  params: StrategyParams,
  trades: TradeRecord[]
): void {
  if (state.position === targetPosition) return;

  if (state.position !== "neutral") {
    trades.push(createTradeRecord(state, point, params));
  }

  state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
  state.position = targetPosition;
  state.entryPrice = point.closePrice;
  state.entryTimestamp = point.unixTimestamp;
}

export function calculateStrategyReturns(
  dataPoints: DataPointWithIndicators[],
  params: StrategyParams,
  simulationStartIndex = 0
): { returns: number[]; trades: TradeRecord[] } {
  if (dataPoints.length === 0) return { returns: [], trades: [] };

  const startIdx = Math.max(0, Math.min(simulationStartIndex, dataPoints.length - 1));
  const returns: number[] = [];
  const recordedTrades: TradeRecord[] = [];
  const state: StrategyState = {
    capital: params.initialCapital,
    position: "neutral",
    entryPrice: 0,
    entryTimestamp: 0,
    previousPrice: 0,
  };

  for (let i = startIdx; i < dataPoints.length; i++) {
    const point = dataPoints[i];
    const signal = point.smaSignal;
    const price = point.closePrice;
    const targetPosition = getTargetPosition(signal, params);

    if (i === startIdx) {
      state.capital = params.initialCapital;
      state.previousPrice = price;

      if (targetPosition !== "neutral") {
        state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
        state.position = targetPosition;
        state.entryPrice = price;
        state.entryTimestamp = point.unixTimestamp;
      }

      returns.push(state.capital / params.initialCapital);
      continue;
    }

    applyDailyReturn(state, price, params);
    handlePositionTransition(state, targetPosition, point, params, recordedTrades);

    state.previousPrice = price;
    returns.push(state.capital / params.initialCapital);
  }

  return { returns, trades: recordedTrades };
}

export function calculateAnnualizedReturn(
  finalValue: number,
  initialValue: number,
  days: number
): number {
  if (days <= 0 || initialValue <= 0) return 0;
  const totalReturn = finalValue / initialValue;
  const years = days / 365;
  return Math.pow(totalReturn, 1 / years) - 1;
}

export function calculateMaxDrawdown(returns: number[]): number {
  const runningDrawdowns = computeRunningDrawdowns(returns);
  return runningDrawdowns[runningDrawdowns.length - 1] ?? 0;
}

export function computeRunningDrawdowns(returns: number[]): number[] {
  if (returns.length === 0) return [];

  const drawdowns: number[] = [];
  let peak = returns[0];
  let maxDrawdown = 0;

  for (const value of returns) {
    peak = Math.max(peak, value);
    const drawdown = (peak - value) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    drawdowns.push(maxDrawdown);
  }

  return drawdowns;
}
