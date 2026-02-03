import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmaComparisonTable } from './sma-comparison-table';
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

describe('SmaComparisonTable', () => {
  describe('empty state', () => {
    test('should_return_null_when_results_empty', () => {
      const { container } = render(<SmaComparisonTable results={[]} baseline={null} />);
      expect(container.firstChild).toBeNull();
    });

    test('should_not_render_card_when_no_results', () => {
      render(<SmaComparisonTable results={[]} baseline={null} />);
      expect(screen.queryByText('SMA Period Comparison')).toBeNull();
    });
  });

  describe('rendering with data', () => {
    test('should_render_card_with_title', () => {
      const results = [createMockResult()];
      render(<SmaComparisonTable results={results} baseline={null} />);
      expect(screen.getByText('SMA Period Comparison')).toBeDefined();
    });

    test('should_display_period_count_in_description', () => {
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);
      expect(screen.getByText('Best result for each SMA period (3 periods)')).toBeDefined();
    });

    test('should_render_table_headers', () => {
      const results = [createMockResult()];
      render(<SmaComparisonTable results={results} baseline={null} />);
      expect(screen.getByText('SMA Period')).toBeDefined();
      expect(screen.getByText('Final Value')).toBeDefined();
      expect(screen.getByText('% Gain')).toBeDefined();
      expect(screen.getByText('% vs Hold')).toBeDefined();
      expect(screen.getByText('Status')).toBeDefined();
    });

    test('should_render_result_rows_with_sma_period', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 25, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);
      expect(screen.getByText('25 days')).toBeDefined();
    });
  });

  describe('grouping by sma period', () => {
    test('should_group_results_by_sma_period', () => {
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1100 }),
        createMockResult({ config: { smaPeriod: 20, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1200 }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1300 }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3);
    });

    test('should_keep_best_result_per_sma_period', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1100,
          isLiquidated: false,
        }),
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1500,
          isLiquidated: false,
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('$1,500.00')).toBeDefined();
      expect(screen.queryByText('$1,100.00')).toBeNull();
    });

    test('should_keep_highest_balance_non_liquidated_result', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1600,
          isLiquidated: false,
        }),
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1200,
          isLiquidated: false,
        }),
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 3, shortLeverage: 3, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1400,
          isLiquidated: false,
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('$1,600.00')).toBeDefined();
    });
  });

  describe('liquidated vs non-liquidated preference', () => {
    test('should_prefer_non_liquidated_over_liquidated', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 2000,
          isLiquidated: true,
          liquidationDate: '2024-06-10',
        }),
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1100,
          isLiquidated: false,
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('$1,100.00')).toBeDefined();
      expect(screen.queryByText('$2,000.00')).toBeNull();
    });

    test('should_choose_higher_balance_when_both_liquidated', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 800,
          isLiquidated: true,
          liquidationDate: '2024-06-10',
        }),
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 900,
          isLiquidated: true,
          liquidationDate: '2024-06-11',
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('$900.00')).toBeDefined();
      expect(screen.queryByText('$800.00')).toBeNull();
    });

    test('should_choose_higher_balance_when_both_non_liquidated', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1300,
          isLiquidated: false,
        }),
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 2, shortLeverage: 2, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1700,
          isLiquidated: false,
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('$1,700.00')).toBeDefined();
      expect(screen.queryByText('$1,300.00')).toBeNull();
    });
  });

  describe('default sorting', () => {
    test('should_sort_by_final_balance_descending_by_default', () => {
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1100, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1500, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1300, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('$1,500.00');
      expect(rows[2].textContent).toContain('$1,300.00');
      expect(rows[3].textContent).toContain('$1,100.00');
    });

    test('should_place_liquidated_rows_at_bottom', () => {
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1100, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1500, isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1300, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const rows = screen.getAllByRole('row');
      expect(rows[3].textContent).toContain('LIQUIDATED');
    });

    test('should_sort_liquidated_by_final_balance_descending', () => {
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 800, isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1000, isLiquidated: true, liquidationDate: '2024-06-11' }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 900, isLiquidated: true, liquidationDate: '2024-06-12' }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const rows = screen.getAllByRole('row');
      const balances = [rows[1], rows[2], rows[3]].map(row => {
        const match = row.textContent?.match(/\$[\d,]+\.\d{2}/);
        return match ? match[0] : '';
      });
      expect(balances).toEqual(['$1,000.00', '$900.00', '$800.00']);
    });
  });

  describe('sorting functionality', () => {
    test('should_toggle_sort_direction_on_header_click', async () => {
      const user = userEvent.setup();
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1100, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1500, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const finalValueHeader = screen.getByText('Final Value').closest('th');
      await user.click(finalValueHeader!);

      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('$1,100.00');
      expect(rows[2].textContent).toContain('$1,500.00');
    });

    test('should_sort_by_sma_period', async () => {
      const user = userEvent.setup();
      const results = [
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const smaPeriodHeader = screen.getByText('SMA Period').closest('th');
      await user.click(smaPeriodHeader!);

      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('40 days');
      expect(rows[2].textContent).toContain('30 days');
      expect(rows[3].textContent).toContain('20 days');
    });

    test('should_sort_by_percent_gain', async () => {
      const user = userEvent.setup();
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, totalReturn: 10, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, totalReturn: 50, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, totalReturn: 30, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const percentGainHeader = screen.getByText('% Gain').closest('th');
      await user.click(percentGainHeader!);

      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('+50.00%');
      expect(rows[2].textContent).toContain('+30.00%');
      expect(rows[3].textContent).toContain('+10.00%');
    });

    test('should_sort_by_vs_hold', async () => {
      const user = userEvent.setup();
      const baseline = createMockBaseline({ finalValue: 1200 });
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1300, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1500, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, finalBalance: 1400, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={baseline} />);

      const vsHoldHeader = screen.getByText('% vs Hold').closest('th');
      await user.click(vsHoldHeader!);

      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('$1,500.00');
      expect(rows[2].textContent).toContain('$1,400.00');
      expect(rows[3].textContent).toContain('$1,300.00');
    });

    test('should_sort_by_status', async () => {
      const user = userEvent.setup();
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: false }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ config: { smaPeriod: 40, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const statusHeader = screen.getByText('Status').closest('th');
      await user.click(statusHeader!);

      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('LIQUIDATED');
      expect(rows[2].textContent).not.toContain('LIQUIDATED');
      expect(rows[3].textContent).not.toContain('LIQUIDATED');
    });

    test('should_not_put_liquidated_at_bottom_when_sorting_by_status', async () => {
      const user = userEvent.setup();
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: false }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const statusHeader = screen.getByText('Status').closest('th');
      await user.click(statusHeader!);

      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('LIQUIDATED');
    });
  });

  describe('show all button', () => {
    test('should_not_show_button_when_50_or_fewer_results', () => {
      const results = Array.from({ length: 50 }, (_, i) =>
        createMockResult({ config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })
      );
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.queryByText(/Show All/)).toBeNull();
    });

    test('should_show_button_when_more_than_50_results', () => {
      const results = Array.from({ length: 51 }, (_, i) =>
        createMockResult({ config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })
      );
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('Show All 51')).toBeDefined();
    });

    test('should_display_top_50_by_default', () => {
      const results = Array.from({ length: 75 }, (_, i) =>
        createMockResult({ config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })
      );
      render(<SmaComparisonTable results={results} baseline={null} />);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(51);
    });

    test('should_expand_to_show_all_results_when_clicked', async () => {
      const user = userEvent.setup();
      const results = Array.from({ length: 75 }, (_, i) =>
        createMockResult({ config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })
      );
      render(<SmaComparisonTable results={results} baseline={null} />);

      const button = screen.getByText('Show All 75');
      await user.click(button);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(76);
    });

    test('should_toggle_button_text_when_clicked', async () => {
      const user = userEvent.setup();
      const results = Array.from({ length: 75 }, (_, i) =>
        createMockResult({ config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })
      );
      render(<SmaComparisonTable results={results} baseline={null} />);

      const button = screen.getByText('Show All 75');
      await user.click(button);

      expect(screen.getByText('Show Top 50')).toBeDefined();
    });

    test('should_collapse_to_top_50_when_clicked_again', async () => {
      const user = userEvent.setup();
      const results = Array.from({ length: 75 }, (_, i) =>
        createMockResult({ config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })
      );
      render(<SmaComparisonTable results={results} baseline={null} />);

      const showAllButton = screen.getByText('Show All 75');
      await user.click(showAllButton);

      const showTop50Button = screen.getByText('Show Top 50');
      await user.click(showTop50Button);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(51);
    });
  });

  describe('row background colors', () => {
    test('should_apply_background_class_for_vs_hold_above_50', () => {
      const baseline = createMockBaseline({ finalValue: 1000 });
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1500,
          isLiquidated: false,
        }),
      ];
      const { container } = render(<SmaComparisonTable results={results} baseline={baseline} />);

      const row = container.querySelector('.bg-green-100');
      expect(row).not.toBeNull();
    });

    test('should_apply_background_class_for_vs_hold_above_20', () => {
      const baseline = createMockBaseline({ finalValue: 1000 });
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1300,
          isLiquidated: false,
        }),
      ];
      const { container } = render(<SmaComparisonTable results={results} baseline={baseline} />);

      const row = container.querySelector('.bg-green-50');
      expect(row).not.toBeNull();
    });

    test('should_apply_background_class_for_vs_hold_above_0', () => {
      const baseline = createMockBaseline({ finalValue: 1000 });
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1100,
          isLiquidated: false,
        }),
      ];
      const { container } = render(<SmaComparisonTable results={results} baseline={baseline} />);

      const row = container.querySelector('.bg-yellow-50');
      expect(row).not.toBeNull();
    });

    test('should_apply_background_class_for_vs_hold_above_minus_20', () => {
      const baseline = createMockBaseline({ finalValue: 1000 });
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 900,
          isLiquidated: false,
        }),
      ];
      const { container } = render(<SmaComparisonTable results={results} baseline={baseline} />);

      const row = container.querySelector('.bg-orange-50');
      expect(row).not.toBeNull();
    });

    test('should_apply_background_class_for_vs_hold_below_minus_20', () => {
      const baseline = createMockBaseline({ finalValue: 1000 });
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 700,
          isLiquidated: false,
        }),
      ];
      const { container } = render(<SmaComparisonTable results={results} baseline={baseline} />);

      const row = container.querySelector('.bg-red-50');
      expect(row).not.toBeNull();
    });

    test('should_apply_destructive_styling_to_liquidated_row', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          isLiquidated: true,
          liquidationDate: '2024-06-10',
        }),
      ];
      const { container } = render(<SmaComparisonTable results={results} baseline={null} />);

      const row = container.querySelector('.bg-destructive\\/10');
      expect(row).not.toBeNull();
    });

    test('should_prioritize_destructive_styling_over_vs_hold_styling', () => {
      const baseline = createMockBaseline({ finalValue: 1000 });
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          finalBalance: 1500,
          isLiquidated: true,
          liquidationDate: '2024-06-10',
        }),
      ];
      const { container } = render(<SmaComparisonTable results={results} baseline={baseline} />);

      const destructiveRow = container.querySelector('.bg-destructive\\/10');
      expect(destructiveRow).not.toBeNull();

      const greenRow = container.querySelector('.bg-green-100');
      expect(greenRow).toBeNull();
    });
  });

  describe('liquidated display', () => {
    test('should_show_liquidated_badge', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          isLiquidated: true,
          liquidationDate: '2024-06-10',
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('LIQUIDATED')).toBeDefined();
    });

    test('should_show_liquidation_date_below_badge', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          isLiquidated: true,
          liquidationDate: '2024-06-10',
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('2024-06-10')).toBeDefined();
    });

    test('should_show_dash_when_not_liquidated', () => {
      const results = [
        createMockResult({
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          isLiquidated: false,
        }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const rows = screen.getAllByRole('row');
      const statusCell = within(rows[1]).getAllByRole('cell')[4];
      expect(statusCell.textContent).toBe('-');
    });
  });

  describe('formatting', () => {
    test('should_format_currency_correctly', () => {
      const results = [
        createMockResult({ finalBalance: 1234.56 }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('$1,234.56')).toBeDefined();
    });

    test('should_format_percent_with_plus_sign', () => {
      const results = [
        createMockResult({ totalReturn: 15.456 }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('+15.46%')).toBeDefined();
    });

    test('should_format_negative_percent', () => {
      const results = [
        createMockResult({ totalReturn: -12.345 }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('-12.35%')).toBeDefined();
    });

    test('should_show_dash_when_no_baseline', () => {
      const results = [
        createMockResult(),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const rows = screen.getAllByRole('row');
      const vsHoldCell = within(rows[1]).getAllByRole('cell')[3];
      expect(vsHoldCell.textContent).toBe('-');
    });

    test('should_calculate_vs_hold_correctly', () => {
      const baseline = createMockBaseline({ finalValue: 1200 });
      const results = [
        createMockResult({ finalBalance: 1500 }),
      ];
      render(<SmaComparisonTable results={results} baseline={baseline} />);

      expect(screen.getByText('+25.00%')).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('should_handle_single_result', () => {
      const results = [createMockResult()];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('Best result for each SMA period (1 periods)')).toBeDefined();
    });

    test('should_handle_many_sma_periods', () => {
      const results = Array.from({ length: 100 }, (_, i) =>
        createMockResult({ config: { smaPeriod: 20 + i, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 } })
      );
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('Best result for each SMA period (100 periods)')).toBeDefined();
    });

    test('should_handle_extreme_positive_returns', () => {
      const results = [
        createMockResult({ totalReturn: 9999.99, finalBalance: 100999.90 }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('+9999.99%')).toBeDefined();
    });

    test('should_handle_extreme_negative_returns', () => {
      const results = [
        createMockResult({ totalReturn: -99.99, finalBalance: 0.01 }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('-99.99%')).toBeDefined();
    });

    test('should_handle_zero_balance', () => {
      const results = [
        createMockResult({ finalBalance: 0, isLiquidated: true, liquidationDate: '2024-06-10' }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      expect(screen.getByText('$0.00')).toBeDefined();
    });

    test('should_handle_all_liquidated_results', () => {
      const results = [
        createMockResult({ config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: true, liquidationDate: '2024-06-10' }),
        createMockResult({ config: { smaPeriod: 30, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 }, isLiquidated: true, liquidationDate: '2024-06-11' }),
      ];
      render(<SmaComparisonTable results={results} baseline={null} />);

      const badges = screen.getAllByText('LIQUIDATED');
      expect(badges.length).toBe(2);
    });
  });
});
