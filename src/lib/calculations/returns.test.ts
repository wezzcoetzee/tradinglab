import { describe, it, expect } from 'vitest'
import {
  calculateHODLReturns,
  calculateStrategyReturns,
  calculateAnnualizedReturn,
  calculateMaxDrawdown,
  computeRunningDrawdowns,
} from './returns'
import type { DataPointWithIndicators, StrategyParams } from '../types/trading'

function createDataPoint(
  closePrice: number,
  signal: 'long' | 'short' | 'neutral' = 'neutral',
  timestamp = 0
): DataPointWithIndicators {
  return {
    unixTimestamp: timestamp,
    date: new Date(timestamp * 1000),
    closePrice,
    smaSignal: signal,
  }
}

function createDefaultParams(overrides: Partial<StrategyParams> = {}): StrategyParams {
  return {
    maDuration: 20,
    buyOnLongSignal: true,
    shortOnShort: false,
    longLeverage: 1,
    shortLeverage: 1,
    initialCapital: 1000,
    gasFeePerTrade: 0,
    exchangeFee: 0,
    signalThreshold: 0,
    ...overrides,
  }
}

describe('calculateHODLReturns', () => {
  describe('happy path', () => {
    it('calculates returns relative to initial price', () => {
      const dataPoints = [
        createDataPoint(100),
        createDataPoint(110),
        createDataPoint(120),
      ]

      const result = calculateHODLReturns(dataPoints)

      expect(result).toEqual([1, 1.1, 1.2])
    })

    it('handles price decrease', () => {
      const dataPoints = [
        createDataPoint(100),
        createDataPoint(80),
        createDataPoint(90),
      ]

      const result = calculateHODLReturns(dataPoints)

      expect(result).toEqual([1, 0.8, 0.9])
    })

    it('respects simulationStartIndex', () => {
      const dataPoints = [
        createDataPoint(50),
        createDataPoint(100),
        createDataPoint(150),
      ]

      const result = calculateHODLReturns(dataPoints, 1)

      expect(result).toEqual([1, 1.5])
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      expect(calculateHODLReturns([])).toEqual([])
    })

    it('handles single data point', () => {
      const dataPoints = [createDataPoint(100)]
      expect(calculateHODLReturns(dataPoints)).toEqual([1])
    })

    it('clamps simulationStartIndex to valid range', () => {
      const dataPoints = [
        createDataPoint(100),
        createDataPoint(200),
      ]

      const result = calculateHODLReturns(dataPoints, 10)
      expect(result).toEqual([1])
    })

    it('handles negative simulationStartIndex', () => {
      const dataPoints = [
        createDataPoint(100),
        createDataPoint(200),
      ]

      const result = calculateHODLReturns(dataPoints, -5)
      expect(result).toEqual([1, 2])
    })
  })
})

describe('calculateStrategyReturns', () => {
  describe('happy path', () => {
    it('returns initial capital ratio when staying neutral', () => {
      const dataPoints = [
        createDataPoint(100, 'neutral'),
        createDataPoint(110, 'neutral'),
        createDataPoint(120, 'neutral'),
      ]
      const params = createDefaultParams()

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns).toEqual([1, 1, 1])
      expect(result.trades).toEqual([])
    })

    it('tracks long position returns with leverage 1', () => {
      const dataPoints = [
        createDataPoint(100, 'long', 1000),
        createDataPoint(110, 'long', 2000),
        createDataPoint(120, 'long', 3000),
      ]
      const params = createDefaultParams({ buyOnLongSignal: true })

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns[0]).toBe(1)
      expect(result.returns[1]).toBeCloseTo(1.1)
      expect(result.returns[2]).toBeCloseTo(1.2)
    })

    it('applies leverage correctly', () => {
      const dataPoints = [
        createDataPoint(100, 'long', 1000),
        createDataPoint(110, 'long', 2000),
      ]
      const params = createDefaultParams({ longLeverage: 2 })

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns[1]).toBeCloseTo(1.2)
    })

    it('records trades on position exit', () => {
      const dataPoints = [
        createDataPoint(100, 'long', 1000),
        createDataPoint(110, 'long', 2000),
        createDataPoint(120, 'neutral', 3000),
      ]
      const params = createDefaultParams()

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.trades).toHaveLength(1)
      expect(result.trades[0].entryTimestamp).toBe(1000)
      expect(result.trades[0].exitTimestamp).toBe(3000)
      expect(result.trades[0].entryPrice).toBe(100)
      expect(result.trades[0].exitPrice).toBe(120)
      expect(result.trades[0].position).toBe('long')
    })
  })

  describe('fee application', () => {
    it('applies gas fee on entry', () => {
      const dataPoints = [
        createDataPoint(100, 'long', 1000),
        createDataPoint(100, 'long', 2000),
      ]
      const params = createDefaultParams({ gasFeePerTrade: 10 })

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns[0]).toBe(0.99)
    })

    it('applies exchange fee on entry', () => {
      const dataPoints = [
        createDataPoint(100, 'long', 1000),
        createDataPoint(100, 'long', 2000),
      ]
      const params = createDefaultParams({ exchangeFee: 0.01 })

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns[0]).toBe(0.99)
    })

    it('applies fees on position transitions', () => {
      const dataPoints = [
        createDataPoint(100, 'long', 1000),
        createDataPoint(100, 'neutral', 2000),
      ]
      const params = createDefaultParams({ gasFeePerTrade: 10 })

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns[0]).toBe(0.99)
      expect(result.returns[1]).toBe(0.98)
    })
  })

  describe('edge cases', () => {
    it('returns empty for empty input', () => {
      const params = createDefaultParams()
      const result = calculateStrategyReturns([], params)

      expect(result.returns).toEqual([])
      expect(result.trades).toEqual([])
    })

    it('handles single data point', () => {
      const dataPoints = [createDataPoint(100, 'neutral')]
      const params = createDefaultParams()

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns).toEqual([1])
    })

    it('respects simulationStartIndex', () => {
      const dataPoints = [
        createDataPoint(50, 'neutral', 1000),
        createDataPoint(100, 'long', 2000),
        createDataPoint(110, 'long', 3000),
      ]
      const params = createDefaultParams()

      const result = calculateStrategyReturns(dataPoints, params, 1)

      expect(result.returns).toHaveLength(2)
      expect(result.returns[0]).toBe(1)
      expect(result.returns[1]).toBeCloseTo(1.1)
    })

    it('does not enter long when buyOnLongSignal is false', () => {
      const dataPoints = [
        createDataPoint(100, 'long'),
        createDataPoint(110, 'long'),
      ]
      const params = createDefaultParams({ buyOnLongSignal: false })

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns).toEqual([1, 1])
    })

    it('enters short when shortOnShort is true', () => {
      const dataPoints = [
        createDataPoint(100, 'short'),
        createDataPoint(90, 'short'),
      ]
      const params = createDefaultParams({ shortOnShort: true })

      const result = calculateStrategyReturns(dataPoints, params)

      expect(result.returns[0]).toBe(1)
      expect(result.returns[1]).toBe(1)
    })
  })
})

describe('calculateAnnualizedReturn', () => {
  describe('happy path', () => {
    it('calculates correct annualized return for 1 year', () => {
      const result = calculateAnnualizedReturn(1.1, 1, 365)
      expect(result).toBeCloseTo(0.1)
    })

    it('calculates correct annualized return for 2 years', () => {
      const result = calculateAnnualizedReturn(1.21, 1, 730)
      expect(result).toBeCloseTo(0.1)
    })

    it('handles high returns', () => {
      const result = calculateAnnualizedReturn(2, 1, 365)
      expect(result).toBeCloseTo(1)
    })

    it('handles losses', () => {
      const result = calculateAnnualizedReturn(0.9, 1, 365)
      expect(result).toBeCloseTo(-0.1)
    })
  })

  describe('edge cases', () => {
    it('returns 0 for zero days', () => {
      expect(calculateAnnualizedReturn(1.1, 1, 0)).toBe(0)
    })

    it('returns 0 for negative days', () => {
      expect(calculateAnnualizedReturn(1.1, 1, -10)).toBe(0)
    })

    it('returns 0 for zero initial value', () => {
      expect(calculateAnnualizedReturn(1.1, 0, 365)).toBe(0)
    })

    it('returns 0 for negative initial value', () => {
      expect(calculateAnnualizedReturn(1.1, -1, 365)).toBe(0)
    })

    it('handles very short periods', () => {
      const result = calculateAnnualizedReturn(1.01, 1, 1)
      expect(result).toBeGreaterThan(0)
    })
  })
})

describe('calculateMaxDrawdown', () => {
  describe('happy path', () => {
    it('calculates drawdown for simple decline', () => {
      const returns = [1, 0.9, 0.8]
      const result = calculateMaxDrawdown(returns)

      expect(result).toBeCloseTo(0.2)
    })

    it('tracks peak correctly through recovery', () => {
      const returns = [1, 1.1, 1.0, 1.2]
      const result = calculateMaxDrawdown(returns)

      expect(result).toBeCloseTo(0.0909, 3)
    })

    it('finds maximum across multiple drawdowns', () => {
      const returns = [1, 0.95, 1.0, 0.85, 1.0]
      const result = calculateMaxDrawdown(returns)

      expect(result).toBeCloseTo(0.15)
    })
  })

  describe('edge cases', () => {
    it('returns 0 for empty array', () => {
      expect(calculateMaxDrawdown([])).toBe(0)
    })

    it('returns 0 for monotonically increasing returns', () => {
      const returns = [1, 1.1, 1.2, 1.3]
      expect(calculateMaxDrawdown(returns)).toBe(0)
    })

    it('returns 0 for single element', () => {
      expect(calculateMaxDrawdown([1])).toBe(0)
    })

    it('handles flat returns', () => {
      const returns = [1, 1, 1, 1]
      expect(calculateMaxDrawdown(returns)).toBe(0)
    })
  })
})

describe('computeRunningDrawdowns', () => {
  describe('happy path', () => {
    it('computes running max drawdown correctly', () => {
      const returns = [1, 0.9, 0.95, 0.85]
      const result = computeRunningDrawdowns(returns)

      expect(result).toHaveLength(4)
      expect(result[0]).toBe(0)
      expect(result[1]).toBeCloseTo(0.1)
      expect(result[2]).toBeCloseTo(0.1)
      expect(result[3]).toBeCloseTo(0.15)
    })

    it('maintains max drawdown after recovery', () => {
      const returns = [1, 0.8, 1.0, 1.2]
      const result = computeRunningDrawdowns(returns)

      expect(result[1]).toBeCloseTo(0.2)
      expect(result[2]).toBeCloseTo(0.2)
      expect(result[3]).toBeCloseTo(0.2)
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      expect(computeRunningDrawdowns([])).toEqual([])
    })

    it('returns [0] for single element', () => {
      expect(computeRunningDrawdowns([1])).toEqual([0])
    })
  })
})
