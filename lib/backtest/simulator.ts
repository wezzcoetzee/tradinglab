import type { PricePoint, MaResult, Signal, DailyData, LeverageConfig } from "./types";

interface SimulatorParams {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  leverage: LeverageConfig;
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
  const { initialCapital, exchangeFeePercent, gasFeePerTrade, buyOnLong, shortOnShort, leverage } = params;

  let cash = initialCapital;
  let position: Position = "CASH";
  let entryPrice = 0;
  let entryCapital = 0;
  let trades = 0;
  let liquidated = false;

  const balances: number[] = [];

  for (let i = 0; i < pricePoints.length; i++) {
    const { closePrice } = pricePoints[i];
    const ma = maValues[i];

    if (liquidated) {
      balances.push(0);
      continue;
    }

    const signal: Signal = ma !== null && closePrice > ma ? 1 : 0;
    const targetPosition = determinePosition(signal, buyOnLong, shortOnShort);

    if (targetPosition !== position) {
      if (position === "LONG") {
        const priceChange = (closePrice - entryPrice) / entryPrice;
        const leveragedReturn = priceChange * leverage.long;
        const exitValue = entryCapital * (1 + leveragedReturn);
        const fee = calculateTradeFee(Math.max(0, exitValue), exchangeFeePercent, gasFeePerTrade);
        cash = Math.max(0, exitValue - fee);
        entryPrice = 0;
        entryCapital = 0;
        trades++;
      } else if (position === "SHORT") {
        const priceChange = (closePrice - entryPrice) / entryPrice;
        const leveragedReturn = -priceChange * leverage.short;
        const exitValue = entryCapital * (1 + leveragedReturn);
        const fee = calculateTradeFee(Math.max(0, exitValue), exchangeFeePercent, gasFeePerTrade);
        cash = Math.max(0, exitValue - fee);
        entryPrice = 0;
        entryCapital = 0;
        trades++;
      }

      if (targetPosition === "LONG" && cash > 0) {
        const fee = calculateTradeFee(cash, exchangeFeePercent, gasFeePerTrade);
        entryCapital = cash - fee;
        entryPrice = closePrice;
        cash = 0;
        trades++;
      } else if (targetPosition === "SHORT" && cash > 0) {
        const fee = calculateTradeFee(cash, exchangeFeePercent, gasFeePerTrade);
        entryCapital = cash - fee;
        entryPrice = closePrice;
        cash = 0;
        trades++;
      }

      position = targetPosition;
    }

    let portfolioValue: number;
    if (position === "LONG") {
      const priceChange = (closePrice - entryPrice) / entryPrice;
      const leveragedReturn = priceChange * leverage.long;
      portfolioValue = entryCapital * (1 + leveragedReturn);

      if (leveragedReturn <= -1) {
        liquidated = true;
        portfolioValue = 0;
        cash = 0;
        entryCapital = 0;
        position = "CASH";
      }
    } else if (position === "SHORT") {
      const priceChange = (closePrice - entryPrice) / entryPrice;
      const leveragedReturn = -priceChange * leverage.short;
      portfolioValue = entryCapital * (1 + leveragedReturn);

      if (leveragedReturn <= -1) {
        liquidated = true;
        portfolioValue = 0;
        cash = 0;
        entryCapital = 0;
        position = "CASH";
      }
    } else {
      portfolioValue = cash;
    }

    balances.push(Math.max(0, portfolioValue));
  }

  const lastPrice = pricePoints[pricePoints.length - 1].closePrice;
  let finalValue: number;

  if (liquidated) {
    finalValue = 0;
  } else if (position === "LONG") {
    const priceChange = (lastPrice - entryPrice) / entryPrice;
    const leveragedReturn = priceChange * leverage.long;
    finalValue = entryCapital * (1 + leveragedReturn);
  } else if (position === "SHORT") {
    const priceChange = (lastPrice - entryPrice) / entryPrice;
    const leveragedReturn = -priceChange * leverage.short;
    finalValue = entryCapital * (1 + leveragedReturn);
  } else {
    finalValue = cash;
  }

  finalValue = Math.max(0, finalValue);
  const totalReturn = (finalValue - initialCapital) / initialCapital;

  return {
    result: {
      period: 0,
      totalReturn,
      finalValue,
      trades,
      leverage: { ...leverage },
      liquidated,
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
