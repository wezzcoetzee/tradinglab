import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { ResultsTable } from './results-table';
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
    totalReturn: 10,
    totalFees: 10,
    totalTrades: 5,
    isLiquidated: false,
    ...overrides,
  };
}

describe('ResultsTable', () => {
  describe('empty state', () => {
    test('should_return_null_when_results_empty', () => {
      const { container } = render(<ResultsTable results={[]} baseline={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('rendering with data', () => {
    test('should_render_card_with_results', () => {
      const results = [createMockResult()];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('Backtest Results')).toBeDefined();
    });

    test('should_display_configuration_count', () => {
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 } }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 3, shortLeverage: 3, startingCapital: 1000, feeRate: 0.1 } }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('3 configurations tested')).toBeDefined();
    });

    test('should_render_table_headers', () => {
      const results = [createMockResult()];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('SMA')).toBeDefined();
      expect(screen.getByText('Long Lev')).toBeDefined();
      expect(screen.getByText('Short Lev')).toBeDefined();
      expect(screen.getByText('ATR Config')).toBeDefined();
      expect(screen.getByText('Final Balance')).toBeDefined();
      expect(screen.getByText('Return')).toBeDefined();
      expect(screen.getByText('Trades')).toBeDefined();
      expect(screen.getByText('Status')).toBeDefined();
      expect(screen.getByText('Liquidation Date')).toBeDefined();
    });

    test('should_render_result_rows', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 25, longLeverage: 2, shortLeverage: 1.5, startingCapital: 1000, feeRate: 0.1 },
          totalTrades: 42,
        }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('25')).toBeDefined();
      expect(screen.getByText('2x')).toBeDefined();
      expect(screen.getByText('1.5x')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
    });
  });

  describe('metrics calculations', () => {
    test('should_calculate_total_count', () => {
      const results = [
        createMockResult(),
        createMockResult(),
        createMockResult(),
      ];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const totalConfigElement = container.querySelector('.text-2xl.font-bold');
      expect(totalConfigElement?.textContent).toBe('3');
    });

    test('should_calculate_profitable_count', () => {
      const results = [
        createMockResult({ totalReturn: 10, isLiquidated: false }),
        createMockResult({ totalReturn: 20, isLiquidated: false }),
        createMockResult({ totalReturn: -5, isLiquidated: false }),
      ];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const profitableElement = container.querySelector('.text-green-600.text-2xl.font-bold');
      expect(profitableElement?.textContent).toBe('2');
    });

    test('should_calculate_liquidated_count', () => {
      const results = [
        createMockResult({ isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ isLiquidated: false }),
        createMockResult({ isLiquidated: true, liquidationDate: '2024-06-11' }),
      ];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const metrics = container.querySelectorAll('.text-2xl.font-bold');
      const liquidatedElement = metrics[2];
      expect(liquidatedElement?.textContent).toBe('2');
    });

    test('should_calculate_liquidation_rate', () => {
      const results = [
        createMockResult({ isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ isLiquidated: false }),
        createMockResult({ isLiquidated: false }),
        createMockResult({ isLiquidated: false }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('25.0%')).toBeDefined();
    });

    test('should_exclude_liquidated_from_profitable_count', () => {
      const results = [
        createMockResult({ totalReturn: 50, isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ totalReturn: 10, isLiquidated: false }),
      ];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const profitableElement = container.querySelector('.text-green-600.text-2xl.font-bold');
      expect(profitableElement?.textContent).toBe('1');
    });

    test('should_handle_zero_liquidation_rate', () => {
      const results = [
        createMockResult({ isLiquidated: false }),
        createMockResult({ isLiquidated: false }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('0.0%')).toBeDefined();
    });

    test('should_handle_100_percent_liquidation_rate', () => {
      const results = [
        createMockResult({ isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ isLiquidated: true, liquidationDate: '2024-06-11' }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('100.0%')).toBeDefined();
    });
  });

  describe('sorting', () => {
    test('should_sort_liquidated_to_bottom', () => {
      const results = [
        createMockResult({ totalReturn: 10, isLiquidated: false, config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } }),
        createMockResult({ totalReturn: 50, isLiquidated: true, liquidationDate: '2024-06-10', config: { smaPeriod: 30, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 } }),
        createMockResult({ totalReturn: 20, isLiquidated: false, config: { smaPeriod: 40, longLeverage: 1.5, shortLeverage: 1.5, startingCapital: 1000, feeRate: 0.1 } }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      const rows = screen.getAllByRole('row');
      const lastRow = rows[rows.length - 1];
      expect(lastRow.textContent).toContain('LIQUIDATED');
    });

    test('should_sort_non_liquidated_by_return_descending', () => {
      const results = [
        createMockResult({ totalReturn: 10, isLiquidated: false, finalBalance: 1100 }),
        createMockResult({ totalReturn: 50, isLiquidated: false, finalBalance: 1500 }),
        createMockResult({ totalReturn: 30, isLiquidated: false, finalBalance: 1300 }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('+50.00%');
      expect(rows[2].textContent).toContain('+30.00%');
      expect(rows[3].textContent).toContain('+10.00%');
    });

    test('should_maintain_sort_with_mixed_results', () => {
      const results = [
        createMockResult({ totalReturn: 10, isLiquidated: false }),
        createMockResult({ totalReturn: -100, isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ totalReturn: 30, isLiquidated: false }),
        createMockResult({ totalReturn: -100, isLiquidated: true, liquidationDate: '2024-06-11' }),
        createMockResult({ totalReturn: 20, isLiquidated: false }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      const rows = screen.getAllByRole('row');
      const activeBadges = screen.getAllByText('Active');
      const liquidatedBadges = screen.getAllByText('LIQUIDATED');
      expect(activeBadges.length).toBe(3);
      expect(liquidatedBadges.length).toBe(2);
    });
  });

  describe('formatting functions', () => {
    test('should_format_currency_correctly', () => {
      const results = [createMockResult({ finalBalance: 1234.56 })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('$1,234.56')).toBeDefined();
    });

    test('should_format_large_currency_values', () => {
      const results = [createMockResult({ finalBalance: 1234567.89 })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('$1,234,567.89')).toBeDefined();
    });

    test('should_format_zero_currency', () => {
      const results = [createMockResult({ finalBalance: 0, isLiquidated: true, liquidationDate: '2024-06-10' })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('$0.00')).toBeDefined();
    });

    test('should_format_positive_percent_with_plus_sign', () => {
      const results = [createMockResult({ totalReturn: 15.456 })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('+15.46%')).toBeDefined();
    });

    test('should_format_negative_percent_without_plus_sign', () => {
      const results = [createMockResult({ totalReturn: -12.345 })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('-12.35%')).toBeDefined();
    });

    test('should_format_zero_percent', () => {
      const results = [createMockResult({ totalReturn: 0 })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('+0.00%')).toBeDefined();
    });

    test('should_format_atr_config_when_present', () => {
      const results = [
        createMockResult({
          config: {
            smaPeriod: 20,
            longLeverage: 1,
            shortLeverage: 1,
            startingCapital: 1000,
            feeRate: 0.1,
            atr: { period: 14, multiplier: 3, closePercent: 50 }
          }
        })
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('14/3/50%')).toBeDefined();
    });

    test('should_format_atr_config_with_different_values', () => {
      const results = [
        createMockResult({
          config: {
            smaPeriod: 20,
            longLeverage: 1,
            shortLeverage: 1,
            startingCapital: 1000,
            feeRate: 0.1,
            atr: { period: 20, multiplier: 2.5, closePercent: 25 }
          }
        })
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('20/2.5/25%')).toBeDefined();
    });

    test('should_show_dash_when_no_atr_config', () => {
      const results = [createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })];
      render(<ResultsTable results={results} baseline={null} />);
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('liquidation display', () => {
    test('should_show_liquidated_badge_when_liquidated', () => {
      const results = [createMockResult({ isLiquidated: true, liquidationDate: '2024-06-10' })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('LIQUIDATED')).toBeDefined();
    });

    test('should_show_active_badge_when_not_liquidated', () => {
      const results = [createMockResult({ isLiquidated: false })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('Active')).toBeDefined();
    });

    test('should_show_liquidation_date_when_liquidated', () => {
      const results = [createMockResult({ isLiquidated: true, liquidationDate: '2024-06-10' })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('2024-06-10')).toBeDefined();
    });

    test('should_show_dash_when_not_liquidated', () => {
      const results = [createMockResult({ isLiquidated: false })];
      render(<ResultsTable results={results} baseline={null} />);
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });

    test('should_show_dash_when_liquidation_date_undefined', () => {
      const results = [createMockResult({ isLiquidated: true, liquidationDate: undefined })];
      render(<ResultsTable results={results} baseline={null} />);
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });

    test('should_apply_destructive_styling_to_liquidated_row', () => {
      const results = [createMockResult({ isLiquidated: true, liquidationDate: '2024-06-10' })];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const row = container.querySelector('.bg-destructive\\/10');
      expect(row).not.toBeNull();
    });

    test('should_not_apply_destructive_styling_to_active_row', () => {
      const results = [createMockResult({ isLiquidated: false })];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0].className).not.toContain('bg-destructive');
    });
  });

  describe('edge cases', () => {
    test('should_handle_single_result', () => {
      const results = [createMockResult()];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('1 configurations tested')).toBeDefined();
    });

    test('should_handle_many_results', () => {
      const results = Array.from({ length: 100 }, (_, i) =>
        createMockResult({
          config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          totalReturn: i
        })
      );
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('100 configurations tested')).toBeDefined();
    });

    test('should_handle_extreme_negative_returns', () => {
      const results = [createMockResult({ totalReturn: -99.99, finalBalance: 0.01 })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('-99.99%')).toBeDefined();
    });

    test('should_handle_extreme_positive_returns', () => {
      const results = [createMockResult({ totalReturn: 9999.99, finalBalance: 100999.90 })];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('+9999.99%')).toBeDefined();
    });

    test('should_handle_fractional_leverages', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1.25, shortLeverage: 1.75, startingCapital: 1000, feeRate: 0.1 }
        })
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('1.25x')).toBeDefined();
      expect(screen.getByText('1.75x')).toBeDefined();
    });

    test('should_handle_mixed_dates_format', () => {
      const results = [
        createMockResult({ isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ isLiquidated: true, liquidationDate: '1/1/2024' }),
        createMockResult({ isLiquidated: true, liquidationDate: '162/1/2024' }),
      ];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('2024-06-10')).toBeDefined();
      expect(screen.getByText('1/1/2024')).toBeDefined();
      expect(screen.getByText('162/1/2024')).toBeDefined();
    });
  });

  describe('metrics grid display', () => {
    test('should_display_all_four_metric_cards', () => {
      const results = [createMockResult()];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('Total Configs')).toBeDefined();
      expect(screen.getByText('Profitable')).toBeDefined();
      expect(screen.getByText('Liquidated')).toBeDefined();
      expect(screen.getByText('Liquidation Rate')).toBeDefined();
    });

    test('should_show_zero_profitable_when_all_negative', () => {
      const results = [
        createMockResult({ totalReturn: -5, isLiquidated: false }),
        createMockResult({ totalReturn: -10, isLiquidated: false }),
      ];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const profitableElement = container.querySelector('.text-green-600.text-2xl.font-bold');
      expect(profitableElement?.textContent).toBe('0');
    });

    test('should_show_zero_liquidated_when_none_liquidated', () => {
      const results = [
        createMockResult({ isLiquidated: false }),
        createMockResult({ isLiquidated: false }),
      ];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const metrics = container.querySelectorAll('.text-2xl.font-bold');
      const liquidatedElement = metrics[2];
      expect(liquidatedElement?.textContent).toBe('0');
    });
  });

  describe('baseline display', () => {
    test('should_not_render_baseline_card_when_null', () => {
      const results = [createMockResult()];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.queryByText('Buy & Hold Baseline')).toBeNull();
    });

    test('should_render_baseline_card_when_provided', () => {
      const results = [createMockResult()];
      const baseline = createMockBaseline();
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.getByText('Buy & Hold Baseline')).toBeDefined();
    });

    test('should_display_purchase_price_and_date', () => {
      const results = [createMockResult()];
      const baseline = createMockBaseline({ purchasePrice: 150, purchaseDate: '2024-07-15' });
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.getByText('$150.00')).toBeDefined();
      expect(screen.getByText('2024-07-15')).toBeDefined();
    });

    test('should_display_final_price_and_date', () => {
      const results = [createMockResult()];
      const baseline = createMockBaseline({ finalPrice: 180, finalDate: '2024-12-20' });
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.getByText('$180.00')).toBeDefined();
      expect(screen.getByText('2024-12-20')).toBeDefined();
    });

    test('should_display_final_value', () => {
      const results = [createMockResult()];
      const baseline = createMockBaseline({ finalValue: 1500 });
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.getByText('$1,500.00')).toBeDefined();
    });

    test('should_display_percent_gain_positive', () => {
      const results = [createMockResult()];
      const baseline = createMockBaseline({ percentGain: 25.5 });
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.getByText('+25.50%')).toBeDefined();
    });

    test('should_display_percent_gain_negative', () => {
      const results = [createMockResult()];
      const baseline = createMockBaseline({ percentGain: -15.25 });
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.getByText('-15.25%')).toBeDefined();
    });
  });

  describe('vs Hold column', () => {
    test('should_render_vs_hold_header', () => {
      const results = [createMockResult()];
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText('vs Hold')).toBeDefined();
    });

    test('should_show_dash_when_no_baseline', () => {
      const results = [createMockResult({ finalBalance: 1200 })];
      render(<ResultsTable results={results} baseline={null} />);
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });

    test('should_calculate_vs_hold_correctly', () => {
      // #given: baseline final value is 1200, strategy final balance is 1500
      // vsHold = ((1500 - 1200) / 1200) * 100 = 25%
      const results = [createMockResult({ finalBalance: 1500 })];
      const baseline = createMockBaseline({ finalValue: 1200 });
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.getByText('+25.00%')).toBeDefined();
    });

    test('should_show_green_when_vs_hold_above_5_percent', () => {
      const results = [createMockResult({ finalBalance: 1300 })];
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<ResultsTable results={results} baseline={baseline} />);
      const tableBody = container.querySelector('tbody');
      const allCells = tableBody?.querySelectorAll('td');
      const vsHoldCell = allCells?.[6];
      expect(vsHoldCell?.textContent).toContain('+8.33%');
      expect(vsHoldCell?.querySelector('.text-green-600')).not.toBeNull();
    });

    test('should_show_red_when_vs_hold_below_minus_5_percent', () => {
      const results = [createMockResult({ finalBalance: 1100 })];
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<ResultsTable results={results} baseline={baseline} />);
      const tableBody = container.querySelector('tbody');
      const allCells = tableBody?.querySelectorAll('td');
      const vsHoldCell = allCells?.[6];
      expect(vsHoldCell?.textContent).toContain('-8.33%');
      expect(vsHoldCell?.querySelector('.text-destructive')).not.toBeNull();
    });

    test('should_show_yellow_when_vs_hold_within_5_percent', () => {
      const results = [createMockResult({ finalBalance: 1200 })];
      const baseline = createMockBaseline({ finalValue: 1200 });
      const { container } = render(<ResultsTable results={results} baseline={baseline} />);
      const vsHoldCell = container.querySelector('.text-yellow-600');
      expect(vsHoldCell?.textContent).toContain('+0.00%');
    });
  });
});
