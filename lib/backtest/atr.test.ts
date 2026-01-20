import { describe, it, expect } from "vitest";
import { calculateAtr, calculateTrueRange } from "./atr";

describe("calculateTrueRange", () => {
  it("returns null for the first bar", () => {
    const prices = [100, 105, 95, 100];
    const result = calculateTrueRange(prices);
    expect(result[0]).toBeNull();
  });

  it("calculates correct TR values as absolute price changes", () => {
    const prices = [100, 105, 95, 100];
    const result = calculateTrueRange(prices);
    expect(result).toEqual([null, 5, 10, 5]);
  });

  it("handles single bar edge case", () => {
    const prices = [100];
    const result = calculateTrueRange(prices);
    expect(result).toEqual([null]);
  });

  it("handles empty array", () => {
    const prices: number[] = [];
    const result = calculateTrueRange(prices);
    expect(result).toEqual([]);
  });
});

describe("calculateAtr", () => {
  it("returns nulls for insufficient data", () => {
    const prices = [100, 105, 95, 100, 110];
    const period = 14;
    const result = calculateAtr(prices, period);
    expect(result.every((v) => v === null)).toBe(true);
  });

  it("calculates correct ATR with known values", () => {
    const prices = [100, 105, 102, 108, 104, 110, 106];
    const period = 3;
    const result = calculateAtr(prices, period);

    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull();

    const tr1 = Math.abs(102 - 105);
    const tr2 = Math.abs(108 - 102);
    const tr3 = Math.abs(104 - 108);
    const expectedAtr3 = (tr1 + tr2 + tr3) / 3;
    expect(result[3]).toBeCloseTo(expectedAtr3, 10);
  });

  it("returns all nulls when period is larger than data length", () => {
    const prices = [100, 105, 95];
    const period = 10;
    const result = calculateAtr(prices, period);
    expect(result.every((v) => v === null)).toBe(true);
  });

  it("correctly uses rolling window for ATR calculation", () => {
    const prices = [100, 102, 104, 106, 108, 110, 112, 114];
    const period = 3;
    const result = calculateAtr(prices, period);

    const trValues = [null, 2, 2, 2, 2, 2, 2, 2];

    expect(result[3]).toBeCloseTo(2, 10);
    expect(result[4]).toBeCloseTo(2, 10);
    expect(result[5]).toBeCloseTo(2, 10);
  });

  it("handles period of 1", () => {
    const prices = [100, 105, 95];
    const period = 1;
    const result = calculateAtr(prices, period);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeCloseTo(5, 10);
    expect(result[2]).toBeCloseTo(10, 10);
  });
});
