import { describe, it, expect } from 'vitest'
import { generateSignal, generateSignals } from './signals'
import type { PricePoint } from '../types/trading'

function createPricePoint(closePrice: number, timestamp = 0): PricePoint {
  return {
    unixTimestamp: timestamp,
    date: new Date(timestamp * 1000),
    closePrice,
  }
}

describe('generateSignal', () => {
  describe('happy path', () => {
    it('returns long when price is above upper band', () => {
      const result = generateSignal(110, 100, 'neutral', 0.05)
      expect(result).toBe('long')
    })

    it('returns short when price is below lower band', () => {
      const result = generateSignal(90, 100, 'neutral', 0.05)
      expect(result).toBe('short')
    })

    it('maintains previous signal within bands', () => {
      expect(generateSignal(100, 100, 'long', 0.05)).toBe('long')
      expect(generateSignal(100, 100, 'short', 0.05)).toBe('short')
    })

    it('defaults to short when neutral and within bands', () => {
      const result = generateSignal(100, 100, 'neutral', 0.05)
      expect(result).toBe('short')
    })
  })

  describe('threshold behavior', () => {
    it('respects zero threshold (exact MA crossover)', () => {
      expect(generateSignal(100.01, 100, 'short', 0)).toBe('long')
      expect(generateSignal(99.99, 100, 'long', 0)).toBe('short')
      expect(generateSignal(100, 100, 'long', 0)).toBe('long')
    })

    it('respects larger threshold', () => {
      expect(generateSignal(109, 100, 'short', 0.1)).toBe('short')
      expect(generateSignal(111, 100, 'short', 0.1)).toBe('long')
      expect(generateSignal(91, 100, 'long', 0.1)).toBe('long')
      expect(generateSignal(89, 100, 'long', 0.1)).toBe('short')
    })
  })

  describe('edge cases', () => {
    it('returns neutral when MA is undefined', () => {
      const result = generateSignal(100, undefined, 'long', 0.05)
      expect(result).toBe('neutral')
    })

    it('handles price exactly at upper band', () => {
      const result = generateSignal(105, 100, 'short', 0.05)
      expect(result).toBe('short')
    })

    it('handles price exactly at lower band', () => {
      const result = generateSignal(95, 100, 'long', 0.05)
      expect(result).toBe('long')
    })

    it('handles zero price', () => {
      const result = generateSignal(0, 100, 'neutral', 0.05)
      expect(result).toBe('short')
    })

    it('handles zero MA', () => {
      const result = generateSignal(100, 0, 'neutral', 0.05)
      expect(result).toBe('long')
    })

    it('handles negative threshold (invalid but handled)', () => {
      const result = generateSignal(100, 100, 'neutral', -0.05)
      expect(result).toBe('short')
    })
  })
})

describe('generateSignals', () => {
  describe('happy path', () => {
    it('generates signals for price series', () => {
      const priceData: PricePoint[] = [
        createPricePoint(100, 1000),
        createPricePoint(102, 2000),
        createPricePoint(104, 3000),
        createPricePoint(106, 4000),
        createPricePoint(108, 5000),
      ]

      const result = generateSignals(priceData, 3, 0)

      expect(result).toHaveLength(5)
      result.forEach((point, i) => {
        expect(point.closePrice).toBe(priceData[i].closePrice)
        expect(point.unixTimestamp).toBe(priceData[i].unixTimestamp)
      })
    })

    it('sets undefined SMA before MA period is reached', () => {
      const priceData = [
        createPricePoint(100),
        createPricePoint(102),
        createPricePoint(104),
      ]

      const result = generateSignals(priceData, 3, 0)

      expect(result[0].sma).toBeUndefined()
      expect(result[1].sma).toBeUndefined()
      expect(result[2].sma).toBeDefined()
    })

    it('calculates SMA correctly', () => {
      const priceData = [
        createPricePoint(10),
        createPricePoint(20),
        createPricePoint(30),
      ]

      const result = generateSignals(priceData, 3, 0)

      expect(result[2].sma).toBe(20)
    })

    it('propagates previous signal within bands', () => {
      const priceData = [
        createPricePoint(100),
        createPricePoint(100),
        createPricePoint(150),
        createPricePoint(150),
      ]

      const result = generateSignals(priceData, 2, 0)

      expect(result[0].smaSignal).toBe('neutral')
      expect(result[1].smaSignal).toBe('short')
      expect(result[2].smaSignal).toBe('long')
      expect(result[3].smaSignal).toBe('long')
    })
  })

  describe('threshold behavior', () => {
    it('applies threshold to signal generation', () => {
      const priceData = [
        createPricePoint(100),
        createPricePoint(100),
        createPricePoint(100),
        createPricePoint(104),
      ]

      const resultNoThreshold = generateSignals(priceData, 2, 0)
      const resultWithThreshold = generateSignals(priceData, 2, 0.05)

      expect(resultNoThreshold[3].smaSignal).toBe('long')
      expect(resultWithThreshold[3].smaSignal).toBe('short')
    })

    it('uses default threshold of 0', () => {
      const priceData = [
        createPricePoint(100),
        createPricePoint(100),
        createPricePoint(101),
      ]

      const result = generateSignals(priceData, 2)

      expect(result[2].smaSignal).toBe('long')
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      const result = generateSignals([], 5, 0)
      expect(result).toEqual([])
    })

    it('handles single data point', () => {
      const priceData = [createPricePoint(100)]
      const result = generateSignals(priceData, 2, 0)

      expect(result).toHaveLength(1)
      expect(result[0].sma).toBeUndefined()
      expect(result[0].smaSignal).toBe('neutral')
    })

    it('handles period of 1', () => {
      const priceData = [
        createPricePoint(100),
        createPricePoint(110),
      ]

      const result = generateSignals(priceData, 1, 0)

      expect(result[0].sma).toBe(100)
      expect(result[1].sma).toBe(110)
    })

    it('preserves all original price point data', () => {
      const priceData = [
        createPricePoint(100, 1234567890),
        createPricePoint(200, 1234567891),
      ]

      const result = generateSignals(priceData, 2, 0)

      expect(result[0].unixTimestamp).toBe(1234567890)
      expect(result[0].closePrice).toBe(100)
      expect(result[1].unixTimestamp).toBe(1234567891)
      expect(result[1].closePrice).toBe(200)
    })
  })
})
