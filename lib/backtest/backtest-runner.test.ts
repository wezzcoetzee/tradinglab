import { describe, expect, test } from 'bun:test';
import { runBacktest } from './backtest-runner';
import { WARMUP_DAYS } from './constants';
import type { CsvRow } from '../types';
import type { BacktestConfig } from './types';

const bar = (close: number, high = close, low = close): CsvRow => ({ high, low, close, date: '1/1/2025' });
const warmup = (close = 100): CsvRow[] => Array.from({ length: WARMUP_DAYS }, () => bar(close));

/** Warmup rows plus the given trading bars; `sma` is a constant or one value per trading bar. */
function run(
  bars: CsvRow[],
  sma: number | number[],
  overrides: Partial<BacktestConfig> = {},
  atr: number | null = null,
  summaryOnly = false
) {
  const csvData = [...warmup(), ...bars];
  const tradingSma = typeof sma === 'number' ? bars.map(() => sma) : sma;
  const smaValues = [...Array(WARMUP_DAYS).fill(NaN), ...tradingSma];
  const atrValues = atr === null ? null : csvData.map(() => atr);
  const config: BacktestConfig = { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0, ...overrides };
  return runBacktest(csvData, smaValues, config, atrValues, summaryOnly);
}

const ATR = { period: 10, multiplier: 2, closePercent: 50 } as const;

describe('runBacktest - warmup', () => {
  test('should_start_trading_on_the_first_row_after_warmup', () => {
    const result = run([bar(100), bar(100)], 50);
    expect(result.days.map((d) => d.dayIndex)).toEqual([WARMUP_DAYS, WARMUP_DAYS + 1]);
  });

  test('should_do_nothing_with_only_warmup_rows', () => {
    const result = run([], 50);
    expect(result.days).toEqual([]);
    expect(result.totalTrades).toBe(0);
    expect(result.finalBalance).toBe(1000);
  });

  test('should_skip_days_without_a_valid_sma', () => {
    const result = run([bar(100), bar(100), bar(100)], [NaN, NaN, 50]);
    expect(result.days.map((d) => d.dayIndex)).toEqual([WARMUP_DAYS + 2]);
  });

  test('should_return_the_same_summary_without_day_details', () => {
    const bars = [bar(100), bar(120), bar(90), bar(130)];
    const full = run(bars, [50, 50, 200, 50], { longLeverage: 2, feeRate: 0.1 });
    const summary = run(bars, [50, 50, 200, 50], { longLeverage: 2, feeRate: 0.1 }, null, true);
    expect(summary).toEqual({ ...full, days: [] });
  });
});

describe('runBacktest - signals', () => {
  test.each([
    ['above', 50, 'OPEN_LONG', 'LONG', 2],
    ['below', 150, 'OPEN_SHORT', 'SHORT', 3],
  ] as const)('should_open_on_price_%s_sma', (_, sma, action, type, leverage) => {
    const [day] = run([bar(100)], sma, { longLeverage: 2, shortLeverage: 3 }).days;
    expect(day.action).toBe(action);
    expect(day.position).toMatchObject({ type, leverage, entryPrice: 100, entryValue: 1000 * leverage });
  });

  test('should_stay_flat_when_price_equals_sma', () => {
    const [day] = run([bar(100)], 100).days;
    expect(day.action).toBe('HOLD');
    expect(day.position).toBeNull();
  });

  test.each([
    ['long_to_short', [50, 200], 'TRANSITION_LONG_TO_SHORT', 'SHORT', 3],
    ['short_to_long', [200, 50], 'TRANSITION_SHORT_TO_LONG', 'LONG', 2],
  ] as const)('should_flip_%s_when_price_crosses_sma', (_, sma, action, type, leverage) => {
    const result = run([bar(100), bar(100), bar(100)], [...sma, sma[1]], { longLeverage: 2, shortLeverage: 3 });
    expect(result.days.map((d) => d.action)).toEqual([result.days[0].action, action, 'HOLD']);
    expect(result.days[1].position).toMatchObject({ type, leverage });
  });

  test('should_close_and_realise_pnl_when_price_meets_sma', () => {
    const result = run([bar(100), bar(110)], [50, 110]);
    expect(result.days[1]).toMatchObject({ action: 'CLOSE_LONG', position: null });
    expect(result.days[1].pnl).toBeCloseTo(100, 10);
    expect(result.days[1].balance).toBeCloseTo(1100, 10);
  });
});

describe('runBacktest - fees', () => {
  test('should_charge_open_fee_then_both_legs_of_a_flip_and_nothing_on_hold', () => {
    // 2x long opened at 100 with a 1% fee, held a day, then flipped to a 1x short at 110.
    const result = run([bar(100), bar(100), bar(110)], [50, 50, 200], { longLeverage: 2, feeRate: 1 });
    const [open, hold, flip] = result.days;

    expect(open.fees).toBe(20); // 1000 × 2 × 1%
    expect(hold.fees).toBe(0);
    const balanceAfterClose = 980 + 0.1 * 1960;
    const closeFee = balanceAfterClose * 2 * 0.01;
    const openFee = balanceAfterClose * 1 * 0.01;
    expect(flip.fees).toBeCloseTo(closeFee + openFee, 10);
    expect(flip.position?.entryValue).toBeCloseTo(balanceAfterClose - closeFee - openFee, 10);
    expect(result.totalFees).toBeCloseTo(20 + closeFee + openFee, 10);
    expect(result.totalTrades).toBe(2);
  });
});

describe('runBacktest - pnl and final balance', () => {
  test.each([
    ['long_gain', 50, 2, 110, 1200],
    ['long_loss', 50, 2, 90, 800],
    ['short_gain_is_linear', 200, 1, 50, 1500],
    ['short_loss', 200, 2, 110, 800],
  ] as const)('should_mark_open_position_to_last_close_%s', (_, sma, leverage, lastClose, expected) => {
    const result = run([bar(100), bar(lastClose)], sma, { longLeverage: leverage, shortLeverage: leverage });
    expect(result.finalBalance).toBeCloseTo(expected, 10);
    expect(result.totalReturn).toBeCloseTo((expected - 1000) / 10, 10);
    expect(result.days.at(-1)?.portfolioValue).toBeCloseTo(expected, 10);
  });
});

describe('runBacktest - liquidation', () => {
  test.each([
    ['long_on_the_low', 50, bar(100, 100, 60)],
    ['short_on_the_high', 200, bar(100, 150, 100)],
  ] as const)('should_liquidate_%s_even_when_the_close_recovers', (_, sma, wick) => {
    const result = run([bar(100), wick, bar(100), bar(100)], sma, { longLeverage: 3, shortLeverage: 2 });

    expect(result).toMatchObject({ isLiquidated: true, liquidationDay: WARMUP_DAYS + 1, finalBalance: 0, totalReturn: -100 });
    expect(result.days.at(-1)).toMatchObject({ dayIndex: WARMUP_DAYS + 1, isLiquidated: true, balance: 0, position: null, portfolioValue: 0 });
  });

  test('should_liquidate_when_fees_exhaust_the_balance', () => {
    const result = run([bar(100), bar(100)], 50, { longLeverage: 3, feeRate: 50 });
    expect(result.isLiquidated).toBe(true);
    expect(result.liquidationDay).toBe(WARMUP_DAYS);
  });

  test('should_survive_a_drawdown_that_leaves_equity', () => {
    const result = run([bar(100), bar(100, 100, 70), bar(100)], 50, { longLeverage: 3 });
    expect(result.isLiquidated).toBe(false);
    expect(result.finalBalance).toBe(1000);
  });
});

describe('runBacktest - atr trailing stop', () => {
  test.each([
    ['LONG', 50, 'high', 104],
    ['SHORT', 200, 'low', 96],
  ] as const)('should_seed_the_%s_stop_from_the_entry_bar_%s', (_, sma, __, extreme) => {
    const [day] = run([bar(100, 104, 96)], sma, { atr: ATR }, 5).days;
    expect(day.position?.trailingStop).toEqual({ extremePrice: extreme, triggered: false });
  });

  // 2x long from 100, runs to 150, stop at 150 - 2 × 5 = 140 fires on the 130 close.
  test.each([10, 25, 50, 100] as const)('should_close_%i_percent_and_sideline_the_proceeds', (closePercent) => {
    const p = closePercent / 100;
    const result = run([bar(100), bar(150), bar(130)], 50, { longLeverage: 2, atr: { ...ATR, closePercent } }, 5);
    const trigger = result.days[2];

    expect(trigger.action).toBe('ATR_PARTIAL_CLOSE');
    expect(trigger.pnl).toBeCloseTo(600 * p, 10);
    expect(trigger.sidelineValue).toBeCloseTo(1600 * p, 10);
    expect(trigger.balance).toBeCloseTo(1000 - 1000 * p, 10);
    expect(trigger.position?.entryValue).toBeCloseTo(2000 * (1 - p), 10);
    // Closing part of the position moves value into cash without changing equity.
    expect(trigger.portfolioValue).toBeCloseTo(1600, 10);
    expect(result.finalBalance).toBeCloseTo(1600, 10);
    expect(result.atrTriggerCount).toBe(1);
    expect(result.totalTrades).toBe(2);
  });

  test('should_trigger_for_shorts_when_price_rises_off_the_low', () => {
    const result = run([bar(100), bar(50), bar(70)], 200, { atr: ATR }, 5);
    expect(result.days[2].action).toBe('ATR_PARTIAL_CLOSE');
    expect(result.days[2].pnl).toBeCloseTo(150, 10);
    expect(result.days[2].sidelineValue).toBeCloseTo(650, 10);
    expect(result.finalBalance).toBeCloseTo(1300, 10);
  });

  test('should_trigger_only_once_per_position', () => {
    const result = run([bar(100), bar(150), bar(130), bar(160), bar(120)], 50, { atr: ATR }, 5);
    expect(result.atrTriggerCount).toBe(1);
  });

  test.each([
    ['atr_is_nan', NaN],
    ['no_atr_values', null],
  ] as const)('should_not_trigger_when_%s', (_, atr) => {
    const result = run([bar(100), bar(150), bar(100)], 50, { atr: ATR }, atr);
    expect(result.atrTriggerCount).toBe(0);
  });

  test('should_redeploy_sidelined_cash_into_the_next_position', () => {
    const result = run([bar(100), bar(150), bar(130), bar(130)], [50, 50, 50, 200], { atr: ATR }, 5);
    const flip = result.days[3];

    expect(flip.action).toBe('TRANSITION_LONG_TO_SHORT');
    expect(flip.sidelineValue).toBe(0);
    expect(flip.position?.entryValue).toBeCloseTo(1300, 10);
    expect(flip.portfolioValue).toBeCloseTo(1300, 10);
  });

  test('should_defer_an_sma_flip_on_the_day_the_stop_fires', () => {
    const result = run([bar(100), bar(150), bar(130), bar(130)], [50, 50, 200, 200], { atr: ATR }, 5);
    expect(result.days.slice(2).map((d) => d.action)).toEqual(['ATR_PARTIAL_CLOSE', 'TRANSITION_LONG_TO_SHORT']);
  });

  test('should_not_liquidate_after_a_full_close_when_the_signal_flips', () => {
    const result = run([bar(100), bar(150), bar(120), bar(40)], 90, { atr: { ...ATR, closePercent: 100 } }, 5);
    expect(result.atrTriggerCount).toBe(1);
    expect(result.isLiquidated).toBe(false);
    expect(result.finalBalance).toBeCloseTo(1200, 10);
  });

  test('should_charge_the_opening_fee_on_sidelined_capital', () => {
    const result = run([bar(100), bar(150), bar(120), bar(40)], 90, { feeRate: 1, atr: { ...ATR, closePercent: 100 } }, 5);
    const sidelined = result.days[2].sidelineValue;
    const flip = result.days[3];

    expect(flip.fees).toBeCloseTo(sidelined * 0.01, 10);
    expect(flip.position?.entryValue).toBeCloseTo(sidelined * 0.99, 10);
  });
});
