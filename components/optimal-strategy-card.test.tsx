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
    totalReturn: 10,
    totalFees: 10,
    totalTrades: 5,
    isLiquidated: false,
    ...overrides,
  };
}

describe('OptimalStrategyCard', () => {
  test('should_render_title_balance_badges_and_all_parameters', () => {
    const result = createMockResult({
      finalBalance: 1300,
      totalReturn: 10,
      totalTrades: 42,
      config: {
        smaPeriod: 25,
        longLeverage: 2.5,
        shortLeverage: 1.75,
        startingCapital: 1000,
        feeRate: 0.1,
        atr: { period: 14, multiplier: 3, closePercent: 50 },
      },
    });
    render(<OptimalStrategyCard result={result} baseline={createMockBaseline({ finalValue: 1200 })} />);

    expect(screen.getByText('Optimal Strategy')).toBeDefined();
    expect(screen.getByText('$1,300.00')).toBeDefined();
    expect(screen.getByText('+10.00% gain')).toBeDefined();
    expect(screen.getByText('+8.33% vs hold')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();
    expect(screen.getByText('2.5x')).toBeDefined();
    expect(screen.getByText('1.75x')).toBeDefined();
    expect(screen.getByText('14/3/50%')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });

  test('should_show_none_when_no_atr_config', () => {
    render(<OptimalStrategyCard result={createMockResult()} baseline={createMockBaseline()} />);
    expect(screen.getByText('None')).toBeDefined();
  });

  test.each([
    { totalReturn: 15.5, expected: '+15.50% gain', colorClass: '.text-\\[var\\(--profit-green\\)\\]' },
    { totalReturn: -12.34, expected: '-12.34% gain', colorClass: '.text-destructive' },
  ])('should_color_gain_badge_for_return_$totalReturn', ({ totalReturn, expected, colorClass }) => {
    const { container } = render(
      <OptimalStrategyCard result={createMockResult({ totalReturn })} baseline={createMockBaseline()} />
    );
    expect(container.querySelector(colorClass)?.textContent).toContain(expected);
  });

  test.each([
    { finalBalance: 1400, expected: '+16.67% vs hold', colorClass: '.text-\\[var\\(--profit-green\\)\\]' },
    { finalBalance: 1000, expected: '-16.67% vs hold', colorClass: '.text-destructive' },
    { finalBalance: 1230, expected: '+2.50% vs hold', colorClass: '.text-muted-foreground' },
  ])('should_color_vs_hold_badge_for_balance_$finalBalance', ({ finalBalance, expected, colorClass }) => {
    const { container } = render(
      <OptimalStrategyCard result={createMockResult({ finalBalance })} baseline={createMockBaseline({ finalValue: 1200 })} />
    );
    const badge = Array.from(container.querySelectorAll(colorClass)).find((el) => el.textContent?.includes('vs hold'));
    expect(badge?.textContent).toContain(expected);
  });

  test.each([
    { finalBalance: 1260, expected: '+5.00% vs hold' },
    { finalBalance: 1140, expected: '-5.00% vs hold' },
  ])('should_use_muted_color_at_exactly_5_percent_boundary_$expected', ({ finalBalance, expected }) => {
    const { container } = render(
      <OptimalStrategyCard result={createMockResult({ finalBalance })} baseline={createMockBaseline({ finalValue: 1200 })} />
    );
    const badge = Array.from(container.querySelectorAll('.text-muted-foreground')).find((el) => el.textContent?.includes('vs hold'));
    expect(badge?.textContent).toContain(expected);
  });
});
