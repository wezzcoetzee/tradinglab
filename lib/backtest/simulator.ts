import type { PricePoint, MaResult, Signal, DailyData } from "./types";

interface SimulatorParams {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
}

type Position = "LONG" | "SHORT" | "CASH";

function calculateTradeFee(
  value: number,
  exchangeFeePercent: number,
  gasFee: number
): number {
  return value * (exchangeFeePercent / 100) + gasFee;
}

function determinePosition(
  signal: Signal,
  buyOnLong: boolean,
  shortOnShort: boolean
): Position {
  if (signal === 1 && buyOnLong) {
    return "LONG";
  }
  if (signal === 0 && shortOnShort) {
    return "SHORT";
  }
  return "CASH";
}

export function simulateMaStrategy(
  pricePoints: PricePoint[],
  maValues: (number | null)[],
  params: SimulatorParams
): { result: MaResult; balances: number[] } {
  const { initialCapital, exchangeFeePercent, gasFeePerTrade, buyOnLong, shortOnShort } = params;

  let cash = initialCapital;
  let position: Position = "CASH";
  let btcQuantity = 0;
  let shortEntryPrice = 0;
  let shortEntryValue = 0;
  let trades = 0;

  const balances: number[] = [];

  for (let i = 0; i < pricePoints.length; i++) {
    const { closePrice } = pricePoints[i];
    const ma = maValues[i];

    const signal: Signal = ma !== null && closePrice > ma ? 1 : 0;
    const targetPosition = determinePosition(signal, buyOnLong, shortOnShort);

    if (targetPosition !== position) {
      // Exit current position
      if (position === "LONG") {
        const exitValue = btcQuantity * closePrice;
        const fee = calculateTradeFee(exitValue, exchangeFeePercent, gasFeePerTrade);
        cash = exitValue - fee;
        btcQuantity = 0;
        trades++;
      } else if (position === "SHORT") {
        const priceChange = (closePrice - shortEntryPrice) / shortEntryPrice;
        const pnl = -priceChange * shortEntryValue;
        const exitValue = shortEntryValue + pnl;
        const fee = calculateTradeFee(exitValue, exchangeFeePercent, gasFeePerTrade);
        cash = exitValue - fee;
        shortEntryPrice = 0;
        shortEntryValue = 0;
        trades++;
      }

      // Enter new position
      if (targetPosition === "LONG" && cash > 0) {
        const fee = calculateTradeFee(cash, exchangeFeePercent, gasFeePerTrade);
        const entryCapital = cash - fee;
        btcQuantity = entryCapital / closePrice;
        cash = 0;
        trades++;
      } else if (targetPosition === "SHORT" && cash > 0) {
        const fee = calculateTradeFee(cash, exchangeFeePercent, gasFeePerTrade);
        shortEntryValue = cash - fee;
        shortEntryPrice = closePrice;
        cash = 0;
        trades++;
      }

      position = targetPosition;
    }

    // Calculate current portfolio value
    let portfolioValue: number;
    if (position === "LONG") {
      portfolioValue = btcQuantity * closePrice;
    } else if (position === "SHORT") {
      const priceChange = (closePrice - shortEntryPrice) / shortEntryPrice;
      portfolioValue = shortEntryValue * (1 - priceChange);
    } else {
      portfolioValue = cash;
    }

    balances.push(portfolioValue);
  }

  // Calculate final value
  const lastPrice = pricePoints[pricePoints.length - 1].closePrice;
  let finalValue: number;
  if (position === "LONG") {
    finalValue = btcQuantity * lastPrice;
  } else if (position === "SHORT") {
    const priceChange = (lastPrice - shortEntryPrice) / shortEntryPrice;
    finalValue = shortEntryValue * (1 - priceChange);
  } else {
    finalValue = cash;
  }

  const totalReturn = (finalValue - initialCapital) / initialCapital;

  return {
    result: {
      period: 0,
      totalReturn,
      finalValue,
      trades,
    },
    balances,
  };
}

export function calculateHodl(
  pricePoints: PricePoint[],
  initialCapital: number
): { totalReturn: number; finalValue: number; balances: number[] } {
  const startPrice = pricePoints[0].closePrice;
  const quantity = initialCapital / startPrice;

  const balances: number[] = [];
  for (const { closePrice } of pricePoints) {
    balances.push(quantity * closePrice);
  }

  const finalValue = quantity * pricePoints[pricePoints.length - 1].closePrice;
  const totalReturn = (finalValue - initialCapital) / initialCapital;

  return { totalReturn, finalValue, balances };
}

export function generateDailyData(
  pricePoints: PricePoint[],
  smaValues: (number | null)[],
  emaValues: (number | null)[],
  params: SimulatorParams
): DailyData[] {
  const { initialCapital } = params;

  const smaSimResult = simulateMaStrategy(pricePoints, smaValues, params);
  const smaBalances = smaSimResult.balances;

  // Simulate EMA strategy
  const emaSimResult = simulateMaStrategy(pricePoints, emaValues, params);
  const emaBalances = emaSimResult.balances;

  // Calculate HODL
  const hodlResult = calculateHodl(pricePoints, initialCapital);
  const hodlBalances = hodlResult.balances;

  const dailyData: DailyData[] = [];

  for (let i = 0; i < pricePoints.length; i++) {
    const { date, closePrice } = pricePoints[i];
    const sma = smaValues[i];
    const ema = emaValues[i];

    const smaSignal: Signal = sma !== null && closePrice > sma ? 1 : 0;
    const emaSignal: Signal = ema !== null && closePrice > ema ? 1 : 0;

    dailyData.push({
      day: i + 1,
      date,
      closePrice,
      sma,
      ema,
      smaSignal,
      emaSignal,
      hodlValue: hodlBalances[i],
      smaBalance: smaBalances[i],
      emaBalance: emaBalances[i],
    });
  }

  return dailyData;
}
