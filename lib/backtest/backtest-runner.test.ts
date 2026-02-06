import { describe, expect, test } from 'bun:test';
import { runBacktest } from './backtest-runner';
import type { CsvRow } from '../types';
import type { BacktestConfig } from './types';

function generateCsvData(days: number, startPrice: number = 100): CsvRow[] {
  return Array.from({ length: days }, (_, i) => ({
    time: i + 1,
    high: startPrice + i + 2,
    low: startPrice + i - 2,
    close: startPrice + i,
        date: `${i + 1}/1/2024`,
  }));
}

function generateSmaValues(length: number, value: number = 100): number[] {
  return Array(length).fill(value);
}

describe('runBacktest - warmup period', () => {
  test('should_skip_first_160_days', () => {
    const csvData = generateCsvData(200);
    const smaValues = generateSmaValues(200, 100);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days.length).toBeGreaterThan(0);
    expect(result.days[0].dayIndex).toBe(160);
  });

  test('should_not_generate_days_before_index_160', () => {
    const csvData = generateCsvData(200);
    const smaValues = generateSmaValues(200, 100);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const hasDaysBeforeWarmup = result.days.some(day => day.dayIndex < 160);

    expect(hasDaysBeforeWarmup).toBe(false);
  });

  test('should_handle_exactly_160_days_of_data', () => {
    const csvData = generateCsvData(160);
    const smaValues = generateSmaValues(160, 100);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days.length).toBe(0);
    expect(result.finalBalance).toBe(1000);
  });

  test('should_process_day_160_as_first_day', () => {
    const csvData = generateCsvData(161);
    const smaValues = Array(161).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days.length).toBe(1);
    expect(result.days[0].dayIndex).toBe(160);
  });
});

describe('runBacktest - position logic', () => {
  test('should_open_long_when_price_above_sma', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days[0].action).toBe('OPEN_LONG');
    expect(result.days[0].position?.type).toBe('LONG');
  });

  test('should_open_short_when_price_below_sma', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 22,
      low: 18,
      close: 20,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(200).fill(150);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days[0].action).toBe('OPEN_SHORT');
    expect(result.days[0].position?.type).toBe('SHORT');
  });

  test('should_hold_when_price_equals_sma', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 102,
      low: 98,
      close: 100,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(200).fill(100);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const day160 = result.days.find(d => d.dayIndex === 160);
    expect(day160?.action).toBe('HOLD');
    expect(day160?.position).toBe(null);
  });

  test('should_close_long_when_price_crosses_below_sma', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 52, low: 48, close: 50, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days[0].action).toBe('OPEN_LONG');
    expect(result.days.some(d => d.action === 'TRANSITION_LONG_TO_SHORT')).toBe(true);
  });

  test('should_transition_long_to_short', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 82, low: 78, close: 80, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1.25,
      shortLeverage: 1.5,
      startingCapital: 100000,
      feeRate: 0.01,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days[0].action).toBe('OPEN_LONG');
    expect(result.days[1].action).toBe('TRANSITION_LONG_TO_SHORT');
    expect(result.days[1].position).toBeDefined();
    expect(result.days[1].position?.type).toBe('SHORT');
    expect(result.days[1].position?.leverage).toBe(1.5);
  });

  test('should_transition_short_to_long', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 22,
        low: 18,
        close: 20,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 52, low: 48, close: 50, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(40);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1.5,
      shortLeverage: 1.25,
      startingCapital: 100000,
      feeRate: 0.01,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days[0].action).toBe('OPEN_SHORT');
    expect(result.days[1].action).toBe('TRANSITION_SHORT_TO_LONG');
    expect(result.days[1].position).toBeDefined();
    expect(result.days[1].position?.type).toBe('LONG');
    expect(result.days[1].position?.leverage).toBe(1.5);
  });

  test('should_hold_position_when_price_stays_on_same_side', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days[0].action).toBe('OPEN_LONG');
    expect(result.days[1].action).toBe('HOLD');
    expect(result.days[2].action).toBe('HOLD');
  });
});

describe('runBacktest - liquidation', () => {
  test('should_detect_liquidation_when_balance_drops_to_zero', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 52,
        low: 48,
        close: 50,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 102, low: 98, close: 100, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(60);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 3,
      shortLeverage: 3,
      startingCapital: 100,
      feeRate: 5.0,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.isLiquidated).toBe(true);
    expect(result.liquidationDay).toBeDefined();
    expect(result.finalBalance).toBe(0);
  });

  test('should_stop_processing_after_liquidation', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 52,
        low: 48,
        close: 50,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 102, low: 98, close: 100, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(60);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 3,
      shortLeverage: 3,
      startingCapital: 100,
      feeRate: 5.0,
    };

    const result = runBacktest(csvData, smaValues, config);

    const liquidationDay = result.days.find(d => d.isLiquidated);
    expect(liquidationDay).toBeDefined();

    const daysAfterLiquidation = result.days.filter(
      d => d.dayIndex > liquidationDay!.dayIndex
    );
    expect(daysAfterLiquidation.length).toBe(0);
  });

  test('should_mark_liquidation_day_correctly', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 52,
        low: 48,
        close: 50,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 102, low: 98, close: 100, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(60);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 3,
      shortLeverage: 3,
      startingCapital: 100,
      feeRate: 5.0,
    };

    const result = runBacktest(csvData, smaValues, config);

    const liquidationDay = result.days.find(d => d.isLiquidated);
    expect(liquidationDay?.balance).toBe(0);
    expect(liquidationDay?.position).toBe(null);
  });

  test('should_not_liquidate_with_sufficient_balance', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 10000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.isLiquidated).toBe(false);
    expect(result.liquidationDay).toBeUndefined();
  });
});

describe('runBacktest - fee deduction', () => {
  test('should_deduct_fees_on_position_open', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const firstDay = result.days[0];
    expect(firstDay.fees).toBeGreaterThan(0);
    expect(firstDay.balance).toBe(1000 - firstDay.fees);
  });

  test('should_deduct_double_fees_on_transition', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 82, low: 78, close: 80, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1.5,
      shortLeverage: 2,
      startingCapital: 10000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const transitionDay = result.days.find(d => d.action === 'TRANSITION_LONG_TO_SHORT');
    const openDay = result.days.find(d => d.action === 'OPEN_LONG');

    expect(transitionDay?.fees).toBeGreaterThan(openDay!.fees);
  });

  test('should_not_deduct_fees_on_hold', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const holdDays = result.days.filter(d => d.action === 'HOLD');
    expect(holdDays.length).toBeGreaterThan(0);
    expect(holdDays.every(d => d.fees === 0)).toBe(true);
  });

  test('should_track_total_fees', () => {
    const csvData: CsvRow[] = [
      ...Array(161).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 162, high: 22, low: 18, close: 20, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const sumOfDayFees = result.days.reduce((sum, day) => sum + day.fees, 0);
    expect(result.totalFees).toBeCloseTo(sumOfDayFees, 2);
  });
});

describe('runBacktest - profit calculation', () => {
  test('should_calculate_long_profit_correctly', () => {
    const csvData: CsvRow[] = [
      ...Array(160).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 161, high: 102, low: 98, close: 100, RSI: 50, date: '161/1/2024' },
      { time: 162, high: 112, low: 108, close: 110, RSI: 50, date: '162/1/2024' },
      { time: 163, high: 112, low: 108, close: 110, RSI: 50, date: '163/1/2024' },
    ];
    const smaValues = Array(163).fill(90);
    smaValues[161] = 90;
    smaValues[162] = 110;

    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const closeLongDay = result.days.find(d => d.action === 'CLOSE_LONG');
    expect(closeLongDay).toBeDefined();
    expect(closeLongDay!.pnl).toBeGreaterThan(0);
  });

  test('should_calculate_short_profit_correctly', () => {
    const csvData: CsvRow[] = [
      ...Array(160).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 161, high: 102, low: 98, close: 100, RSI: 50, date: '161/1/2024' },
      { time: 162, high: 92, low: 88, close: 90, RSI: 50, date: '162/1/2024' },
      { time: 163, high: 92, low: 88, close: 90, RSI: 50, date: '163/1/2024' },
    ];
    const smaValues = Array(163).fill(110);
    smaValues[161] = 110;
    smaValues[162] = 90;

    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const closeShortDay = result.days.find(d => d.action === 'CLOSE_SHORT');
    expect(closeShortDay).toBeDefined();
    expect(closeShortDay!.pnl).toBeGreaterThan(0);
  });

  test('should_calculate_loss_for_long_position', () => {
    const csvData: CsvRow[] = [
      ...Array(160).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 161, high: 102, low: 98, close: 100, RSI: 50, date: '161/1/2024' },
      { time: 162, high: 92, low: 88, close: 90, RSI: 50, date: '162/1/2024' },
    ];
    const smaValues = Array(162).fill(90);
    smaValues[161] = 95;

    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const transitionDay = result.days.find(d => d.action === 'TRANSITION_LONG_TO_SHORT');
    expect(transitionDay).toBeDefined();
    expect(transitionDay!.pnl).toBeLessThan(0);
  });

  test('should_add_profit_to_balance', () => {
    const csvData: CsvRow[] = [
      ...Array(160).fill(null).map((_, i) => ({
        time: i + 1,
        high: 102,
        low: 98,
        close: 100,
                date: `${i + 1}/1/2024`,
      })),
      { time: 161, high: 102, low: 98, close: 100, RSI: 50, date: '161/1/2024' },
      { time: 162, high: 122, low: 118, close: 120, RSI: 50, date: '162/1/2024' },
      { time: 163, high: 122, low: 118, close: 120, RSI: 50, date: '163/1/2024' },
    ];
    const smaValues = Array(163).fill(90);
    smaValues[161] = 90;
    smaValues[162] = 120;

    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.01,
    };

    const result = runBacktest(csvData, smaValues, config);

    const closeLongDay = result.days.find(d => d.action === 'CLOSE_LONG');
    expect(closeLongDay).toBeDefined();
    expect(closeLongDay!.balance).toBeGreaterThan(1000);
  });
});

describe('runBacktest - final position closure', () => {
  test('should_close_long_position_at_end', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.finalBalance).toBeGreaterThan(0);
  });

  test('should_close_short_position_at_end', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(110);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.finalBalance).toBeGreaterThan(0);
  });

  test('should_calculate_total_return_percentage', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.01,
    };

    const result = runBacktest(csvData, smaValues, config);

    const expectedReturn = ((result.finalBalance - 1000) / 1000) * 100;
    expect(result.totalReturn).toBeCloseTo(expectedReturn, 2);
  });

  test('should_track_total_trades', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(90);
    smaValues[161] = 110;
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const nonHoldDays = result.days.filter(d => d.action !== 'HOLD');
    expect(result.totalTrades).toBe(nonHoldDays.length);
  });
});

describe('runBacktest - edge cases', () => {
  test('should_skip_days_with_nan_sma', () => {
    const csvData = generateCsvData(200);
    const smaValues = Array(200).fill(NaN);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days.length).toBe(0);
    expect(result.finalBalance).toBe(1000);
  });

  test('should_handle_frequent_transitions', () => {
    const csvData: CsvRow[] = Array.from({ length: 170 }, (_, i) => ({
      time: i + 1,
      high: 102,
      low: 98,
      close: i % 2 === 0 ? 100 : 50,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(170).fill(75);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 10000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    const transitions = result.days.filter(
      d => d.action === 'TRANSITION_LONG_TO_SHORT' || d.action === 'TRANSITION_SHORT_TO_LONG'
    );
    expect(transitions.length).toBeGreaterThan(0);
    expect(result.totalFees).toBeGreaterThan(0);
  });

  test('should_handle_all_prices_above_sma', () => {
    const csvData = generateCsvData(200, 100);
    const smaValues = Array(200).fill(50);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days.every(d => d.action === 'HOLD' || d.action === 'OPEN_LONG')).toBe(true);
  });

  test('should_handle_all_prices_below_sma', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 52,
      low: 48,
      close: 50,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(200).fill(200);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config);

    expect(result.days.every(d => d.action === 'HOLD' || d.action === 'OPEN_SHORT')).toBe(true);
  });
});

describe('runBacktest - atr trailing stop', () => {
  function generateCsvDataWithVolatility(days: number, startPrice: number = 100): CsvRow[] {
    return Array.from({ length: days }, (_, i) => ({
      time: i + 1,
      high: startPrice + i * 0.5 + 5,
      low: startPrice + i * 0.5 - 5,
      close: startPrice + i * 0.5,
            date: `${i + 1}/1/2024`,
    }));
  }

  test('should_initialize_trailing_stop_on_position_open', () => {
    const csvData = generateCsvDataWithVolatility(200);
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const firstDay = result.days.find(d => d.action === 'OPEN_LONG');
    expect(firstDay?.position?.trailingStop).toBeDefined();
    expect(firstDay?.position?.trailingStop?.triggered).toBe(false);
  });

  test('should_trigger_partial_close_for_long_position', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    expect(partialCloseDay).toBeDefined();
    expect(partialCloseDay?.position?.trailingStop?.triggered).toBe(true);
  });

  test('should_trigger_partial_close_for_short_position', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 95,
          low: 85,
          close: 90,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 115,
        low: 105,
        close: 110,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(100);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    expect(partialCloseDay).toBeDefined();
  });

  test('should_reduce_position_size_after_partial_close', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    const openDay = result.days.find(d => d.action === 'OPEN_LONG');

    if (partialCloseDay && openDay) {
      const originalValue = openDay.position!.entryValue;
      const newValue = partialCloseDay.position!.entryValue;

      expect(newValue).toBeLessThan(originalValue);
      expect(newValue).toBe(originalValue * 0.5);
    }
  });

  test('should_accumulate_sideline_value', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    expect(partialCloseDay?.sidelineValue).toBeGreaterThan(0);
  });

  test('should_not_trigger_again_after_first_trigger', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDays = result.days.filter(d => d.action === 'ATR_PARTIAL_CLOSE');
    expect(partialCloseDays.length).toBe(1);
  });

  test('should_update_extreme_price_when_price_moves_favorably', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 100 + i * 0.5,
      low: 90 + i * 0.5,
      close: 95 + i * 0.5,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const openDay = result.days.find(d => d.action === 'OPEN_LONG');
    const laterDay = result.days[result.days.length - 1];

    if (openDay?.position && laterDay?.position) {
      const initialExtreme = openDay.position.trailingStop?.extremePrice;
      const laterExtreme = laterDay.position.trailingStop?.extremePrice;

      if (initialExtreme && laterExtreme) {
        expect(laterExtreme).toBeGreaterThan(initialExtreme);
      }
    }
  });

  test('should_combine_sideline_with_balance_on_new_position', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      if (i < 170) {
        return {
          time: i + 1,
          high: 85,
          low: 75,
          close: 80,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 75,
        low: 65,
        close: 70,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    smaValues[170] = 80;
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    const transitionDay = result.days.find(d => d.action === 'TRANSITION_LONG_TO_SHORT');

    if (partialCloseDay && transitionDay) {
      expect(partialCloseDay.sidelineValue).toBeGreaterThan(0);
    }
  });

  test('should_increment_trade_count_on_partial_close', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    expect(result.totalTrades).toBeGreaterThan(0);
  });

  test('should_not_trigger_when_atr_is_nan', () => {
    const csvData: CsvRow[] = Array.from({ length: 165 }, (_, i) => ({
      time: i + 1,
      high: 105,
      low: 95,
      close: 100,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(165).fill(90);
    const atrValues = Array(165).fill(NaN);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDays = result.days.filter(d => d.action === 'ATR_PARTIAL_CLOSE');
    expect(partialCloseDays.length).toBe(0);
  });

  test('should_handle_10_percent_close', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 10,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    const openDay = result.days.find(d => d.action === 'OPEN_LONG');

    if (partialCloseDay && openDay) {
      const originalValue = openDay.position!.entryValue;
      const newValue = partialCloseDay.position!.entryValue;

      expect(newValue).toBe(originalValue * 0.9);
    }
  });

  test('should_handle_25_percent_close', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 25,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    const openDay = result.days.find(d => d.action === 'OPEN_LONG');

    if (partialCloseDay && openDay) {
      const originalValue = openDay.position!.entryValue;
      const newValue = partialCloseDay.position!.entryValue;

      expect(newValue).toBe(originalValue * 0.75);
    }
  });

  test('should_handle_100_percent_close', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 100,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');

    if (partialCloseDay) {
      expect(partialCloseDay.position!.entryValue).toBe(0);
    }
  });

  test('should_work_without_atr_config', () => {
    const csvData = generateCsvDataWithVolatility(200);
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
    };

    const result = runBacktest(csvData, smaValues, config, null);

    const partialCloseDays = result.days.filter(d => d.action === 'ATR_PARTIAL_CLOSE');
    expect(partialCloseDays.length).toBe(0);
  });

  test('should_not_trigger_without_atr_values', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, null);

    const partialCloseDays = result.days.filter(d => d.action === 'ATR_PARTIAL_CLOSE');
    expect(partialCloseDays.length).toBe(0);
  });

  test('should_record_pnl_and_fees_on_partial_close', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');

    expect(partialCloseDay?.pnl).toBeDefined();
    expect(partialCloseDay?.fees).toBeDefined();
    expect(partialCloseDay?.fees).toBeGreaterThan(0);
  });

  test('should_include_sideline_in_final_balance', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 85,
        low: 75,
        close: 80,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    const result = runBacktest(csvData, smaValues, config, atrValues);

    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    if (partialCloseDay) {
      expect(result.finalBalance).toBeGreaterThan(partialCloseDay.balance);
    }
  });

  test('should_use_different_multipliers', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 105,
      low: 95,
      close: 100,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(200).fill(90);
    const atrValues = Array(200).fill(5);

    const multipliers = [2, 2.5, 3, 3.5, 4] as const;

    for (const multiplier of multipliers) {
      const config: BacktestConfig = {
        smaPeriod: 20,
        longLeverage: 2,
        shortLeverage: 2,
        startingCapital: 1000,
        feeRate: 0.1,
        atr: {
          period: 14,
          multiplier,
          closePercent: 50,
        },
      };

      const result = runBacktest(csvData, smaValues, config, atrValues);

      expect(result).toBeDefined();
      expect(result.config.atr?.multiplier).toBe(multiplier);
    }
  });

  test('should_use_different_atr_periods', () => {
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => ({
      time: i + 1,
      high: 105,
      low: 95,
      close: 100,
            date: `${i + 1}/1/2024`,
    }));
    const smaValues = Array(200).fill(90);

    const periods = [10, 14, 20] as const;

    for (const period of periods) {
      const atrValues = Array(200).fill(5);
      const config: BacktestConfig = {
        smaPeriod: 20,
        longLeverage: 2,
        shortLeverage: 2,
        startingCapital: 1000,
        feeRate: 0.1,
        atr: {
          period,
          multiplier: 2,
          closePercent: 50,
        },
      };

      const result = runBacktest(csvData, smaValues, config, atrValues);

      expect(result).toBeDefined();
      expect(result.config.atr?.period).toBe(period);
    }
  });

  test('should_reduce_balance_after_partial_close_to_prevent_double_counting', () => {
    // #given - setup scenario where ATR triggers then position transitions
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 105,
          low: 95,
          close: 100,
                    date: `${i + 1}/1/2024`,
        };
      }
      if (i < 175) {
        // Price drops to trigger ATR stop
        return {
          time: i + 1,
          high: 85,
          low: 75,
          close: 80,
                    date: `${i + 1}/1/2024`,
        };
      }
      // Price drops further to trigger transition to SHORT
      return {
        time: i + 1,
        high: 65,
        low: 55,
        close: 60,
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    smaValues.fill(70, 175); // SMA drops to trigger LONG->SHORT transition
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0.1,
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    // #when
    const result = runBacktest(csvData, smaValues, config, atrValues);

    // #then - final balance should not exceed starting capital significantly
    // (given the losses from the ATR stop and transition)
    // Before the fix, double-counting would cause balance to inflate unrealistically
    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');
    const transitionDay = result.days.find(d => d.action === 'TRANSITION_LONG_TO_SHORT');

    expect(partialCloseDay).toBeDefined();
    expect(transitionDay).toBeDefined();

    // After partial close, balance should be reduced by closedCapital
    // Balance should reflect only the remaining capital backing the position
    if (partialCloseDay && transitionDay) {
      // The sideline value plus remaining balance after transition should not
      // significantly exceed starting capital (accounting for losses)
      // This verifies no double-counting occurred
      expect(result.finalBalance).toBeLessThan(config.startingCapital * 1.5);
    }
  });

  test('should_have_continuous_portfolioValue_across_atr_partial_close_and_transition', () => {
    // #given - price drops trigger ATR partial close, then transitions to SHORT
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return { time: i + 1, high: 102, low: 98, close: 100, date: `${i + 1}/1/2024` };
      }
      if (i < 175) {
        return { time: i + 1, high: 92, low: 88, close: 90, date: `${i + 1}/1/2024` };
      }
      return { time: i + 1, high: 82, low: 78, close: 80, date: `${i + 1}/1/2024` };
    });
    const smaValues = Array(200).fill(90);
    smaValues.fill(85, 175);
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0,
      atr: { period: 14, multiplier: 2, closePercent: 50 },
    };

    // #when
    const result = runBacktest(csvData, smaValues, config, atrValues);

    // #then - portfolioValue should not jump between consecutive same-price days
    for (let i = 1; i < result.days.length; i++) {
      const prev = result.days[i - 1];
      const curr = result.days[i];
      if (prev.price === curr.price) {
        const jump = Math.abs(curr.portfolioValue - prev.portfolioValue);
        const tolerance = curr.fees + prev.fees + 0.01;
        expect(jump).toBeLessThanOrEqual(tolerance);
      }
    }
  });

  test('should_correctly_track_capital_through_atr_close_and_transition_cycle', () => {
    // #given - controlled scenario to verify exact capital tracking
    const csvData: CsvRow[] = Array.from({ length: 200 }, (_, i) => {
      if (i < 165) {
        return {
          time: i + 1,
          high: 102,
          low: 98,
          close: 100, // Entry price
                    date: `${i + 1}/1/2024`,
        };
      }
      if (i < 175) {
        return {
          time: i + 1,
          high: 92,
          low: 88,
          close: 90, // -10% from entry, triggers ATR
                    date: `${i + 1}/1/2024`,
        };
      }
      return {
        time: i + 1,
        high: 82,
        low: 78,
        close: 80, // -20% from entry
                date: `${i + 1}/1/2024`,
      };
    });
    const smaValues = Array(200).fill(90);
    smaValues.fill(85, 175); // Trigger transition
    const atrValues = Array(200).fill(5);
    const config: BacktestConfig = {
      smaPeriod: 20,
      longLeverage: 2,
      shortLeverage: 2,
      startingCapital: 1000,
      feeRate: 0, // Zero fees for easier calculation
      atr: {
        period: 14,
        multiplier: 2,
        closePercent: 50,
      },
    };

    // #when
    const result = runBacktest(csvData, smaValues, config, atrValues);

    // #then
    const openDay = result.days.find(d => d.action === 'OPEN_LONG');
    const partialCloseDay = result.days.find(d => d.action === 'ATR_PARTIAL_CLOSE');

    expect(openDay).toBeDefined();
    expect(partialCloseDay).toBeDefined();

    if (openDay && partialCloseDay) {
      // After ATR partial close with 50% close:
      // - Original balance: 1000, entryValue: 2000 (2x leverage)
      // - closedCapital: 500 (half of 1000)
      // - At 90 (from 100 entry), loss on closed portion: (90/100 - 1) * 1000 = -100
      // - sidelineValue: 500 + (-100) = 400
      // - Remaining balance: 1000 - 500 = 500
      // This verifies balance was properly reduced
      expect(partialCloseDay.balance).toBeLessThan(openDay.balance);
    }
  });
});
