import { describe, expect, test } from 'bun:test';
import { generateBacktestConfigs } from './leverage-config';

const LEVERAGES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
const key = (...parts: (number | undefined)[]) => parts.join('|');

describe('generateBacktestConfigs', () => {
  test('should_generate_141_sma_periods_x_81_leverage_pairs_without_atr', () => {
    const result = generateBacktestConfigs(1000, 0.1, false, 20, 160);

    expect(result.length).toBe(11421);
    expect(result.every(c => c.atr === undefined)).toBe(true);
  });

  test('should_include_sma_range_inclusively_with_every_leverage_pair', () => {
    const result = generateBacktestConfigs(1000, 0.1, false, 20, 160);

    const smaPeriods = new Set(result.map(c => c.smaPeriod));
    expect(smaPeriods.size).toBe(141);
    expect(smaPeriods.has(20)).toBe(true);
    expect(smaPeriods.has(160)).toBe(true);
    expect(smaPeriods.has(19)).toBe(false);
    expect(smaPeriods.has(161)).toBe(false);

    const pairs = new Set(result.filter(c => c.smaPeriod === 20).map(c => key(c.longLeverage, c.shortLeverage)));
    expect(pairs.size).toBe(81);
    for (const long of LEVERAGES) {
      for (const short of LEVERAGES) {
        expect(pairs.has(key(long, short))).toBe(true);
      }
    }
  });

  test('should_pass_starting_capital_and_fee_rate_to_every_config', () => {
    const result = generateBacktestConfigs(2500, 0.25, false, 20, 22);

    expect(result.every(c => c.startingCapital === 2500 && c.feeRate === 0.25)).toBe(true);
  });

  test('should_order_deterministically_with_sma_outermost_and_short_leverage_innermost', () => {
    const result = generateBacktestConfigs(1000, 0.1, false, 20, 160);

    expect(result).toEqual(generateBacktestConfigs(1000, 0.1, false, 20, 160));
    expect(result[0]).toMatchObject({ smaPeriod: 20, longLeverage: 1.0, shortLeverage: 1.0 });
    expect(result[1]).toMatchObject({ smaPeriod: 20, longLeverage: 1.0, shortLeverage: 1.25 });
    expect(result[result.length - 1]).toMatchObject({ smaPeriod: 160, longLeverage: 3.0, shortLeverage: 3.0 });
  });

  describe('with atr enabled', () => {
    const result = generateBacktestConfigs(1000, 0.1, true, 20, 21);

    test('should_multiply_config_count_by_60_atr_combinations', () => {
      expect(result.length).toBe(2 * 81 * 60);
      expect(result.every(c => c.atr !== undefined)).toBe(true);
    });

    test('should_include_every_period_multiplier_and_close_percent_combination_once', () => {
      const combos = result
        .filter(c => c.smaPeriod === 20 && c.longLeverage === 1.0 && c.shortLeverage === 1.0)
        .map(c => key(c.atr?.period, c.atr?.multiplier, c.atr?.closePercent));

      const expected = [10, 14, 20].flatMap(period =>
        [2, 2.5, 3, 3.5, 4].flatMap(multiplier =>
          [10, 25, 50, 100].map(closePercent => key(period, multiplier, closePercent))
        )
      );
      expect(combos).toEqual(expected);
    });
  });
});
