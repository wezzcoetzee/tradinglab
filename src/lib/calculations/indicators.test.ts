import { describe, it, expect } from 'vitest'
import { calculateSMA } from './indicators'

describe('calculateSMA', () => {
  describe('happy path', () => {
    it('calculates correct SMA for period 3', () => {
      const prices = [10, 20, 30, 40, 50]
      const result = calculateSMA(prices, 3)

      expect(result).toEqual([
        undefined,
        undefined,
        20, // (10+20+30)/3
        30, // (20+30+40)/3
        40, // (30+40+50)/3
      ])
    })

    it('calculates correct SMA for period 2', () => {
      const prices = [10, 20, 30, 40]
      const result = calculateSMA(prices, 2)

      expect(result).toEqual([
        undefined,
        15, // (10+20)/2
        25, // (20+30)/2
        35, // (30+40)/2
      ])
    })

    it('calculates correct SMA for period 1 (just the values)', () => {
      const prices = [10, 20, 30]
      const result = calculateSMA(prices, 1)

      expect(result).toEqual([10, 20, 30])
    })

    it('handles decimal prices correctly', () => {
      const prices = [10.5, 20.3, 30.7]
      const result = calculateSMA(prices, 2)

      expect(result[0]).toBeUndefined()
      expect(result[1]).toBeCloseTo(15.4) // (10.5+20.3)/2
      expect(result[2]).toBeCloseTo(25.5) // (20.3+30.7)/2
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      const result = calculateSMA([], 3)
      expect(result).toEqual([])
    })

    it('returns all undefined when period exceeds array length', () => {
      const prices = [10, 20]
      const result = calculateSMA(prices, 5)

      expect(result).toEqual([undefined, undefined])
    })

    it('handles single element array', () => {
      const prices = [100]
      const result = calculateSMA(prices, 1)

      expect(result).toEqual([100])
    })

    it('handles single element with period > 1', () => {
      const prices = [100]
      const result = calculateSMA(prices, 2)

      expect(result).toEqual([undefined])
    })

    it('handles period equal to array length', () => {
      const prices = [10, 20, 30]
      const result = calculateSMA(prices, 3)

      expect(result).toEqual([undefined, undefined, 20])
    })

    it('handles very large numbers', () => {
      const prices = [1e15, 2e15, 3e15]
      const result = calculateSMA(prices, 2)

      expect(result[0]).toBeUndefined()
      expect(result[1]).toBeCloseTo(1.5e15)
      expect(result[2]).toBeCloseTo(2.5e15)
    })

    it('handles zero values', () => {
      const prices = [0, 0, 10, 20]
      const result = calculateSMA(prices, 2)

      expect(result).toEqual([undefined, 0, 5, 15])
    })

    it('handles negative numbers', () => {
      const prices = [-10, 20, -30, 40]
      const result = calculateSMA(prices, 2)

      expect(result).toEqual([undefined, 5, -5, 5])
    })
  })

  describe('rolling sum correctness', () => {
    it('produces same results as naive implementation for longer series', () => {
      const prices = [100, 102, 98, 105, 110, 108, 112, 115, 113, 118]
      const period = 4
      const result = calculateSMA(prices, period)

      for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1)
        const expected = slice.reduce((a, b) => a + b, 0) / period
        expect(result[i]).toBeCloseTo(expected)
      }
    })
  })
})
