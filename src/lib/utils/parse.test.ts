import { describe, it, expect } from 'vitest'
import { parseIntOrDefault } from './parse'

describe('parseIntOrDefault', () => {
  describe('happy path', () => {
    it('parses valid integer string', () => {
      expect(parseIntOrDefault('42', 0)).toBe(42)
    })

    it('parses zero', () => {
      expect(parseIntOrDefault('0', 100)).toBe(0)
    })

    it('parses negative numbers', () => {
      expect(parseIntOrDefault('-10', 0)).toBe(-10)
    })

    it('parses numbers with leading zeros', () => {
      expect(parseIntOrDefault('007', 0)).toBe(7)
    })

    it('parses large numbers', () => {
      expect(parseIntOrDefault('999999999', 0)).toBe(999999999)
    })
  })

  describe('default value cases', () => {
    it('returns default for empty string', () => {
      expect(parseIntOrDefault('', 100)).toBe(100)
    })

    it('returns default for non-numeric string', () => {
      expect(parseIntOrDefault('abc', 50)).toBe(50)
    })

    it('returns default for undefined coerced to string', () => {
      expect(parseIntOrDefault('undefined', 25)).toBe(25)
    })

    it('returns default for null coerced to string', () => {
      expect(parseIntOrDefault('null', 25)).toBe(25)
    })

    it('returns default for whitespace-only string', () => {
      expect(parseIntOrDefault('   ', 10)).toBe(10)
    })

    it('uses default value of 0', () => {
      expect(parseIntOrDefault('invalid', 0)).toBe(0)
    })

    it('uses negative default value', () => {
      expect(parseIntOrDefault('invalid', -1)).toBe(-1)
    })
  })

  describe('edge cases', () => {
    it('truncates decimal portion', () => {
      expect(parseIntOrDefault('3.14', 0)).toBe(3)
      expect(parseIntOrDefault('3.99', 0)).toBe(3)
    })

    it('handles string with leading/trailing spaces', () => {
      expect(parseIntOrDefault('  42  ', 0)).toBe(42)
    })

    it('handles string starting with number then letters', () => {
      expect(parseIntOrDefault('42abc', 0)).toBe(42)
    })

    it('returns default for string starting with letters', () => {
      expect(parseIntOrDefault('abc42', 0)).toBe(0)
    })

    it('handles plus sign', () => {
      expect(parseIntOrDefault('+42', 0)).toBe(42)
    })

    it('handles scientific notation as partial parse', () => {
      expect(parseIntOrDefault('1e5', 0)).toBe(1)
    })

    it('handles Infinity string', () => {
      expect(parseIntOrDefault('Infinity', 0)).toBe(0)
    })

    it('handles NaN string', () => {
      expect(parseIntOrDefault('NaN', 0)).toBe(0)
    })

    it('handles very large number string', () => {
      const bigNum = '9007199254740993'
      const result = parseIntOrDefault(bigNum, 0)
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('boundary conditions', () => {
    it('handles MAX_SAFE_INTEGER', () => {
      expect(parseIntOrDefault(String(Number.MAX_SAFE_INTEGER), 0)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles MIN_SAFE_INTEGER', () => {
      expect(parseIntOrDefault(String(Number.MIN_SAFE_INTEGER), 0)).toBe(Number.MIN_SAFE_INTEGER)
    })
  })
})
