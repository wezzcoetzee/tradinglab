import type {
  PricePoint,
  Position,
  SmaResult,
  DetailedDailyState,
  TradeAction,
} from "./types";

interface SimulatorParams {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  longLeverage: number;
  shortLeverage: number;
  atrMultiplier: number;
  atrPeriod: number;
}

interface SimulatorState {
  cash: number;
  position: Position;
  entryPrice: number;
  positionSize: number;
  peakValue: number;
  maxDrawdown: number;
  trades: number;
  liquidated: boolean;
  highestCloseSinceEntry: number | null;
  lowestCloseSinceEntry: number | null;
  trailingStopPrice: number | null;
}

function calculateTradeFee(
  value: number,
  exchangeFeePercent: number,
  gasFee: number
): number {
  return value * (exchangeFeePercent / 100) + gasFee;
}

function getPositionLeverage(
  position: Position,
  longLeverage: number,
  shortLeverage: number
): number {
  if (position === "LONG") return longLeverage;
  if (position === "SHORT") return shortLeverage;
  return 1;
}

function calculatePortfolioValue(
  state: SimulatorState,
  currentPrice: number,
  longLeverage: number,
  shortLeverage: number
): number {
  if (state.position === "NONE") {
    return state.cash;
  }

  const leverage = getPositionLeverage(state.position, longLeverage, shortLeverage);
  const priceChange = (currentPrice - state.entryPrice) / state.entryPrice;

  if (state.position === "LONG") {
    const leveragedReturn = priceChange * leverage;
    return state.positionSize * (1 + leveragedReturn);
  }

  if (state.position === "SHORT") {
    const leveragedReturn = -priceChange * leverage;
    return state.positionSize * (1 + leveragedReturn);
  }

  return state.cash;
}

function isLiquidated(
  state: SimulatorState,
  currentPrice: number,
  longLeverage: number,
  shortLeverage: number
): boolean {
  if (state.position === "NONE") return false;

  const leverage = getPositionLeverage(state.position, longLeverage, shortLeverage);
  const liquidationThreshold = 1 / leverage;

  const priceChange = (currentPrice - state.entryPrice) / state.entryPrice;

  if (state.position === "LONG") {
    return priceChange <= -liquidationThreshold;
  }

  if (state.position === "SHORT") {
    return priceChange >= liquidationThreshold;
  }

  return false;
}

function determineSignal(
  closePrice: number,
  sma: number | null,
  buyOnLong: boolean,
  shortOnShort: boolean
): Position {
  if (sma === null) return "NONE";

  if (closePrice > sma && buyOnLong) {
    return "LONG";
  }

  if (closePrice < sma && shortOnShort) {
    return "SHORT";
  }

  return "NONE";
}

function isTrailingStopEnabled(atrMultiplier: number, atrPeriod: number): boolean {
  return atrMultiplier > 0 && atrPeriod > 0;
}

function calculateTrailingStopPrice(
  position: Position,
  extremeClose: number | null,
  currentAtr: number | null,
  atrMultiplier: number,
  currentStopPrice: number | null
): number | null {
  if (position === "NONE" || extremeClose === null || currentAtr === null) {
    return null;
  }

  if (position === "LONG") {
    const newStop = extremeClose - atrMultiplier * currentAtr;
    if (currentStopPrice === null) return newStop;
    return Math.max(newStop, currentStopPrice);
  }

  if (position === "SHORT") {
    const newStop = extremeClose + atrMultiplier * currentAtr;
    if (currentStopPrice === null) return newStop;
    return Math.min(newStop, currentStopPrice);
  }

  return null;
}

function isTrailingStopTriggered(
  position: Position,
  closePrice: number,
  stopPrice: number | null
): boolean {
  if (stopPrice === null) return false;

  if (position === "LONG") {
    return closePrice <= stopPrice;
  }

  if (position === "SHORT") {
    return closePrice >= stopPrice;
  }

  return false;
}

export function simulateStrategy(
  pricePoints: PricePoint[],
  smaValues: (number | null)[],
  atrValues: (number | null)[],
  params: SimulatorParams
): { result: SmaResult; timeSeries: DetailedDailyState[] } {
  const {
    initialCapital,
    exchangeFeePercent,
    gasFeePerTrade,
    buyOnLong,
    shortOnShort,
    longLeverage,
    shortLeverage,
    atrMultiplier,
    atrPeriod,
  } = params;

  const trailingStopEnabled = isTrailingStopEnabled(atrMultiplier, atrPeriod);

  const state: SimulatorState = {
    cash: initialCapital,
    position: "NONE",
    entryPrice: 0,
    positionSize: 0,
    peakValue: initialCapital,
    maxDrawdown: 0,
    trades: 0,
    liquidated: false,
    highestCloseSinceEntry: null,
    lowestCloseSinceEntry: null,
    trailingStopPrice: null,
  };

  const timeSeries: DetailedDailyState[] = [];
  const hodlQuantity = initialCapital / pricePoints[0].closePrice;
  let hodlPeakValue = initialCapital;

  for (let i = 0; i < pricePoints.length; i++) {
    const { date, closePrice } = pricePoints[i];
    const sma = smaValues[i];
    const hodlValue = hodlQuantity * closePrice;

    if (hodlValue > hodlPeakValue) {
      hodlPeakValue = hodlValue;
    }
    const hodlDrawdown = hodlPeakValue > 0 ? (hodlPeakValue - hodlValue) / hodlPeakValue : 0;

    if (state.liquidated) {
      timeSeries.push({
        date,
        closePrice,
        sma,
        signal: "NONE",
        portfolioValue: 0,
        hodlValue,
        drawdown: 1,
        hodlDrawdown,
      });
      continue;
    }

    if (
      state.position !== "NONE" &&
      isLiquidated(state, closePrice, longLeverage, shortLeverage)
    ) {
      state.liquidated = true;
      state.cash = 0;
      state.position = "NONE";
      state.positionSize = 0;
      timeSeries.push({
        date,
        closePrice,
        sma,
        signal: "NONE",
        portfolioValue: 0,
        hodlValue,
        drawdown: 1,
        hodlDrawdown,
      });
      continue;
    }

    const portfolioValue = calculatePortfolioValue(
      state,
      closePrice,
      longLeverage,
      shortLeverage
    );

    if (portfolioValue > state.peakValue) {
      state.peakValue = portfolioValue;
    }

    const currentDrawdown =
      state.peakValue > 0 ? (state.peakValue - portfolioValue) / state.peakValue : 0;

    if (currentDrawdown > state.maxDrawdown) {
      state.maxDrawdown = currentDrawdown;
    }

    let tradeAction: TradeAction | undefined;
    const previousPosition = state.position;

    if (state.position !== "NONE" && trailingStopEnabled) {
      if (state.position === "LONG") {
        state.highestCloseSinceEntry =
          state.highestCloseSinceEntry === null
            ? closePrice
            : Math.max(state.highestCloseSinceEntry, closePrice);
      } else if (state.position === "SHORT") {
        state.lowestCloseSinceEntry =
          state.lowestCloseSinceEntry === null
            ? closePrice
            : Math.min(state.lowestCloseSinceEntry, closePrice);
      }

      const extremeClose =
        state.position === "LONG"
          ? state.highestCloseSinceEntry
          : state.lowestCloseSinceEntry;

      state.trailingStopPrice = calculateTrailingStopPrice(
        state.position,
        extremeClose,
        atrValues[i],
        atrMultiplier,
        state.trailingStopPrice
      );

      if (isTrailingStopTriggered(state.position, closePrice, state.trailingStopPrice)) {
        const exitValue = calculatePortfolioValue(
          state,
          closePrice,
          longLeverage,
          shortLeverage
        );
        const exitFee = calculateTradeFee(exitValue, exchangeFeePercent, gasFeePerTrade);
        state.cash = exitValue - exitFee;
        tradeAction = previousPosition === "LONG" ? "EXIT_LONG" : "EXIT_SHORT";
        state.position = "NONE";
        state.positionSize = 0;
        state.highestCloseSinceEntry = null;
        state.lowestCloseSinceEntry = null;
        state.trailingStopPrice = null;
        state.trades++;
      }
    }

    const targetPosition = determineSignal(closePrice, sma, buyOnLong, shortOnShort);

    if (targetPosition !== state.position) {
      if (state.position !== "NONE") {
        const exitValue = calculatePortfolioValue(
          state,
          closePrice,
          longLeverage,
          shortLeverage
        );
        const exitFee = calculateTradeFee(exitValue, exchangeFeePercent, gasFeePerTrade);
        state.cash = exitValue - exitFee;
        tradeAction = previousPosition === "LONG" ? "EXIT_LONG" : "EXIT_SHORT";
        state.position = "NONE";
        state.positionSize = 0;
        state.highestCloseSinceEntry = null;
        state.lowestCloseSinceEntry = null;
        state.trailingStopPrice = null;
        state.trades++;
      }

      if (targetPosition !== "NONE" && state.cash > 0) {
        const entryFee = calculateTradeFee(state.cash, exchangeFeePercent, gasFeePerTrade);
        const entryCapital = state.cash - entryFee;

        if (entryCapital > 0) {
          state.position = targetPosition;
          state.entryPrice = closePrice;
          state.positionSize = entryCapital;
          state.cash = 0;
          state.trades++;
          tradeAction = targetPosition === "LONG" ? "ENTER_LONG" : "ENTER_SHORT";

          if (trailingStopEnabled) {
            if (targetPosition === "LONG") {
              state.highestCloseSinceEntry = closePrice;
            } else {
              state.lowestCloseSinceEntry = closePrice;
            }
            state.trailingStopPrice = calculateTrailingStopPrice(
              targetPosition,
              closePrice,
              atrValues[i],
              atrMultiplier,
              null
            );
          }
        }
      }
    }

    const finalValue = calculatePortfolioValue(
      state,
      closePrice,
      longLeverage,
      shortLeverage
    );

    timeSeries.push({
      date,
      closePrice,
      sma,
      signal: state.position,
      portfolioValue: finalValue,
      hodlValue,
      drawdown: currentDrawdown,
      hodlDrawdown,
      tradeAction,
    });
  }

  const finalValue = state.liquidated
    ? 0
    : calculatePortfolioValue(
        state,
        pricePoints[pricePoints.length - 1].closePrice,
        longLeverage,
        shortLeverage
      );

  const days = pricePoints.length;
  const totalReturn = (finalValue - initialCapital) / initialCapital;
  const annualizedReturn = Math.pow(finalValue / initialCapital, 365 / days) - 1;

  return {
    result: {
      period: 0,
      totalReturn,
      annualizedReturn: state.liquidated ? -1 : annualizedReturn,
      maxDrawdown: state.liquidated ? 1 : state.maxDrawdown,
      finalValue,
      trades: state.trades,
      liquidated: state.liquidated,
    },
    timeSeries,
  };
}

export function calculateHodl(
  pricePoints: PricePoint[],
  initialCapital: number
): {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  finalValue: number;
} {
  const startPrice = pricePoints[0].closePrice;
  const endPrice = pricePoints[pricePoints.length - 1].closePrice;
  const quantity = initialCapital / startPrice;
  const finalValue = quantity * endPrice;
  const days = pricePoints.length;

  let peakValue = initialCapital;
  let maxDrawdown = 0;

  for (const { closePrice } of pricePoints) {
    const currentValue = quantity * closePrice;
    if (currentValue > peakValue) {
      peakValue = currentValue;
    }
    const drawdown = (peakValue - currentValue) / peakValue;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  const totalReturn = (finalValue - initialCapital) / initialCapital;
  const annualizedReturn = Math.pow(finalValue / initialCapital, 365 / days) - 1;

  return {
    totalReturn,
    annualizedReturn,
    maxDrawdown,
    finalValue,
  };
}
