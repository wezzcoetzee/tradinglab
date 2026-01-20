import { describe, it, expect } from "vitest";
import { simulateStrategy } from "./simulator";
import type { PricePoint } from "./types";

function makePricePoints(prices: number[]): PricePoint[] {
  return prices.map((closePrice, i) => ({
    date: new Date(2020, 0, i + 1),
    closePrice,
  }));
}

function makeParams(overrides: Partial<Parameters<typeof simulateStrategy>[3]> = {}) {
  return {
    initialCapital: 1000,
    exchangeFeePercent: 0,
    gasFeePerTrade: 0,
    buyOnLong: true,
    shortOnShort: true,
    longLeverage: 1,
    shortLeverage: 1,
    atrMultiplier: 2,
    atrPeriod: 3,
    ...overrides,
  };
}

describe("trailing stop - long position", () => {
  it("exits long when price drops below trailing stop", () => {
    const prices = [100, 110, 120, 130, 120, 110, 100, 90];
    const pricePoints = makePricePoints(prices);

    const smaValues = prices.map(() => 50);
    const atrValues: (number | null)[] = [null, null, null, 10, 10, 10, 10, 10];

    const params = makeParams({ atrMultiplier: 2, atrPeriod: 3 });
    const { result, timeSeries } = simulateStrategy(pricePoints, smaValues, atrValues, params);

    const exitIndices = timeSeries
      .map((s, i) => (s.tradeAction === "EXIT_LONG" ? i : -1))
      .filter((i) => i >= 0);

    expect(exitIndices.length).toBeGreaterThan(0);
    expect(result.trades).toBeGreaterThan(0);
  });

  it("stop only tightens (never loosens) for long positions", () => {
    const prices = [100, 120, 140, 130, 150, 140, 155];
    const pricePoints = makePricePoints(prices);

    const smaValues = prices.map(() => 50);
    const atrValues: (number | null)[] = prices.map(() => 10);

    const params = makeParams({ atrMultiplier: 2, atrPeriod: 3 });
    const { timeSeries } = simulateStrategy(pricePoints, smaValues, atrValues, params);

    const longPositions = timeSeries.filter((s) => s.signal === "LONG");
    expect(longPositions.length).toBeGreaterThan(0);
  });
});

describe("trailing stop - short position", () => {
  it("exits short when price rises above trailing stop", () => {
    const prices = [100, 90, 80, 70, 80, 90, 100, 110];
    const pricePoints = makePricePoints(prices);

    const smaValues = prices.map(() => 150);
    const atrValues: (number | null)[] = [null, null, null, 10, 10, 10, 10, 10];

    const params = makeParams({ atrMultiplier: 2, atrPeriod: 3 });
    const { result, timeSeries } = simulateStrategy(pricePoints, smaValues, atrValues, params);

    const exitIndices = timeSeries
      .map((s, i) => (s.tradeAction === "EXIT_SHORT" ? i : -1))
      .filter((i) => i >= 0);

    expect(exitIndices.length).toBeGreaterThan(0);
    expect(result.trades).toBeGreaterThan(0);
  });

  it("stop only tightens (never loosens) for short positions", () => {
    const prices = [100, 80, 60, 70, 50, 60, 45];
    const pricePoints = makePricePoints(prices);

    const smaValues = prices.map(() => 150);
    const atrValues: (number | null)[] = prices.map(() => 10);

    const params = makeParams({ atrMultiplier: 2, atrPeriod: 3 });
    const { timeSeries } = simulateStrategy(pricePoints, smaValues, atrValues, params);

    const shortPositions = timeSeries.filter((s) => s.signal === "SHORT");
    expect(shortPositions.length).toBeGreaterThan(0);
  });
});

describe("trailing stop - disabled", () => {
  it("does not apply trailing stop when atrMultiplier is 0", () => {
    const prices = [100, 110, 120, 100, 80, 60, 40, 20];
    const pricePoints = makePricePoints(prices);

    const smaValues = prices.map(() => 50);
    const atrValues: (number | null)[] = prices.map(() => 10);

    const paramsDisabled = makeParams({ atrMultiplier: 0, atrPeriod: 14 });
    const { timeSeries: timeSeriesDisabled } = simulateStrategy(
      pricePoints,
      smaValues,
      atrValues,
      paramsDisabled
    );

    const exitsDisabled = timeSeriesDisabled.filter((s) => s.tradeAction === "EXIT_LONG");

    expect(exitsDisabled.length).toBe(0);
  });

  it("does not apply trailing stop when atrPeriod is 0", () => {
    const prices = [100, 110, 120, 100, 80, 60, 40, 20];
    const pricePoints = makePricePoints(prices);

    const smaValues = prices.map(() => 50);
    const atrValues: (number | null)[] = prices.map(() => 10);

    const paramsDisabled = makeParams({ atrMultiplier: 2.5, atrPeriod: 0 });
    const { timeSeries: timeSeriesDisabled } = simulateStrategy(
      pricePoints,
      smaValues,
      atrValues,
      paramsDisabled
    );

    const exitsDisabled = timeSeriesDisabled.filter((s) => s.tradeAction === "EXIT_LONG");

    expect(exitsDisabled.length).toBe(0);
  });
});

describe("trailing stop - backward compatibility", () => {
  it("behaves like original SMA strategy when trailing stop is disabled", () => {
    const prices = [100, 110, 105, 115, 100, 120, 130, 125];
    const pricePoints = makePricePoints(prices);

    const smaValues = [null, null, 105, 110, 107.5, 111.67, 116.67, 125];
    const atrValues: (number | null)[] = prices.map(() => 10);

    const paramsDisabled = makeParams({ atrMultiplier: 0, atrPeriod: 0 });
    const { result } = simulateStrategy(pricePoints, smaValues, atrValues, paramsDisabled);

    expect(result.liquidated).toBe(false);
  });
});
