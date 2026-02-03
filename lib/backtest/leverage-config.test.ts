import { describe, expect, test } from 'bun:test';
import { generateBacktestConfigs } from './leverage-config';

describe('generateBacktestConfigs', () => {
  test('should_generate_exactly_11421_configurations', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    // 141 SMA periods (20-160) × 9 long leverages × 9 short leverages = 11,421
    expect(result.length).toBe(11421);
  });

  test('should_include_all_sma_periods_from_20_to_160', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const smaPeriods = new Set(result.map(c => c.smaPeriod));

    expect(smaPeriods.size).toBe(141);
    expect(smaPeriods.has(20)).toBe(true);
    expect(smaPeriods.has(160)).toBe(true);
    expect(smaPeriods.has(19)).toBe(false);
    expect(smaPeriods.has(161)).toBe(false);

    for (let period = 20; period <= 160; period++) {
      expect(smaPeriods.has(period)).toBe(true);
    }
  });

  test('should_include_all_9_leverage_values', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const longLeverages = new Set(result.map(c => c.longLeverage));
    const shortLeverages = new Set(result.map(c => c.shortLeverage));

    const expectedLeverages = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];

    expect(longLeverages.size).toBe(9);
    expect(shortLeverages.size).toBe(9);

    for (const leverage of expectedLeverages) {
      expect(longLeverages.has(leverage)).toBe(true);
      expect(shortLeverages.has(leverage)).toBe(true);
    }
  });

  test('should_generate_81_configs_per_sma_period', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const configsPerPeriod = result.filter(c => c.smaPeriod === 20);

    expect(configsPerPeriod.length).toBe(81); // 9 × 9 leverage combinations
  });

  test('should_include_all_leverage_combinations', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const period20Configs = result.filter(c => c.smaPeriod === 20);
    const combinations = new Set(
      period20Configs.map(c => `${c.longLeverage}-${c.shortLeverage}`)
    );

    expect(combinations.size).toBe(81);
    expect(combinations.has('1-1')).toBe(true);
    expect(combinations.has('3-3')).toBe(true);
    expect(combinations.has('1-3')).toBe(true);
    expect(combinations.has('3-1')).toBe(true);
    expect(combinations.has('2-2.5')).toBe(true);
  });

  test('should_set_starting_capital_on_all_configs', () => {
    const startingCapital = 5000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const allHaveCorrectCapital = result.every(c => c.startingCapital === 5000);

    expect(allHaveCorrectCapital).toBe(true);
  });

  test('should_set_fee_rate_on_all_configs', () => {
    const startingCapital = 1000;
    const feeRate = 0.05;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const allHaveCorrectFeeRate = result.every(c => c.feeRate === 0.05);

    expect(allHaveCorrectFeeRate).toBe(true);
  });

  test('should_generate_configs_with_correct_structure', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const firstConfig = result[0];

    expect(firstConfig).toHaveProperty('smaPeriod');
    expect(firstConfig).toHaveProperty('longLeverage');
    expect(firstConfig).toHaveProperty('shortLeverage');
    expect(firstConfig).toHaveProperty('startingCapital');
    expect(firstConfig).toHaveProperty('feeRate');

    expect(typeof firstConfig.smaPeriod).toBe('number');
    expect(typeof firstConfig.longLeverage).toBe('number');
    expect(typeof firstConfig.shortLeverage).toBe('number');
    expect(typeof firstConfig.startingCapital).toBe('number');
    expect(typeof firstConfig.feeRate).toBe('number');
  });

  test('should_handle_zero_fee_rate', () => {
    const startingCapital = 1000;
    const feeRate = 0;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    expect(result.length).toBe(11421);
    expect(result[0].feeRate).toBe(0);
  });

  test('should_handle_high_fee_rate', () => {
    const startingCapital = 1000;
    const feeRate = 1.0;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    expect(result.length).toBe(11421);
    expect(result[0].feeRate).toBe(1.0);
  });

  test('should_handle_low_starting_capital', () => {
    const startingCapital = 100;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    expect(result.length).toBe(11421);
    expect(result[0].startingCapital).toBe(100);
  });

  test('should_handle_high_starting_capital', () => {
    const startingCapital = 1000000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    expect(result.length).toBe(11421);
    expect(result[0].startingCapital).toBe(1000000);
  });

  test('should_generate_unique_configurations', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const configStrings = result.map(
      c => `${c.smaPeriod}-${c.longLeverage}-${c.shortLeverage}`
    );
    const uniqueConfigs = new Set(configStrings);

    expect(uniqueConfigs.size).toBe(11421);
  });

  test('should_include_min_and_max_sma_with_all_leverages', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const sma20Configs = result.filter(c => c.smaPeriod === 20);
    const sma160Configs = result.filter(c => c.smaPeriod === 160);

    expect(sma20Configs.length).toBe(81);
    expect(sma160Configs.length).toBe(81);
  });

  test('should_maintain_consistent_ordering', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result1 = generateBacktestConfigs(startingCapital, feeRate);
    const result2 = generateBacktestConfigs(startingCapital, feeRate);

    for (let i = 0; i < result1.length; i++) {
      expect(result1[i]).toEqual(result2[i]);
    }
  });

  test('should_have_first_config_as_min_values', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const firstConfig = result[0];

    expect(firstConfig.smaPeriod).toBe(20);
    expect(firstConfig.longLeverage).toBe(1.0);
    expect(firstConfig.shortLeverage).toBe(1.0);
  });

  test('should_have_last_config_as_max_values', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const lastConfig = result[result.length - 1];

    expect(lastConfig.smaPeriod).toBe(160);
    expect(lastConfig.longLeverage).toBe(3.0);
    expect(lastConfig.shortLeverage).toBe(3.0);
  });

  test('should_verify_exact_count_formula', () => {
    const startingCapital = 1000;
    const feeRate = 0.1;

    const result = generateBacktestConfigs(startingCapital, feeRate);

    const smaPeriods = 160 - 20 + 1; // 141
    const leverageValues = 9;
    const expectedTotal = smaPeriods * leverageValues * leverageValues;

    expect(result.length).toBe(expectedTotal);
    expect(expectedTotal).toBe(11421);
  });
});
