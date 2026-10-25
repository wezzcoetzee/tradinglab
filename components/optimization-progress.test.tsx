import { describe, expect, test, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptimizationProgressCard } from './optimization-progress';
import type { OptimizationProgress } from '@/lib/backtest/optimization-types';

afterEach(() => {
  cleanup();
});

function createMockProgress(overrides: Partial<OptimizationProgress> = {}): OptimizationProgress {
  return {
    status: 'idle',
    current: 0,
    total: 0,
    percentComplete: 0,
    elapsedMs: 0,
    estimatedRemainingMs: null,
    configsPerSecond: 0,
    ...overrides,
  };
}

function renderCard(overrides: Partial<OptimizationProgress> = {}, onCancel = mock(() => {})) {
  return render(<OptimizationProgressCard progress={createMockProgress(overrides)} onCancel={onCancel} />);
}

describe('OptimizationProgressCard', () => {
  test.each([
    { status: 'idle', text: 'Ready', colorClass: 'text-muted-foreground', cancel: false, progress: false },
    { status: 'running', text: 'Running', colorClass: 'text-primary', cancel: true, progress: true },
    { status: 'complete', text: 'Complete', colorClass: 'text-\\[var\\(--profit-green\\)\\]', cancel: false, progress: true },
    { status: 'error', text: 'Error', colorClass: 'text-destructive', cancel: false, progress: false },
  ] as const)('should_render_$status_status_with_matching_controls', ({ status, text, colorClass, cancel, progress }) => {
    const { container } = renderCard({ status, current: 5, total: 10 });

    expect(container.querySelector(`.${colorClass}`)?.textContent).toBe(text);
    expect(screen.queryByText('Cancel') !== null).toBe(cancel);
    expect(container.querySelector('.bg-primary') !== null).toBe(progress);
    expect(screen.queryByText('Elapsed') !== null).toBe(progress);
  });

  test('should_show_counts_bar_width_and_stats_when_running', () => {
    const { container } = renderCard({
      status: 'running',
      current: 1234,
      total: 5678,
      percentComplete: 75,
      elapsedMs: 125000,
      estimatedRemainingMs: 7000,
      configsPerSecond: 12.7,
    });

    expect(screen.getByText('1,234 / 5,678')).toBeDefined();
    expect((container.querySelector('.bg-primary') as HTMLElement).style.width).toBe('75%');
    expect(screen.getByText('2m 5s')).toBeDefined();
    expect(screen.getByText('7s')).toBeDefined();
    expect(screen.getByText('13/s')).toBeDefined();
  });

  test('should_show_dash_when_estimated_remaining_is_null', () => {
    renderCard({ status: 'running', current: 10, total: 100, estimatedRemainingMs: null });

    expect(screen.getByText('--')).toBeDefined();
  });

  test('should_show_full_bar_when_complete', () => {
    const { container } = renderCard({ status: 'complete', current: 150, total: 150, percentComplete: 100 });

    expect(screen.getByText('150 / 150')).toBeDefined();
    expect((container.querySelector('.bg-primary') as HTMLElement).style.width).toBe('100%');
  });

  test('should_call_onCancel_when_cancel_clicked', async () => {
    const onCancel = mock(() => {});
    renderCard({ status: 'running', current: 50, total: 100 }, onCancel);

    await userEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('should_show_error_message_only_when_provided', () => {
    renderCard({ status: 'error', errorMessage: 'Failed to process data' });
    expect(screen.getByText('Failed to process data')).toBeDefined();
    cleanup();

    const { container } = renderCard({ status: 'error', errorMessage: undefined });
    expect(container.querySelector('.text-sm.text-destructive')).toBeNull();
  });
});
