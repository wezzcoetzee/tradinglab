import { describe, expect, test } from 'bun:test';
import {
  calculatePositionSize,
  calculateProfitMetrics,
  validateTradingParameters,
} from './calculations';

describe('calculatePositionSize', () => {
  test('should_size_position_and_margin_from_risk_amount', () => {
    // riskPerUnit = 10, size = 100 / 10 = 10, notional = 1000, margin = 1000 / 10
    const result = calculatePositionSize({
      tradeType: 'LONG', entryPrice: 100, stopLossPrice: 90, leverage: 10, riskAmount: 100,
    });
    expect(result.positionSize).toBe(10);
    expect(result.margin).toBe(100);
    expect(result.potentialLoss).toBe(100);
    expect(result.riskPercentage).toBe(10);
  });

  test('should_use_absolute_price_distance_for_short', () => {
    const result = calculatePositionSize({
      tradeType: 'SHORT', entryPrice: 100, stopLossPrice: 110, leverage: 10, riskAmount: 100,
    });
    expect(result.positionSize).toBe(10);
    expect(result.riskPercentage).toBe(10);
    expect(result.potentialLoss).toBe(100);
  });

  test('should_only_divide_margin_by_leverage', () => {
    const lowLeverage = calculatePositionSize({
      tradeType: 'LONG', entryPrice: 100, stopLossPrice: 90, leverage: 1, riskAmount: 100,
    });
    const highLeverage = calculatePositionSize({
      tradeType: 'LONG', entryPrice: 100, stopLossPrice: 99, leverage: 125, riskAmount: 100,
    });
    expect(lowLeverage.margin).toBe(1000);
    // size = 100, notional = 10000, margin = 10000 / 125
    expect(highLeverage.positionSize).toBe(100);
    expect(highLeverage.margin).toBe(80);
  });

  test('should_handle_fractional_price_differences', () => {
    const result = calculatePositionSize({
      tradeType: 'LONG', entryPrice: 1.0, stopLossPrice: 0.995, leverage: 1, riskAmount: 10,
    });
    expect(result.positionSize).toBeCloseTo(2000, 5);
    expect(result.riskPercentage).toBeCloseTo(0.5, 5);
  });
});

describe('calculateProfitMetrics', () => {
  const long = { tradeType: 'LONG' as const, entryPrice: 100, stopLossPrice: 90, leverage: 1, positionSize: 10 };
  const short = { tradeType: 'SHORT' as const, entryPrice: 100, stopLossPrice: 110, leverage: 1, positionSize: 10 };

  test('should_calculate_all_metrics_for_single_long_take_profit', () => {
    // profit = (120-100)/100 * 10 = 2, loss = 0.1 * 10 = 1, margin = 10 / 10 = 1
    const result = calculateProfitMetrics({ ...long, leverage: 10, takeProfits: [120] });
    expect(result.profits).toHaveLength(1);
    expect(result.profits[0]).toBeCloseTo(2, 10);
    expect(result.totalProfit).toBeCloseTo(2, 10);
    expect(result.potentialLoss).toBeCloseTo(1, 10);
    expect(result.margin).toBeCloseTo(1, 10);
    expect(result.roi).toBeCloseTo(200, 10);
    expect(result.primaryRiskReward).toBeCloseTo(2, 10);
    expect(result.takeProfitBreakdown).toEqual([{ price: 120, profit: result.profits[0], riskReward: result.primaryRiskReward }]);
  });

  test('should_split_position_equally_across_long_take_profits', () => {
    const result = calculateProfitMetrics({ ...long, takeProfits: [110, 120] });
    expect(result.profits[0]).toBeCloseTo(0.5, 10);
    expect(result.profits[1]).toBeCloseTo(1.0, 10);
    expect(result.totalProfit).toBeCloseTo(1.5, 10);
    expect(result.averageProfit).toBeCloseTo(0.75, 10);
    expect(result.averageRiskReward).toBeCloseTo(0.75, 10);
  });

  test('should_split_position_four_ways_with_25_percent_each', () => {
    const result = calculateProfitMetrics({ ...long, positionSize: 100, takeProfits: [110, 120, 130, 140] });
    expect(result.profits[0]).toBeCloseTo(2.5, 10);
    expect(result.profits[3]).toBeCloseTo(10, 10);
    expect(result.takeProfitBreakdown).toHaveLength(4);
  });

  test('should_calculate_profit_roi_and_split_for_short', () => {
    const single = calculateProfitMetrics({ ...short, leverage: 10, takeProfits: [80] });
    expect(single.profits[0]).toBeCloseTo(2, 10);
    expect(single.potentialLoss).toBeCloseTo(1, 10);
    expect(single.roi).toBeCloseTo(200, 10);

    const split = calculateProfitMetrics({ ...short, takeProfits: [90, 80] });
    expect(split.profits[0]).toBeCloseTo(0.5, 10);
    expect(split.profits[1]).toBeCloseTo(1.0, 10);
  });

  test.each([
    ['LONG', long, [80, 120]],
    ['SHORT', short, [120, 80]],
  ])('should_drop_wrong_side_%s_target_from_profits_but_keep_breakdown_aligned', (_type, base, takeProfits) => {
    const result = calculateProfitMetrics({ ...base, positionSize: 1000, takeProfits });
    expect(result.profits).toHaveLength(1);
    expect(result.takeProfitBreakdown.map((tp) => [tp.price, tp.profit])).toEqual([
      [takeProfits[0], 0],
      [takeProfits[1], 100],
    ]);
  });

  test.each([[[]], [[0, 0]]])('should_return_zeros_for_take_profits_%p', (takeProfits) => {
    const result = calculateProfitMetrics({ ...long, takeProfits });
    expect(result.profits).toHaveLength(0);
    expect(result.takeProfitBreakdown).toHaveLength(0);
    expect(result.totalProfit).toBe(0);
    expect(result.averageProfit).toBe(0);
    expect(result.roi).toBe(0);
    expect(result.primaryRiskReward).toBe(0);
  });

  test('should_return_zero_roi_and_risk_reward_when_position_size_is_zero', () => {
    const result = calculateProfitMetrics({ ...long, positionSize: 0, takeProfits: [120] });
    expect(result.roi).toBe(0);
    expect(result.primaryRiskReward).toBe(0);
    expect(result.takeProfitBreakdown[0].riskReward).toBe(0);
  });
});

describe('validateTradingParameters', () => {
  test.each([
    ['LONG', 100, 90, [110, 120]],
    ['LONG', 100, 90, undefined],
    ['LONG', 100, 90, [0, 120]],
    ['SHORT', 100, 110, [90, 80]],
    ['SHORT', 100, 110, undefined],
    ['SHORT', 100, 110, [0, 80]],
  ] as const)('should_accept_%s_entry_%p_stop_%p_tps_%p', (type, entry, stop, tps) => {
    const result = validateTradingParameters(type, entry, stop, tps ? [...tps] : undefined);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test.each([
    ['LONG', 0, 90, [110], 'Entry price must be positive'],
    ['LONG', -50, 90, [110], 'Entry price must be positive'],
    ['LONG', 100, 0, [110], 'Stop loss must be positive'],
    ['LONG', 100, -10, [110], 'Stop loss must be positive'],
    ['LONG', 100, 110, [120], 'For LONG positions, stop loss must be below entry price'],
    ['LONG', 100, 100, [120], 'For LONG positions, stop loss must be below entry price'],
    ['LONG', 100, 90, [80], 'Take profit 1 must be above entry price for LONG positions'],
    ['LONG', 100, 90, [100], 'Take profit 1 must be above entry price for LONG positions'],
    ['LONG', 100, 90, [110, 80, 130], 'Take profit 2 must be above entry price for LONG positions'],
    ['LONG', 100, 90, [120, 110], 'Take profit levels must be in ascending order for LONG positions'],
    ['SHORT', 100, 90, [80], 'For SHORT positions, stop loss must be above entry price'],
    ['SHORT', 100, 100, [80], 'For SHORT positions, stop loss must be above entry price'],
    ['SHORT', 100, 110, [120], 'Take profit 1 must be below entry price for SHORT positions'],
    ['SHORT', 100, 110, [100], 'Take profit 1 must be below entry price for SHORT positions'],
    ['SHORT', 100, 110, [80, 90], 'Take profit levels must be in descending order for SHORT positions'],
  ] as const)('should_reject_%s_entry_%p_stop_%p_tps_%p', (type, entry, stop, tps, error) => {
    const result = validateTradingParameters(type, entry, stop, [...tps]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(error);
  });

  test('should_accumulate_multiple_errors', () => {
    const result = validateTradingParameters('LONG', 0, 0, [80]);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
