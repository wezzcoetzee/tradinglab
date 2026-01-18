import type {
  DataPointWithIndicators,
  StrategyParams,
  TradeRecord,
  Signal,
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
  trades: TradeRecord[];
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
  signalType: "sma" | "ema",
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
    trades: [],
  };

  for (let i = 0; i < dataPoints.length; i++) {
    const point = dataPoints[i];
    const signal: Signal = signalType === "sma" ? point.smaSignal : point.emaSignal;
    const price = point.closePrice;
    const inSimulation = i >= startIdx;

    if (i === startIdx && state.position !== "neutral") {
      state.capital = params.initialCapital;
      state.position = "neutral";
      state.trades = [];
    }

    if (!inSimulation) {
      continue;
    }

    if (state.position === "neutral") {
      if (signal === "long" && params.buyOnLongSignal) {
        state.position = "long";
        state.entryPrice = price;
        state.entryTimestamp = point.unixTimestamp;
        state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
      } else if (signal === "short" && params.shortOnShort) {
        state.position = "short";
        state.entryPrice = price;
        state.entryTimestamp = point.unixTimestamp;
        state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
      }
    } else if (state.position === "long") {
      const priceChange = (price - state.entryPrice) / state.entryPrice;
      const leveragedReturn = priceChange * params.longLeverage;

      if (signal !== "long") {
        const returnPct = leveragedReturn;
        const capitalAfterTrade = state.capital * (1 + returnPct);
        const capitalAfterFees = applyTradeFees(
          capitalAfterTrade,
          params.gasFeePerTrade,
          params.exchangeFee
        );

        recordedTrades.push({
          entryTimestamp: state.entryTimestamp,
          exitTimestamp: point.unixTimestamp,
          entryPrice: state.entryPrice,
          exitPrice: price,
          position: "long",
          returnPct,
          capitalAfter: capitalAfterFees,
        });

        state.capital = capitalAfterFees;
        state.position = "neutral";

        if (signal === "short" && params.shortOnShort) {
          state.position = "short";
          state.entryPrice = price;
          state.entryTimestamp = point.unixTimestamp;
          state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
        }
      }
    } else if (state.position === "short") {
      const priceChange = (state.entryPrice - price) / state.entryPrice;
      const leveragedReturn = priceChange * params.shortLeverage;

      if (signal !== "short") {
        const returnPct = leveragedReturn;
        const capitalAfterTrade = state.capital * (1 + returnPct);
        const capitalAfterFees = applyTradeFees(
          capitalAfterTrade,
          params.gasFeePerTrade,
          params.exchangeFee
        );

        recordedTrades.push({
          entryTimestamp: state.entryTimestamp,
          exitTimestamp: point.unixTimestamp,
          entryPrice: state.entryPrice,
          exitPrice: price,
          position: "short",
          returnPct,
          capitalAfter: capitalAfterFees,
        });

        state.capital = capitalAfterFees;
        state.position = "neutral";

        if (signal === "long" && params.buyOnLongSignal) {
          state.position = "long";
          state.entryPrice = price;
          state.entryTimestamp = point.unixTimestamp;
          state.capital = applyTradeFees(state.capital, params.gasFeePerTrade, params.exchangeFee);
        }
      }
    }

    let currentCapital = state.capital;
    if (state.position === "long") {
      const priceChange = (price - state.entryPrice) / state.entryPrice;
      currentCapital = state.capital * (1 + priceChange * params.longLeverage);
    } else if (state.position === "short") {
      const priceChange = (state.entryPrice - price) / state.entryPrice;
      currentCapital = state.capital * (1 + priceChange * params.shortLeverage);
    }

    returns.push(currentCapital / params.initialCapital);
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
