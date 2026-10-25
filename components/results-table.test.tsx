import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsTable } from './results-table';
import type { BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

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

function createMockResult(
  overrides: Partial<Omit<BacktestResultSummary, 'config'>> & { smaPeriod?: number; config?: Partial<BacktestResultSummary['config']> } = {}
): BacktestResultSummary {
  const { smaPeriod = 20, config, ...rest } = overrides;
  return {
    config: {
      smaPeriod,
      longLeverage: 1,
      shortLeverage: 1,
      startingCapital: 1000,
      feeRate: 0.1,
      ...config,
    },
    finalBalance: 1100,
    totalReturn: 10,
    totalFees: 10,
    totalTrades: 5,
    atrTriggerCount: 0,
    isLiquidated: false,
    ...rest,
  };
}

const liquidated = { isLiquidated: true, liquidationDate: '2024-06-10' } as const;

async function expandSection(title: string) {
  await userEvent.setup().click(screen.getByText(title));
}

function getTable(firstHeader: string) {
  const table = screen.getAllByRole('table').find((t) => within(t).queryByText(firstHeader) !== null);
  return table!;
}

const getSmaTable = () => getTable('SMA Period');
const getAllConfigsTable = () => getTable('Long Lev');

function getBodyRows(table: HTMLElement) {
  return within(table).getAllByRole('row').slice(1);
}

async function renderSmaTable(results: BacktestResultSummary[], baseline: BuyAndHoldBaseline | null = null) {
  render(<ResultsTable results={results} baseline={baseline} />);
  await expandSection('SMA Period Comparison');
  return getSmaTable();
}

async function renderAllConfigs(results: BacktestResultSummary[], baseline: BuyAndHoldBaseline | null = null) {
  render(<ResultsTable results={results} baseline={baseline} />);
  await expandSection('All Configurations');
  return getAllConfigsTable();
}

describe('ResultsTable', () => {
  describe('summary', () => {
    test('should_return_null_when_results_empty', () => {
      const { container } = render(<ResultsTable results={[]} baseline={null} />);
      expect(container.firstChild).toBeNull();
    });

    test('should_render_title_and_configuration_count', () => {
      render(<ResultsTable results={[createMockResult(), createMockResult({ smaPeriod: 30 })]} baseline={null} assetName="BTC" />);
      expect(screen.getByText('BTC Backtest Results')).toBeDefined();
      expect(screen.getByText('2 configurations tested')).toBeDefined();
      expect(screen.queryByText(/showing top/)).toBeNull();
    });

    test('should_compute_metrics_from_results_excluding_liquidated_from_profitable', () => {
      const results = [
        createMockResult({ totalReturn: 50, ...liquidated }),
        createMockResult({ totalReturn: 10 }),
        createMockResult({ totalReturn: -5 }),
        createMockResult({ totalReturn: 20 }),
      ];
      const { container } = render(<ResultsTable results={results} baseline={null} />);
      const metrics = Array.from(container.querySelectorAll('.text-2xl.font-bold')).map((el) => el.textContent);
      expect(metrics).toEqual(['4', '2', '1', '25.0%']);
      for (const label of ['Total Configs', 'Profitable', 'Liquidated', 'Liquidation Rate']) {
        expect(screen.getByText(label)).toBeDefined();
      }
    });

    test.each([
      { name: 'no', results: [createMockResult(), createMockResult()], rate: '0.0%' },
      { name: 'all', results: [createMockResult(liquidated), createMockResult(liquidated)], rate: '100.0%' },
    ])('should_show_$rate_liquidation_rate_when_$name_liquidated', ({ results, rate }) => {
      render(<ResultsTable results={results} baseline={null} />);
      expect(screen.getByText(rate)).toBeDefined();
    });

    test('should_use_stats_and_show_truncation_note_when_results_truncated', () => {
      const { container } = render(
        <ResultsTable results={[createMockResult()]} baseline={null} isTruncated stats={{ total: 5000, profitable: 1200, liquidated: 2500 }} />
      );
      const metrics = Array.from(container.querySelectorAll('.text-2xl.font-bold')).map((el) => el.textContent);
      expect(metrics).toEqual(['5000', '1200', '2500', '50.0%']);
      expect(screen.getByText('5000 configurations tested')).toBeDefined();
      expect(screen.getByText(/showing top 1000 results/)).toBeDefined();
    });

    test('should_render_baseline_card_only_when_baseline_provided', () => {
      const { rerender } = render(<ResultsTable results={[createMockResult()]} baseline={null} />);
      expect(screen.queryByText('Buy & Hold Baseline')).toBeNull();

      rerender(<ResultsTable results={[createMockResult()]} baseline={createMockBaseline({ purchasePrice: 150, finalValue: 1500 })} />);
      expect(screen.getByText('Buy & Hold Baseline')).toBeDefined();
      expect(screen.getByText('$150.00')).toBeDefined();
      expect(screen.getByText('$1,500.00')).toBeDefined();
    });
  });

  describe('optimal strategy selection', () => {
    test('should_feature_best_non_liquidated_result_ignoring_higher_liquidated_return', () => {
      const results = [
        createMockResult({ smaPeriod: 20, totalReturn: 10, finalBalance: 1100 }),
        createMockResult({ smaPeriod: 30, totalReturn: 90, finalBalance: 1900, ...liquidated }),
        createMockResult({ smaPeriod: 40, totalReturn: 30, finalBalance: 1300 }),
      ];
      render(<ResultsTable results={results} baseline={createMockBaseline()} />);
      const card = screen.getByText('Optimal Strategy').closest('[data-slot="card"]') as HTMLElement;
      expect(within(card).getByText('$1,300.00')).toBeDefined();
      expect(within(card).getByText('+30.00% gain')).toBeDefined();
    });

    test.each([
      { name: 'all_liquidated', results: [createMockResult(liquidated)], baseline: createMockBaseline() },
      { name: 'no_baseline', results: [createMockResult()], baseline: null },
    ])('should_not_render_optimal_strategy_when_$name', ({ results, baseline }) => {
      render(<ResultsTable results={results} baseline={baseline} />);
      expect(screen.queryByText('Optimal Strategy')).toBeNull();
    });
  });

  describe('SMA period comparison', () => {
    test('should_show_period_count_and_one_row_per_sma_period', async () => {
      const results = [
        createMockResult({ smaPeriod: 20, finalBalance: 1100 }),
        createMockResult({ smaPeriod: 20, finalBalance: 1200, config: { longLeverage: 2 } }),
        createMockResult({ smaPeriod: 30, finalBalance: 1300 }),
      ];
      const table = await renderSmaTable(results);
      expect(screen.getByText('(2 periods)')).toBeDefined();
      expect(getBodyRows(table)).toHaveLength(2);
      for (const header of ['SMA Period', 'Final Balance', '% Gain', '% vs Hold', 'Status']) {
        expect(within(table).getByText(header)).toBeDefined();
      }
    });

    test.each([
      { name: 'non_liquidated_beats_higher_liquidated', a: { finalBalance: 2000, ...liquidated }, b: { finalBalance: 1100 }, shown: '$1,100.00', hidden: '$2,000.00' },
      { name: 'higher_balance_wins_when_both_liquidated', a: { finalBalance: 800, ...liquidated }, b: { finalBalance: 900, ...liquidated }, shown: '$900.00', hidden: '$800.00' },
      { name: 'higher_balance_wins_when_both_non_liquidated', a: { finalBalance: 1300 }, b: { finalBalance: 1700 }, shown: '$1,700.00', hidden: '$1,300.00' },
    ])('should_keep_best_result_per_period_when_$name', async ({ a, b, shown, hidden }) => {
      const table = await renderSmaTable([
        createMockResult({ smaPeriod: 20, ...a }),
        createMockResult({ smaPeriod: 20, config: { longLeverage: 2 }, ...b }),
      ]);
      expect(within(table).getByText(shown)).toBeDefined();
      expect(within(table).queryByText(hidden)).toBeNull();
    });

    test('should_sort_by_final_balance_descending_with_liquidated_last_by_default', async () => {
      const table = await renderSmaTable([
        createMockResult({ smaPeriod: 20, finalBalance: 1100 }),
        createMockResult({ smaPeriod: 30, finalBalance: 1500, ...liquidated }),
        createMockResult({ smaPeriod: 40, finalBalance: 1300 }),
      ]);
      const rows = getBodyRows(table);
      expect(rows[0].textContent).toContain('$1,300.00');
      expect(rows[1].textContent).toContain('$1,100.00');
      expect(rows[2].textContent).toContain('LIQUIDATED');
    });

    test('should_toggle_sort_direction_when_header_clicked_twice', async () => {
      const user = userEvent.setup();
      const table = await renderSmaTable([
        createMockResult({ smaPeriod: 20, finalBalance: 1100 }),
        createMockResult({ smaPeriod: 30, finalBalance: 1500 }),
      ]);
      await user.click(within(table).getByText('Final Balance').closest('th')!);
      expect(getBodyRows(table)[0].textContent).toContain('$1,100.00');
      await user.click(within(table).getByText('Final Balance').closest('th')!);
      expect(getBodyRows(table)[0].textContent).toContain('$1,500.00');
    });

    test('should_sort_by_sma_period_and_percent_gain', async () => {
      const user = userEvent.setup();
      const table = await renderSmaTable([
        createMockResult({ smaPeriod: 40, totalReturn: 30 }),
        createMockResult({ smaPeriod: 20, totalReturn: 10 }),
        createMockResult({ smaPeriod: 30, totalReturn: 50 }),
      ]);
      await user.click(within(table).getByText('SMA Period').closest('th')!);
      expect(getBodyRows(table).map((r) => r.textContent?.match(/\d+ days/)?.[0])).toEqual(['40 days', '30 days', '20 days']);

      await user.click(within(table).getByText('% Gain').closest('th')!);
      expect(getBodyRows(table).map((r) => r.textContent?.match(/[+-][\d.]+%/)?.[0])).toEqual(['+50.00%', '+30.00%', '+10.00%']);
    });

    test('should_sort_by_vs_hold_when_baseline_provided', async () => {
      const user = userEvent.setup();
      const table = await renderSmaTable(
        [
          createMockResult({ smaPeriod: 20, finalBalance: 1300 }),
          createMockResult({ smaPeriod: 30, finalBalance: 1500 }),
          createMockResult({ smaPeriod: 40, finalBalance: 1400 }),
        ],
        createMockBaseline({ finalValue: 1200 })
      );
      await user.click(within(table).getByText('% vs Hold').closest('th')!);
      expect(getBodyRows(table).map((r) => r.textContent?.match(/\$[\d,.]+/)?.[0])).toEqual(['$1,500.00', '$1,400.00', '$1,300.00']);
    });

    test('should_put_liquidated_first_when_sorting_by_status', async () => {
      const user = userEvent.setup();
      const table = await renderSmaTable([
        createMockResult({ smaPeriod: 20 }),
        createMockResult({ smaPeriod: 30, ...liquidated }),
      ]);
      await user.click(within(table).getByText('Status').closest('th')!);
      expect(getBodyRows(table)[0].textContent).toContain('LIQUIDATED');
    });

    test('should_show_badge_and_date_for_liquidated_and_dash_for_active_with_no_baseline_vs_hold', async () => {
      const table = await renderSmaTable([
        createMockResult({ smaPeriod: 20 }),
        createMockResult({ smaPeriod: 30, ...liquidated }),
      ]);
      const [active, dead] = getBodyRows(table);
      expect(within(active).getAllByRole('cell')[3].textContent).toBe('-');
      expect(within(active).getAllByRole('cell')[4].textContent).toBe('-');
      expect(within(dead).getByText('LIQUIDATED')).toBeDefined();
      expect(within(dead).getByText('2024-06-10')).toBeDefined();
      expect(dead.className).toContain('bg-destructive/10');
    });

    test('should_paginate_at_25_rows_per_page', async () => {
      const user = userEvent.setup();
      const results = Array.from({ length: 75 }, (_, i) => createMockResult({ smaPeriod: 20 + i }));
      const table = await renderSmaTable(results);
      const card = screen.getByText('SMA Period Comparison').closest('[data-slot="card"]') as HTMLElement;

      expect(getBodyRows(table)).toHaveLength(25);
      expect(within(card).getByText('1-25 of 75')).toBeDefined();

      await user.click(within(card).getByLabelText('Next page'));
      expect(within(card).getByText('26-50 of 75')).toBeDefined();

      await user.click(within(card).getByLabelText('Previous page'));
      expect(within(card).getByText('1-25 of 75')).toBeDefined();
    });

    test('should_hide_pagination_when_25_or_fewer_periods', async () => {
      const results = Array.from({ length: 25 }, (_, i) => createMockResult({ smaPeriod: 20 + i }));
      await renderSmaTable(results);
      const card = screen.getByText('SMA Period Comparison').closest('[data-slot="card"]') as HTMLElement;
      expect(within(card).queryByLabelText('Next page')).toBeNull();
    });
  });

  describe('all configurations', () => {
    test('should_render_headers_and_row_fields', async () => {
      const table = await renderAllConfigs([
        createMockResult({
          smaPeriod: 25,
          totalTrades: 42,
          config: { longLeverage: 2, shortLeverage: 1.5, atr: { period: 14, multiplier: 3, closePercent: 50 } },
        }),
      ]);
      for (const header of ['SMA', 'Long Lev', 'Short Lev', 'ATR Config', 'Final Balance', 'Return', 'vs Hold', 'Trades', 'Status', 'Liquidation Date']) {
        expect(within(table).getByText(header)).toBeDefined();
      }
      const row = getBodyRows(table)[0];
      for (const text of ['25', '2x', '1.5x', '14/3/50%', '42', 'Active']) {
        expect(within(row).getByText(text)).toBeDefined();
      }
    });

    test('should_sort_by_return_descending_with_liquidated_last', async () => {
      const table = await renderAllConfigs([
        createMockResult({ totalReturn: 10 }),
        createMockResult({ totalReturn: 90, ...liquidated }),
        createMockResult({ totalReturn: 50 }),
        createMockResult({ totalReturn: 30 }),
      ]);
      const rows = getBodyRows(table);
      expect(rows.map((r) => r.textContent?.match(/[+-][\d.]+%/)?.[0])).toEqual(['+50.00%', '+30.00%', '+10.00%', '+90.00%']);
      expect(rows[3].textContent).toContain('LIQUIDATED');
    });

    test('should_show_liquidation_date_and_destructive_row_only_for_liquidated', async () => {
      const table = await renderAllConfigs([createMockResult(), createMockResult(liquidated)]);
      const [active, dead] = getBodyRows(table);
      expect(within(active).getByText('Active')).toBeDefined();
      expect(active.className).not.toContain('bg-destructive');
      expect(within(dead).getByText('LIQUIDATED')).toBeDefined();
      expect(within(dead).getByText('2024-06-10')).toBeDefined();
      expect(dead.className).toContain('bg-destructive/10');
    });

    test('should_show_vs_hold_only_when_baseline_provided', async () => {
      const results = [createMockResult({ finalBalance: 1500 })];
      const withBaseline = await renderAllConfigs(results, createMockBaseline({ finalValue: 1200 }));
      expect(within(getBodyRows(withBaseline)[0]).getByText('+25.00%')).toBeDefined();

      cleanup();
      const withoutBaseline = await renderAllConfigs(results);
      expect(within(getBodyRows(withoutBaseline)[0]).getAllByRole('cell')[6].textContent).toBe('-');
    });
  });
});
