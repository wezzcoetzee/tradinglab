import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { OptimalStrategyCard } from './optimal-strategy-card';
import type { BacktestResult, BuyAndHoldBaseline } from '@/lib/backtest/types';

afterEach(() => {
  cleanup();
});

function createMockBaseline(overrides: Partial<BuyAndHoldBaseline> = {}): BuyAndHoldBaseline {
  return {
    purchasePrice: 100,
    purchaseDate: '2024-06-09',
    finalPrice: 120,
    finalDate: '2024-12-31',
    finalValue: 1200,
    percentGain: 20,
    startingCapital: 1000,
    ...overrides,
  };
}

function createMockResult(overrides: Partial<BacktestResult> = {}): BacktestResult {
  return {
    config: {
      smaPeriod: 20,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.1,
    },
    days: [],
    finalBalance: 1100,
    finalCollateral: 1100,
    totalReturn: 10,
    totalFees: 10,
    totalTrades: 5,
    isLiquidated: false,
    ...overrides,
  };
}

describe('OptimalStrategyCard', () => {
  describe('portfolio value rendering', () => {
    test('should_render_final_balance_as_formatted_currency', () => {
      const result = createMockResult({ finalBalance: 1234.56, finalCollateral: 1234.56 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('$1,234.56')).toBeDefined();
    });

    test('should_format_large_currency_values', () => {
      const result = createMockResult({ finalBalance: 1234567.89, finalCollateral: 1234567.89 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('$1,234,567.89')).toBeDefined();
    });

    test('should_format_zero_balance', () => {
      const result = createMockResult({ finalBalance: 0, finalCollateral: 0 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('$0.00')).toBeDefined();
    });

    test('should_display_balance_in_large_font', () => {
      const result = createMockResult({ finalBalance: 1500, finalCollateral: 1500 });
      const baseline = createMockBaseline();
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const balanceElement = container.querySelector('.text-5xl.font-bold.font-mono');
      expect(balanceElement?.textContent).toContain('$1,500.00');
    });
  });

  describe('gain percentage badge', () => {
    test('should_display_positive_gain_with_green_color', () => {
      const result = createMockResult({ totalReturn: 15.5 });
      const baseline = createMockBaseline();
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badge = container.querySelector('.text-green-600');
      expect(badge?.textContent).toContain('+15.50% gain');
    });

    test('should_display_negative_gain_with_red_color', () => {
      const result = createMockResult({ totalReturn: -12.34 });
      const baseline = createMockBaseline();
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badge = container.querySelector('.text-destructive');
      expect(badge?.textContent).toContain('-12.34% gain');
    });

    test('should_display_zero_gain', () => {
      const result = createMockResult({ totalReturn: 0 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('+0.00% gain')).toBeDefined();
    });

    test('should_format_gain_with_two_decimal_places', () => {
      const result = createMockResult({ totalReturn: 123.456 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('+123.46% gain')).toBeDefined();
    });
  });

  describe('vs hold percentage badge', () => {
    test('should_display_green_when_vs_hold_above_5_percent', () => {
      const result = createMockResult({ finalBalance: 1400, finalCollateral: 1400 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badges = container.querySelectorAll('.text-green-600');
      const vsHoldBadge = Array.from(badges).find(b => b.textContent?.includes('vs hold'));
      expect(vsHoldBadge?.textContent).toContain('+16.67% vs hold');
    });

    test('should_display_red_when_vs_hold_below_minus_5_percent', () => {
      const result = createMockResult({ finalBalance: 1000, finalCollateral: 1000 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badge = container.querySelector('.text-destructive');
      expect(badge?.textContent).toContain('-16.67% vs hold');
    });

    test('should_display_yellow_when_vs_hold_within_5_percent', () => {
      const result = createMockResult({ finalBalance: 1230, finalCollateral: 1230 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badge = container.querySelector('.text-yellow-600');
      expect(badge?.textContent).toContain('+2.50% vs hold');
    });

    test('should_calculate_vs_hold_correctly_when_equal', () => {
      const result = createMockResult({ finalBalance: 1200, finalCollateral: 1200 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('+0.00% vs hold')).toBeDefined();
    });

    test('should_calculate_vs_hold_correctly_when_strategy_outperforms', () => {
      const result = createMockResult({ finalBalance: 1500, finalCollateral: 1500 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('+25.00% vs hold')).toBeDefined();
    });

    test('should_calculate_vs_hold_correctly_when_strategy_underperforms', () => {
      const result = createMockResult({ finalBalance: 900, finalCollateral: 900 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('-25.00% vs hold')).toBeDefined();
    });

    test('should_display_yellow_at_exactly_5_percent', () => {
      const result = createMockResult({ finalBalance: 1260, finalCollateral: 1260 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badge = container.querySelector('.text-yellow-600');
      expect(badge?.textContent).toContain('+5.00% vs hold');
    });

    test('should_display_yellow_at_exactly_minus_5_percent', () => {
      const result = createMockResult({ finalBalance: 1140, finalCollateral: 1140 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badge = container.querySelector('.text-yellow-600');
      expect(badge?.textContent).toContain('-5.00% vs hold');
    });

    test('should_display_green_at_just_above_5_percent', () => {
      const result = createMockResult({ finalBalance: 1261, finalCollateral: 1261 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badges = container.querySelectorAll('.text-green-600');
      const vsHoldBadge = Array.from(badges).find(b => b.textContent?.includes('vs hold'));
      expect(vsHoldBadge).toBeDefined();
    });

    test('should_display_red_at_just_below_minus_5_percent', () => {
      const result = createMockResult({ finalBalance: 1139, finalCollateral: 1139 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const badges = container.querySelectorAll('.text-destructive');
      const vsHoldBadge = Array.from(badges).find(b => b.textContent?.includes('vs hold'));
      expect(vsHoldBadge).toBeDefined();
    });
  });

  describe('strategy parameters display', () => {
    test('should_display_sma_period', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 25,
          longLeverage: 1,
          shortLeverage: 1,
          startingCapital: 1000,
          feeRate: 0.1,
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('SMA Period')).toBeDefined();
      expect(screen.getByText('25')).toBeDefined();
    });

    test('should_display_long_leverage_with_x_suffix', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 20,
          longLeverage: 2.5,
          shortLeverage: 1,
          startingCapital: 1000,
          feeRate: 0.1,
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('Long Leverage')).toBeDefined();
      expect(screen.getByText('2.5x')).toBeDefined();
    });

    test('should_display_short_leverage_with_x_suffix', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 20,
          longLeverage: 1,
          shortLeverage: 1.75,
          startingCapital: 1000,
          feeRate: 0.1,
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('Short Leverage')).toBeDefined();
      expect(screen.getByText('1.75x')).toBeDefined();
    });

    test('should_display_all_parameter_labels', () => {
      const result = createMockResult();
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('SMA Period')).toBeDefined();
      expect(screen.getByText('Long Leverage')).toBeDefined();
      expect(screen.getByText('Short Leverage')).toBeDefined();
      expect(screen.getByText('ATR Config')).toBeDefined();
      expect(screen.getByText('Total Trades')).toBeDefined();
    });
  });

  describe('atr config formatting', () => {
    test('should_display_none_when_no_atr_config', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 20,
          longLeverage: 1,
          shortLeverage: 1,
          startingCapital: 1000,
          feeRate: 0.1,
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('None')).toBeDefined();
    });

    test('should_format_atr_config_correctly', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 20,
          longLeverage: 1,
          shortLeverage: 1,
          startingCapital: 1000,
          feeRate: 0.1,
          atr: { period: 14, multiplier: 3, closePercent: 50 }
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('14/3/50%')).toBeDefined();
    });

    test('should_format_atr_config_with_different_values', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 20,
          longLeverage: 1,
          shortLeverage: 1,
          startingCapital: 1000,
          feeRate: 0.1,
          atr: { period: 20, multiplier: 2.5, closePercent: 25 }
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('20/2.5/25%')).toBeDefined();
    });

    test('should_format_atr_config_with_all_valid_combinations', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 20,
          longLeverage: 1,
          shortLeverage: 1,
          startingCapital: 1000,
          feeRate: 0.1,
          atr: { period: 10, multiplier: 4, closePercent: 100 }
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('10/4/100%')).toBeDefined();
    });
  });

  describe('total trades display', () => {
    test('should_display_total_trades_count', () => {
      const result = createMockResult({ totalTrades: 42 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('42')).toBeDefined();
    });

    test('should_display_zero_trades', () => {
      const result = createMockResult({ totalTrades: 0 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const elements = screen.getAllByText('0');
      expect(elements.length).toBeGreaterThan(0);
    });

    test('should_display_large_trade_count', () => {
      const result = createMockResult({ totalTrades: 9999 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('9999')).toBeDefined();
    });
  });

  describe('card layout and styling', () => {
    test('should_render_card_with_optimal_strategy_title', () => {
      const result = createMockResult();
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('Optimal Strategy')).toBeDefined();
    });

    test('should_render_card_with_border_styling', () => {
      const result = createMockResult();
      const baseline = createMockBaseline();
      const { container } = render(<OptimalStrategyCard result={result} baseline={baseline} />);
      const card = container.querySelector('.border-2.border-primary\\/20');
      expect(card).not.toBeNull();
    });

    test('should_render_both_badges', () => {
      const result = createMockResult({ totalReturn: 10, finalBalance: 1300, finalCollateral: 1300 });
      const baseline = createMockBaseline({ finalValue: 1200 });
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('+10.00% gain')).toBeDefined();
      expect(screen.getByText('+8.33% vs hold')).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('should_handle_extreme_positive_return', () => {
      const result = createMockResult({ totalReturn: 9999.99, finalBalance: 100999.90, finalCollateral: 100999.90 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('+9999.99% gain')).toBeDefined();
    });

    test('should_handle_extreme_negative_return', () => {
      const result = createMockResult({ totalReturn: -99.99, finalBalance: 0.01, finalCollateral: 0.01 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('-99.99% gain')).toBeDefined();
    });

    test('should_handle_fractional_leverages', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 20,
          longLeverage: 1.25,
          shortLeverage: 1.75,
          startingCapital: 1000,
          feeRate: 0.1,
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('1.25x')).toBeDefined();
      expect(screen.getByText('1.75x')).toBeDefined();
    });

    test('should_handle_very_large_sma_period', () => {
      const result = createMockResult({
        config: {
          smaPeriod: 200,
          longLeverage: 1,
          shortLeverage: 1,
          startingCapital: 1000,
          feeRate: 0.1,
        }
      });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('200')).toBeDefined();
    });

    test('should_handle_very_small_baseline_value', () => {
      const result = createMockResult({ finalBalance: 100, finalCollateral: 100 });
      const baseline = createMockBaseline({ finalValue: 10 });
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('+900.00% vs hold')).toBeDefined();
    });

    test('should_handle_decimal_trade_counts', () => {
      const result = createMockResult({ totalTrades: 123 });
      const baseline = createMockBaseline();
      render(<OptimalStrategyCard result={result} baseline={baseline} />);
      expect(screen.getByText('123')).toBeDefined();
    });
  });
});
