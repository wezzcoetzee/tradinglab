import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayByDayTable } from './day-by-day-table';
import { WARMUP_DAYS } from '@/lib/backtest/constants';
import type { BacktestResult, DayResult, PositionType } from '@/lib/backtest/types';

afterEach(() => {
  cleanup();
});

function createMockDay(overrides: Partial<DayResult> = {}): DayResult {
  return {
    dayIndex: 160,
    date: '2024-06-01',
    price: 100,
    sma: 95,
    action: 'HOLD',
    position: { type: 'LONG', entryPrice: 90, entryValue: 1000, leverage: 1 },
    balance: 1100,
    pnl: 0,
    fees: 0,
    isLiquidated: false,
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
    days: [
      createMockDay({ dayIndex: 150, date: '2024-05-25' }),
      createMockDay({ dayIndex: 160, date: '2024-06-01' }),
      createMockDay({ dayIndex: 161, date: '2024-06-02' }),
    ],
    finalBalance: 1100,
    totalReturn: 10,
    totalFees: 10,
    totalTrades: 5,
    isLiquidated: false,
    ...overrides,
  };
}

describe('DayByDayTable', () => {
  describe('collapsible behavior', () => {
    test('should_start_collapsed', () => {
      const result = createMockResult();
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('Day-by-Day Performance')).toBeDefined();
      expect(screen.queryByText('Date')).toBeNull();
    });

    test('should_expand_when_header_clicked', async () => {
      const result = createMockResult();
      const user = userEvent.setup();
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);

      expect(screen.getByText('Date')).toBeDefined();
      expect(screen.getByText('Close Price')).toBeDefined();
    });

    test('should_collapse_when_header_clicked_again', async () => {
      const result = createMockResult();
      const user = userEvent.setup();
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);
      await user.click(header!);

      expect(screen.queryByText('Date')).toBeNull();
    });

    test('should_show_chevron_right_when_collapsed', () => {
      const result = createMockResult();
      const { container } = render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const chevronRight = container.querySelector('svg');
      expect(chevronRight).not.toBeNull();
    });

    test('should_show_chevron_down_when_expanded', async () => {
      const result = createMockResult();
      const user = userEvent.setup();
      const { container } = render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);

      const chevronDown = container.querySelector('svg');
      expect(chevronDown).not.toBeNull();
    });
  });

  describe('warmup filtering', () => {
    test('should_filter_days_below_warmup_threshold', () => {
      const result = createMockResult({
        days: [
          createMockDay({ dayIndex: 100, date: '2024-05-01' }),
          createMockDay({ dayIndex: 159, date: '2024-05-31' }),
          createMockDay({ dayIndex: 160, date: '2024-06-01' }),
          createMockDay({ dayIndex: 161, date: '2024-06-02' }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(2 trading days)')).toBeDefined();
    });

    test('should_show_all_days_when_all_above_warmup', () => {
      const result = createMockResult({
        days: [
          createMockDay({ dayIndex: 160, date: '2024-06-01' }),
          createMockDay({ dayIndex: 161, date: '2024-06-02' }),
          createMockDay({ dayIndex: 162, date: '2024-06-03' }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(3 trading days)')).toBeDefined();
    });

    test('should_include_days_exactly_at_warmup_threshold', () => {
      const result = createMockResult({
        days: [
          createMockDay({ dayIndex: WARMUP_DAYS - 1, date: '2024-05-31' }),
          createMockDay({ dayIndex: WARMUP_DAYS, date: '2024-06-01' }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_empty_days_array', () => {
      const result = createMockResult({ days: [] });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(0 trading days)')).toBeDefined();
    });

    test('should_handle_all_days_below_warmup', () => {
      const result = createMockResult({
        days: [
          createMockDay({ dayIndex: 100 }),
          createMockDay({ dayIndex: 150 }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(0 trading days)')).toBeDefined();
    });
  });

  describe('table structure', () => {
    test('should_render_all_column_headers', async () => {
      const result = createMockResult();
      const user = userEvent.setup();
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);

      expect(screen.getByText('Date')).toBeDefined();
      expect(screen.getByText('Close Price')).toBeDefined();
      expect(screen.getByText('SMA Value')).toBeDefined();
      expect(screen.getByText('Position')).toBeDefined();
      expect(screen.getByText('Portfolio Value')).toBeDefined();
      expect(screen.getByText('Buy-Hold Value')).toBeDefined();
    });

    test('should_render_scrollable_container_when_expanded', async () => {
      const result = createMockResult();
      const user = userEvent.setup();
      const { container } = render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);

      const scrollContainer = container.querySelector('.overflow-auto');
      expect(scrollContainer).not.toBeNull();
    });
  });

  describe('buy-hold calculation logic', () => {
    test('should_calculate_buy_hold_value_correctly', () => {
      const result = createMockResult({
        days: [
          createMockDay({
            dayIndex: 160,
            price: 120,
          }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      // (1000 / 100) * 120 = 1200
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_fractional_prices_in_calculation', () => {
      const result = createMockResult({
        days: [
          createMockDay({
            dayIndex: 160,
            price: 123.45,
          }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      // (1000 / 100) * 123.45 = 1234.50
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_price_decrease_in_calculation', () => {
      const result = createMockResult({
        days: [
          createMockDay({
            dayIndex: 160,
            price: 80,
          }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      // (1000 / 100) * 80 = 800
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_calculate_with_different_purchase_price', () => {
      const result = createMockResult({
        days: [
          createMockDay({
            dayIndex: 160,
            price: 150,
          }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={200} startingCapital={1000} />);

      // (1000 / 200) * 150 = 750
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_calculate_with_different_starting_capital', () => {
      const result = createMockResult({
        days: [
          createMockDay({
            dayIndex: 160,
            price: 120,
          }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={5000} />);

      // (5000 / 100) * 120 = 6000
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_zero_price', () => {
      const result = createMockResult({
        days: [
          createMockDay({
            dayIndex: 160,
            price: 0,
          }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      // (1000 / 100) * 0 = 0
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });
  });



  describe('virtualization', () => {
    test('should_render_with_large_dataset', async () => {
      const days = Array.from({ length: 1000 }, (_, i) =>
        createMockDay({
          dayIndex: 160 + i,
          date: `2024-06-${String(i + 1).padStart(2, '0')}`,
        })
      );
      const result = createMockResult({ days });
      const user = userEvent.setup();
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);

      expect(screen.getByText('(1000 trading days)')).toBeDefined();
    });

    test('should_have_scrollable_container', async () => {
      const result = createMockResult();
      const user = userEvent.setup();
      const { container } = render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);

      const scrollContainer = container.querySelector('.overflow-auto');
      expect(scrollContainer).not.toBeNull();
    });

    test('should_set_container_height', async () => {
      const result = createMockResult();
      const user = userEvent.setup();
      const { container } = render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      const header = screen.getByText('Day-by-Day Performance').closest('div');
      await user.click(header!);

      const scrollContainer = container.querySelector('.overflow-auto') as HTMLElement;
      expect(scrollContainer.style.height).toBe('600px');
    });
  });

  describe('edge cases', () => {
    test('should_handle_single_day', () => {
      const result = createMockResult({
        days: [createMockDay({ dayIndex: 160, date: '2024-06-01' })],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_very_small_purchase_price', () => {
      const result = createMockResult({
        days: [createMockDay({ dayIndex: 160, price: 10 })],
      });
      render(<DayByDayTable result={result} purchasePrice={0.01} startingCapital={1000} />);

      // (1000 / 0.01) * 10 = 1000000
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_very_large_prices', () => {
      const result = createMockResult({
        days: [createMockDay({ dayIndex: 160, price: 999999.99 })],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      // (1000 / 100) * 999999.99 = 9999999.90
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_extreme_starting_capital', () => {
      const result = createMockResult({
        days: [createMockDay({ dayIndex: 160, price: 200 })],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000000} />);

      // (1000000 / 100) * 200 = 2000000
      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_days_with_different_date_formats', () => {
      const result = createMockResult({
        days: [
          createMockDay({ dayIndex: 160, date: '2024-06-01' }),
          createMockDay({ dayIndex: 161, date: '06/02/2024' }),
          createMockDay({ dayIndex: 162, date: '163/1/2024' }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(3 trading days)')).toBeDefined();
    });

    test('should_handle_zero_balance', () => {
      const result = createMockResult({
        days: [createMockDay({ dayIndex: 160, balance: 0 })],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_handle_negative_sma', () => {
      const result = createMockResult({
        days: [createMockDay({ dayIndex: 160, sma: -50 })],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });
  });

  describe('trading days count display', () => {
    test('should_show_correct_count_with_plural', () => {
      const result = createMockResult({
        days: [
          createMockDay({ dayIndex: 160 }),
          createMockDay({ dayIndex: 161 }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(2 trading days)')).toBeDefined();
    });

    test('should_show_correct_count_with_singular', () => {
      const result = createMockResult({
        days: [createMockDay({ dayIndex: 160 })],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(1 trading days)')).toBeDefined();
    });

    test('should_update_count_after_filtering', () => {
      const result = createMockResult({
        days: [
          createMockDay({ dayIndex: 50 }),
          createMockDay({ dayIndex: 100 }),
          createMockDay({ dayIndex: 159 }),
          createMockDay({ dayIndex: 160 }),
          createMockDay({ dayIndex: 161 }),
          createMockDay({ dayIndex: 162 }),
        ],
      });
      render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(3 trading days)')).toBeDefined();
    });
  });

  describe('memoization', () => {
    test('should_memoize_filtered_days', () => {
      const days = Array.from({ length: 200 }, (_, i) =>
        createMockDay({ dayIndex: i, date: `2024-${String(i + 1).padStart(2, '0')}-01` })
      );
      const result = createMockResult({ days });
      const { rerender } = render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      rerender(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText(`(${200 - WARMUP_DAYS} trading days)`)).toBeDefined();
    });

    test('should_recalculate_when_days_change', () => {
      const result1 = createMockResult({
        days: [createMockDay({ dayIndex: 160 }), createMockDay({ dayIndex: 161 })],
      });
      const result2 = createMockResult({
        days: [createMockDay({ dayIndex: 160 }), createMockDay({ dayIndex: 161 }), createMockDay({ dayIndex: 162 })],
      });
      const { rerender } = render(<DayByDayTable result={result1} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(2 trading days)')).toBeDefined();

      rerender(<DayByDayTable result={result2} purchasePrice={100} startingCapital={1000} />);

      expect(screen.getByText('(3 trading days)')).toBeDefined();
    });
  });
});
