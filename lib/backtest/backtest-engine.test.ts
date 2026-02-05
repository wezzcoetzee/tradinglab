import { describe, expect, test } from 'bun:test';
import { runAllBacktests, findBestResult } from './backtest-engine';
import type { BacktestBatchInput, BacktestResult } from './types';
import type { CsvRow, StrategyConfig } from '../types';
import { WARMUP_DAYS } from './constants';

function generateCsvData(days: number, startPrice: number = 100): CsvRow[] {
  return Array.from({ length: days }, (_, i) => ({
    time: i + 1,
    high: startPrice + i + 2,
    low: startPrice + i - 2,
    close: startPrice + i,
    RSI: 50,
    date: `${i + 1}/1/2024`,
  }));
}

describe('runAllBacktests - integration', () => {
  test('should_generate_11421_backtest_results', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.results.length).toBe(11421);
    expect(result.totalConfigurations).toBe(11421);
  });

  test('should_calculate_execution_time', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.executionTimeMs).toBeGreaterThan(0);
    expect(typeof result.executionTimeMs).toBe('number');
  });

  test('should_use_memoized_smas_across_configs', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    const configsWithSma20 = result.results.filter(r => r.config.smaPeriod === 20);
    expect(configsWithSma20.length).toBe(81);
  });

  test('should_include_all_sma_periods_in_results', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    const smaPeriods = new Set(result.results.map(r => r.config.smaPeriod));

    expect(smaPeriods.size).toBe(141);
    expect(smaPeriods.has(20)).toBe(true);
    expect(smaPeriods.has(160)).toBe(true);
  });

  test('should_include_all_leverage_combinations', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    const longLeverages = new Set(result.results.map(r => r.config.longLeverage));
    const shortLeverages = new Set(result.results.map(r => r.config.shortLeverage));

    expect(longLeverages.size).toBe(9);
    expect(shortLeverages.size).toBe(9);
  });

  test('should_pass_correct_config_to_each_backtest', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 5000,
      tradingFee: 0.05,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    const allHaveCorrectConfig = result.results.every(
      r => r.config.startingCapital === 5000 && r.config.feeRate === 0.05
    );

    expect(allHaveCorrectConfig).toBe(true);
  });

  test('should_handle_insufficient_data_gracefully', () => {
    const csvData = generateCsvData(10);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.results.length).toBe(11421);
    expect(result.results.every(r => r.days.length === 0)).toBe(true);
  });
});

describe('runAllBacktests - result properties', () => {
  test('should_include_config_in_each_result', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    result.results.forEach(r => {
      expect(r.config).toBeDefined();
      expect(r.config.smaPeriod).toBeGreaterThanOrEqual(20);
      expect(r.config.smaPeriod).toBeLessThanOrEqual(160);
    });
  });

  test('should_include_final_balance_in_each_result', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    result.results.forEach(r => {
      expect(typeof r.finalBalance).toBe('number');
      expect(r.finalBalance).toBeGreaterThanOrEqual(0);
    });
  });

  test('should_include_total_return_in_each_result', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    result.results.forEach(r => {
      expect(typeof r.totalReturn).toBe('number');
    });
  });

  test('should_track_liquidations', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 22,
        low: 18,
        close: 20,
        RSI: 50,
        date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 102, low: 98, close: 100, RSI: 50, date: '162/1/2024' },
      { time: 163, high: 202, low: 198, close: 200, RSI: 50, date: '163/1/2024' },
    ];
    const strategyConfig: StrategyConfig = {
      startingCapital: 10,
      tradingFee: 50.0, // Higher fee to trigger liquidation (fee = capital * leverage * feeRate / 100)
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    const liquidated = result.results.filter(r => r.isLiquidated);
    expect(liquidated.length).toBeGreaterThan(0);
  });

  test('should_set_liquidation_date_when_liquidated', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 22,
        low: 18,
        close: 20,
        RSI: 50,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      })),
      { time: 162, high: 102, low: 98, close: 100, RSI: 50, date: '2024-06-10' },
      { time: 163, high: 202, low: 198, close: 200, RSI: 50, date: '2024-06-11' },
    ];
    const strategyConfig: StrategyConfig = {
      startingCapital: 10,
      tradingFee: 50.0, // Higher fee to trigger liquidation (fee = capital * leverage * feeRate / 100)
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    const liquidated = result.results.filter(r => r.isLiquidated);
    expect(liquidated.length).toBeGreaterThan(0);
    liquidated.forEach(r => {
      expect(r.liquidationDate).toBeDefined();
      expect(typeof r.liquidationDate).toBe('string');
      expect(r.liquidationDate?.length).toBeGreaterThan(0);
    });
  });

  test('should_not_set_liquidation_date_when_not_liquidated', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 10000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    const nonLiquidated = result.results.filter(r => !r.isLiquidated);
    expect(nonLiquidated.length).toBeGreaterThan(0);
    nonLiquidated.forEach(r => {
      expect(r.liquidationDate).toBeUndefined();
    });
  });

  test('should_include_days_array_in_each_result', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    result.results.forEach(r => {
      expect(Array.isArray(r.days)).toBe(true);
    });
  });
});

describe('findBestResult', () => {
  test('should_return_result_with_highest_total_return', () => {
    const results: BacktestResult[] = [
      {
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1100,
        totalReturn: 10,
        totalFees: 10,
        totalTrades: 5,
        isLiquidated: false,
      },
      {
        config: { smaPeriod: 30, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1500,
        totalReturn: 50,
        totalFees: 20,
        totalTrades: 10,
        isLiquidated: false,
      },
      {
        config: { smaPeriod: 40, longLeverage: 1.5, shortLeverage: 1.5, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1200,
        totalReturn: 20,
        totalFees: 15,
        totalTrades: 7,
        isLiquidated: false,
      },
    ];

    const best = findBestResult(results);

    expect(best).toBeDefined();
    expect(best?.totalReturn).toBe(50);
    expect(best?.config.smaPeriod).toBe(30);
  });

  test('should_exclude_liquidated_results', () => {
    const results: BacktestResult[] = [
      {
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1100,
        totalReturn: 10,
        totalFees: 10,
        totalTrades: 5,
        isLiquidated: false,
      },
      {
        config: { smaPeriod: 30, longLeverage: 3, shortLeverage: 3, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 0,
        totalReturn: -100,
        totalFees: 1000,
        totalTrades: 1,
        isLiquidated: true,
        liquidationDay: 160,
      },
    ];

    const best = findBestResult(results);

    expect(best).toBeDefined();
    expect(best?.isLiquidated).toBe(false);
    expect(best?.totalReturn).toBe(10);
  });

  test('should_return_null_when_all_liquidated', () => {
    const results: BacktestResult[] = [
      {
        config: { smaPeriod: 20, longLeverage: 3, shortLeverage: 3, startingCapital: 100, feeRate: 5 },
        days: [],
        finalBalance: 0,
        totalReturn: -100,
        totalFees: 100,
        totalTrades: 1,
        isLiquidated: true,
        liquidationDay: 160,
      },
      {
        config: { smaPeriod: 30, longLeverage: 3, shortLeverage: 3, startingCapital: 100, feeRate: 5 },
        days: [],
        finalBalance: 0,
        totalReturn: -100,
        totalFees: 100,
        totalTrades: 1,
        isLiquidated: true,
        liquidationDay: 161,
      },
    ];

    const best = findBestResult(results);

    expect(best).toBeNull();
  });

  test('should_return_null_when_results_empty', () => {
    const results: BacktestResult[] = [];

    const best = findBestResult(results);

    expect(best).toBeNull();
  });

  test('should_handle_single_result', () => {
    const results: BacktestResult[] = [
      {
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1100,
        totalReturn: 10,
        totalFees: 10,
        totalTrades: 5,
        isLiquidated: false,
      },
    ];

    const best = findBestResult(results);

    expect(best).toBeDefined();
    expect(best?.totalReturn).toBe(10);
  });

  test('should_handle_negative_returns', () => {
    const results: BacktestResult[] = [
      {
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 900,
        totalReturn: -10,
        totalFees: 100,
        totalTrades: 5,
        isLiquidated: false,
      },
      {
        config: { smaPeriod: 30, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 950,
        totalReturn: -5,
        totalFees: 50,
        totalTrades: 3,
        isLiquidated: false,
      },
    ];

    const best = findBestResult(results);

    expect(best).toBeDefined();
    expect(best?.totalReturn).toBe(-5);
  });

  test('should_handle_zero_return', () => {
    const results: BacktestResult[] = [
      {
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0 },
        days: [],
        finalBalance: 1000,
        totalReturn: 0,
        totalFees: 0,
        totalTrades: 0,
        isLiquidated: false,
      },
      {
        config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 900,
        totalReturn: -10,
        totalFees: 100,
        totalTrades: 5,
        isLiquidated: false,
      },
    ];

    const best = findBestResult(results);

    expect(best).toBeDefined();
    expect(best?.totalReturn).toBe(0);
  });

  test('should_handle_multiple_results_with_same_return', () => {
    const results: BacktestResult[] = [
      {
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1100,
        totalReturn: 10,
        totalFees: 10,
        totalTrades: 5,
        isLiquidated: false,
      },
      {
        config: { smaPeriod: 30, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1100,
        totalReturn: 10,
        totalFees: 20,
        totalTrades: 10,
        isLiquidated: false,
      },
    ];

    const best = findBestResult(results);

    expect(best).toBeDefined();
    expect(best?.totalReturn).toBe(10);
  });
});

describe('runAllBacktests - performance', () => {
  test('should_complete_in_reasonable_time', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const startTime = performance.now();
    const result = runAllBacktests(input);
    const endTime = performance.now();

    const actualTime = endTime - startTime;

    expect(actualTime).toBeGreaterThan(0);
    expect(result.executionTimeMs).toBeCloseTo(actualTime, -1);
  });

  test('should_handle_large_dataset', () => {
    const csvData = generateCsvData(500);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.results.length).toBe(11421);
    expect(result.executionTimeMs).toBeGreaterThan(0);
  });
});

describe('runAllBacktests - buy and hold baseline', () => {
  test('should_include_baseline_in_result', () => {
    // #given
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };
    const input: BacktestBatchInput = { csvData, strategyConfig };

    // #when
    const result = runAllBacktests(input);

    // #then
    expect(result.buyAndHoldBaseline).toBeDefined();
    expect(result.buyAndHoldBaseline!.startingCapital).toBe(1000);
  });

  test('should_use_correct_purchase_date', () => {
    // #given
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };
    const input: BacktestBatchInput = { csvData, strategyConfig };

    // #when
    const result = runAllBacktests(input);

    // #then
    expect(result.buyAndHoldBaseline!.purchaseDate).toBe(csvData[WARMUP_DAYS - 1].date);
    expect(result.buyAndHoldBaseline!.purchasePrice).toBe(csvData[WARMUP_DAYS - 1].close);
  });

  test('should_use_correct_final_date', () => {
    // #given
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };
    const input: BacktestBatchInput = { csvData, strategyConfig };

    // #when
    const result = runAllBacktests(input);

    // #then
    const lastIndex = csvData.length - 1;
    expect(result.buyAndHoldBaseline!.finalDate).toBe(csvData[lastIndex].date);
    expect(result.buyAndHoldBaseline!.finalPrice).toBe(csvData[lastIndex].close);
  });

  test('should_calculate_percent_gain', () => {
    // #given
    const csvData = generateCsvData(200, 100);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };
    const input: BacktestBatchInput = { csvData, strategyConfig };

    // #when
    const result = runAllBacktests(input);

    // #then
    expect(typeof result.buyAndHoldBaseline!.percentGain).toBe('number');
    expect(result.buyAndHoldBaseline!.percentGain).toBeGreaterThan(0);
  });

  test('should_calculate_final_value', () => {
    // #given
    const csvData = generateCsvData(200, 100);
    const startingCapital = 1000;
    const strategyConfig: StrategyConfig = {
      startingCapital,
      tradingFee: 0.1,
      atrEnabled: false,
    };
    const input: BacktestBatchInput = { csvData, strategyConfig };

    // #when
    const result = runAllBacktests(input);

    // #then
    const { purchasePrice, finalPrice } = result.buyAndHoldBaseline!;
    const expectedFinalValue = (startingCapital / purchasePrice) * finalPrice;
    expect(result.buyAndHoldBaseline!.finalValue).toBeCloseTo(expectedFinalValue, 6);
  });
});

describe('runAllBacktests - edge cases', () => {
  test('should_handle_minimal_viable_dataset', () => {
    const csvData = generateCsvData(161);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.results.length).toBe(11421);
  });

  test('should_handle_zero_fee_rate', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.results.length).toBe(11421);
    expect(result.results.every(r => r.totalFees === 0)).toBe(true);
  });

  test('should_handle_high_fee_rate', () => {
    const csvData = generateCsvData(200);
    const strategyConfig: StrategyConfig = {
      startingCapital: 10000,
      tradingFee: 5.0,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.results.length).toBe(11421);
  });

  test('should_extract_close_prices_correctly', () => {
    const csvData = generateCsvData(200, 123.45);
    const strategyConfig: StrategyConfig = {
      startingCapital: 1000,
      tradingFee: 0.1,
      atrEnabled: false,
    };

    const input: BacktestBatchInput = {
      csvData,
      strategyConfig,
    };

    const result = runAllBacktests(input);

    expect(result.results.length).toBe(11421);
  });
});
