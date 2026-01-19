import type {
  DataPointWithIndicators,
  StrategyParams,
  TradeRecord,
} from "../types/trading";

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
  position: "long" | "short" | "neutral";
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

  for (let i = 0; i < dataPoints.length; i++) {
    const point = dataPoints[i];
    const signal = point.smaSignal;
    const price = point.closePrice;
    const inSimulation = i >= startIdx;

    if (!inSimulation) {
      continue;
    }

    if (i === startIdx) {
      state.capital = params.initialCapital;
      state.previousPrice = price;

      const targetPosition =
        signal === "long" && params.buyOnLongSignal ? "long" :
        signal === "short" && params.shortOnShort ? "short" : "neutral";

      if (targetPosition !== "neutral") {
        state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
        state.position = targetPosition;
        state.entryPrice = price;
        state.entryTimestamp = point.unixTimestamp;
      }

      returns.push(state.capital / params.initialCapital);
      continue;
    }

    if (state.position === "long") {
      const dailyReturn = (price - state.previousPrice) / state.previousPrice;
      state.capital = state.capital * (1 + dailyReturn * params.longLeverage);
    }
    // "short" position = cash/neutral (0 return, matching Excel behavior)

    const targetPosition =
      signal === "long" && params.buyOnLongSignal ? "long" :
      signal === "short" && params.shortOnShort ? "short" : "neutral";

    if (state.position !== targetPosition) {
      if (state.position !== "neutral") {
        recordedTrades.push({
          entryTimestamp: state.entryTimestamp,
          exitTimestamp: point.unixTimestamp,
          entryPrice: state.entryPrice,
          exitPrice: price,
          position: state.position,
          returnPct: (state.capital - params.initialCapital) / params.initialCapital,
          capitalAfter: state.capital,
        });
      }

      state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
      state.position = targetPosition;
      state.entryPrice = price;
      state.entryTimestamp = point.unixTimestamp;
    }

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
  if (returns.length === 0) return 0;

  let peak = returns[0];
  let maxDrawdown = 0;

  for (const value of returns) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}
