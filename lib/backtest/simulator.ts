import type {
  PricePoint,
  Position,
  SmaResult,
  DetailedDailyState,
  TradeAction,
  TrailingStopConfig,
  TradeAuditEntry,
} from "./types";

interface SimulatorParams {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  longLeverage: number;
  shortLeverage: number;
  trailingStop?: TrailingStopConfig;
  atrValues?: (number | null)[];
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
}

interface TrailingStopState {
  stopPrice: number | null;
  highestCloseSinceEntry: number;
  lowestCloseSinceEntry: number;
  originalPositionSize: number;
  remainingPositionSize: number;
  hasPartialClosed: boolean;
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

function initTrailingStopState(): TrailingStopState {
  return {
    stopPrice: null,
    highestCloseSinceEntry: 0,
    lowestCloseSinceEntry: Infinity,
    originalPositionSize: 0,
    remainingPositionSize: 0,
    hasPartialClosed: false,
  };
}

function updateTrailingStop(
  position: Position,
  closePrice: number,
  atr: number | null,
  multiplier: number,
  stopState: TrailingStopState
): number | null {
  if (position === "NONE" || atr === null) {
    return null;
  }

  if (position === "LONG") {
    if (closePrice > stopState.highestCloseSinceEntry) {
      stopState.highestCloseSinceEntry = closePrice;
    }
    const newStop = stopState.highestCloseSinceEntry - multiplier * atr;
    if (stopState.stopPrice === null || newStop > stopState.stopPrice) {
      stopState.stopPrice = newStop;
    }
  } else if (position === "SHORT") {
    if (closePrice < stopState.lowestCloseSinceEntry) {
      stopState.lowestCloseSinceEntry = closePrice;
    }
    const newStop = stopState.lowestCloseSinceEntry + multiplier * atr;
    if (stopState.stopPrice === null || newStop < stopState.stopPrice) {
      stopState.stopPrice = newStop;
    }
  }

  return stopState.stopPrice;
}

function isStopTriggered(
  position: Position,
  closePrice: number,
  stopPrice: number | null
): boolean {
  if (position === "NONE" || stopPrice === null) {
    return false;
  }

  if (position === "LONG") {
    return closePrice <= stopPrice;
  }

  if (position === "SHORT") {
    return closePrice >= stopPrice;
  }

  return false;
}

function createAuditEntry(
  date: Date,
  action: TradeAction,
  price: number,
  quantity: number,
  value: number,
  fee: number,
  entryPrice: number,
  stopPrice: number | null,
  atr: number | null,
  positionSizeRemaining: number
): TradeAuditEntry {
  const pnl = value - quantity;
  const pnlPercent = quantity > 0 ? pnl / quantity : 0;

  return {
    date,
    action,
    price,
    quantity,
    value,
    fee,
    pnl,
    pnlPercent,
    stopPrice,
    atr,
    positionSizeRemaining,
  };
}

export function simulateStrategy(
  pricePoints: PricePoint[],
  smaValues: (number | null)[],
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
    trailingStop,
    atrValues,
  } = params;

  const trailingStopEnabled = trailingStop?.enabled && atrValues && atrValues.length > 0;

  const state: SimulatorState = {
    cash: initialCapital,
    position: "NONE",
    entryPrice: 0,
    positionSize: 0,
    peakValue: initialCapital,
    maxDrawdown: 0,
    trades: 0,
    liquidated: false,
  };

  let stopState = initTrailingStopState();
  let trailingStopTriggers = 0;
  const tradeAuditTrail: TradeAuditEntry[] = [];

  const timeSeries: DetailedDailyState[] = [];
  const hodlQuantity = initialCapital / pricePoints[0].closePrice;
  let hodlPeakValue = initialCapital;

  for (let i = 0; i < pricePoints.length; i++) {
    const { date, closePrice } = pricePoints[i];
    const sma = smaValues[i];
    const atr = trailingStopEnabled ? atrValues[i] : null;
    const hodlValue = hodlQuantity * closePrice;

    if (hodlValue > hodlPeakValue) {
      hodlPeakValue = hodlValue;
    }
    const hodlDrawdown = hodlPeakValue > 0 ? (hodlPeakValue - hodlValue) / hodlPeakValue : 0;

    let tradeAction: TradeAction | undefined;
    let tradeAudit: TradeAuditEntry | undefined;
    let currentStopPrice: number | null = null;

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
        atr,
        trailingStopPrice: null,
      });
      continue;
    }

    // 1. Check liquidation
    if (
      state.position !== "NONE" &&
      isLiquidated(state, closePrice, longLeverage, shortLeverage)
    ) {
      state.liquidated = true;
      state.cash = 0;
      state.position = "NONE";
      state.positionSize = 0;
      stopState = initTrailingStopState();
      timeSeries.push({
        date,
        closePrice,
        sma,
        signal: "NONE",
        portfolioValue: 0,
        hodlValue,
        drawdown: 1,
        hodlDrawdown,
        atr,
        trailingStopPrice: null,
      });
      continue;
    }

    // 2. Update ATR trailing stop (ratchet behavior)
    if (trailingStopEnabled && state.position !== "NONE" && trailingStop) {
      currentStopPrice = updateTrailingStop(
        state.position,
        closePrice,
        atr,
        trailingStop.atrMultiplier,
        stopState
      );
    }

    // 3. Check if stop triggered → partial/full close
    if (
      trailingStopEnabled &&
      trailingStop &&
      state.position !== "NONE" &&
      !stopState.hasPartialClosed &&
      isStopTriggered(state.position, closePrice, currentStopPrice)
    ) {
      trailingStopTriggers++;
      const partialPercent = trailingStop.partialClosePercent / 100;
      const exitValue = calculatePortfolioValue(state, closePrice, longLeverage, shortLeverage);
      const previousPosition = state.position;

      if (partialPercent >= 1) {
        // Full close
        const exitFee = calculateTradeFee(exitValue, exchangeFeePercent, gasFeePerTrade);
        tradeAction = previousPosition === "LONG" ? "STOP_EXIT_LONG" : "STOP_EXIT_SHORT";

        tradeAudit = createAuditEntry(
          date,
          tradeAction,
          closePrice,
          state.positionSize,
          exitValue - exitFee,
          exitFee,
          state.entryPrice,
          currentStopPrice,
          atr,
          0
        );
        tradeAuditTrail.push(tradeAudit);

        state.cash = exitValue - exitFee;
        state.position = "NONE";
        state.positionSize = 0;
        state.trades++;
        stopState = initTrailingStopState();
      } else {
        // Partial close
        const closeValue = exitValue * partialPercent;
        const exitFee = calculateTradeFee(closeValue, exchangeFeePercent, gasFeePerTrade);
        const remainingValue = exitValue * (1 - partialPercent);

        tradeAction = previousPosition === "LONG" ? "PARTIAL_CLOSE_LONG" : "PARTIAL_CLOSE_SHORT";

        tradeAudit = createAuditEntry(
          date,
          tradeAction,
          closePrice,
          state.positionSize * partialPercent,
          closeValue - exitFee,
          exitFee,
          state.entryPrice,
          currentStopPrice,
          atr,
          remainingValue
        );
        tradeAuditTrail.push(tradeAudit);

        state.cash = closeValue - exitFee;
        state.positionSize = remainingValue;
        stopState.hasPartialClosed = true;
        stopState.remainingPositionSize = remainingValue;
        state.trades++;
      }
    }

    // 4. Calculate portfolio value
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

    // 5. Check SMA signal
    const targetPosition = determineSignal(closePrice, sma, buyOnLong, shortOnShort);
    const previousPosition = state.position;

    if (targetPosition !== state.position && !tradeAction) {
      if (state.position !== "NONE") {
        const exitValue = calculatePortfolioValue(
          state,
          closePrice,
          longLeverage,
          shortLeverage
        );
        const exitFee = calculateTradeFee(exitValue, exchangeFeePercent, gasFeePerTrade);
        tradeAction = previousPosition === "LONG" ? "EXIT_LONG" : "EXIT_SHORT";

        tradeAudit = createAuditEntry(
          date,
          tradeAction,
          closePrice,
          state.positionSize,
          exitValue - exitFee,
          exitFee,
          state.entryPrice,
          currentStopPrice,
          atr,
          0
        );
        tradeAuditTrail.push(tradeAudit);

        state.cash = exitValue - exitFee;
        state.position = "NONE";
        state.positionSize = 0;
        state.trades++;
        stopState = initTrailingStopState();
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

          // Initialize trailing stop state for new position
          stopState = initTrailingStopState();
          stopState.originalPositionSize = entryCapital;
          stopState.remainingPositionSize = entryCapital;
          stopState.highestCloseSinceEntry = closePrice;
          stopState.lowestCloseSinceEntry = closePrice;

          tradeAudit = createAuditEntry(
            date,
            tradeAction,
            closePrice,
            entryCapital,
            entryCapital,
            entryFee,
            closePrice,
            null,
            atr,
            entryCapital
          );
          tradeAuditTrail.push(tradeAudit);
        }
      }
    }

    // 6. Record daily state with audit info
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
      atr,
      trailingStopPrice: state.position !== "NONE" ? currentStopPrice : null,
      tradeAudit,
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
      trailingStopTriggers: trailingStopEnabled ? trailingStopTriggers : undefined,
      tradeAuditTrail: tradeAuditTrail.length > 0 ? tradeAuditTrail : undefined,
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
