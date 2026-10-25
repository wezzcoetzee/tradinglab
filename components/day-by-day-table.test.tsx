import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayByDayTable } from './day-by-day-table';
import type { BacktestResult, DayResult } from '@/lib/backtest/types';

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

async function expand() {
  const user = userEvent.setup();
  await user.click(screen.getByText('Day-by-Day Performance').closest('div')!);
}

function renderTable(result = createMockResult()) {
  return render(<DayByDayTable result={result} purchasePrice={100} startingCapital={1000} />);
}

describe('DayByDayTable', () => {
  test('should_start_collapsed_with_trading_days_count', () => {
    renderTable();
    expect(screen.getByText('Day-by-Day Performance')).toBeDefined();
    expect(screen.getByText('(3 trading days)')).toBeDefined();
    expect(screen.queryByText('Date')).toBeNull();
  });

  test('should_toggle_table_when_header_clicked', async () => {
    renderTable();

    await expand();
    expect(screen.getByText('Date')).toBeDefined();

    await expand();
    expect(screen.queryByText('Date')).toBeNull();
  });

  test('should_render_all_column_headers_and_fixed_height_scroll_container_when_expanded', async () => {
    const { container } = renderTable();
    await expand();

    for (const label of ['Date', 'Close Price', 'SMA Value', 'Position', 'Portfolio Value', 'Buy-Hold Value']) {
      expect(screen.getByText(label)).toBeDefined();
    }
    const scrollContainer = container.querySelector('.overflow-y-auto') as HTMLElement;
    expect(scrollContainer.style.height).toBe('600px');
  });

  test('should_render_large_dataset_when_expanded', async () => {
    const days = Array.from({ length: 1000 }, (_, i) => createMockDay({ dayIndex: 160 + i }));
    renderTable(createMockResult({ days }));
    await expand();

    expect(screen.getByText('(1000 trading days)')).toBeDefined();
  });

  test('should_update_count_when_days_change', () => {
    const { rerender } = renderTable(createMockResult({ days: [createMockDay(), createMockDay()] }));
    expect(screen.getByText('(2 trading days)')).toBeDefined();

    rerender(
      <DayByDayTable
        result={createMockResult({ days: [createMockDay(), createMockDay(), createMockDay()] })}
        purchasePrice={100}
        startingCapital={1000}
      />
    );
    expect(screen.getByText('(3 trading days)')).toBeDefined();
  });
});
