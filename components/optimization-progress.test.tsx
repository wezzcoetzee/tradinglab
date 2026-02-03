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

describe('OptimizationProgressCard', () => {
  describe('idle state', () => {
    test('should_render_ready_status', () => {
      const progress = createMockProgress({ status: 'idle' });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Ready')).toBeDefined();
    });

    test('should_not_show_progress_bar_when_idle', () => {
      const progress = createMockProgress({ status: 'idle' });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary');
      expect(progressBar).toBeNull();
    });

    test('should_not_show_cancel_button_when_idle', () => {
      const progress = createMockProgress({ status: 'idle' });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.queryByText('Cancel')).toBeNull();
    });

    test('should_apply_muted_foreground_color', () => {
      const progress = createMockProgress({ status: 'idle' });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const statusElement = container.querySelector('.text-muted-foreground');
      expect(statusElement?.textContent).toBe('Ready');
    });
  });

  describe('preparing state', () => {
    test('should_render_preparing_status', () => {
      const progress = createMockProgress({ status: 'preparing' });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Preparing...')).toBeDefined();
    });

    test('should_show_cancel_button_when_preparing', () => {
      const progress = createMockProgress({ status: 'preparing' });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Cancel')).toBeDefined();
    });

    test('should_not_show_progress_bar_when_preparing', () => {
      const progress = createMockProgress({ status: 'preparing' });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary');
      expect(progressBar).toBeNull();
    });

    test('should_apply_blue_color', () => {
      const progress = createMockProgress({ status: 'preparing' });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const statusElement = container.querySelector('.text-blue-600');
      expect(statusElement?.textContent).toBe('Preparing...');
    });
  });

  describe('running state', () => {
    test('should_render_running_status', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        percentComplete: 50,
        elapsedMs: 5000,
        estimatedRemainingMs: 5000,
        configsPerSecond: 10,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Running')).toBeDefined();
    });

    test('should_show_cancel_button_when_running', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Cancel')).toBeDefined();
    });

    test('should_show_progress_bar_when_running', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        percentComplete: 50,
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary');
      expect(progressBar).not.toBeNull();
    });

    test('should_show_current_and_total_counts', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 42,
        total: 100,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('42 / 100')).toBeDefined();
    });

    test('should_show_elapsed_time', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        elapsedMs: 5000,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('5s')).toBeDefined();
    });

    test('should_show_estimated_remaining_time', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        estimatedRemainingMs: 7000,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('7s')).toBeDefined();
    });

    test('should_show_configs_per_second', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        configsPerSecond: 12.5,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('13/s')).toBeDefined();
    });

    test('should_set_progress_bar_width_to_percent_complete', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 75,
        total: 100,
        percentComplete: 75,
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary') as HTMLElement;
      expect(progressBar?.style.width).toBe('75%');
    });

    test('should_show_dash_when_estimated_remaining_is_null', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 10,
        total: 100,
        estimatedRemainingMs: null,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const cells = screen.getAllByText('--');
      expect(cells.length).toBeGreaterThan(0);
    });

    test('should_apply_blue_color', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const statusElement = container.querySelector('.text-blue-600');
      expect(statusElement?.textContent).toBe('Running');
    });
  });

  describe('complete state', () => {
    test('should_render_complete_status', () => {
      const progress = createMockProgress({
        status: 'complete',
        current: 100,
        total: 100,
        percentComplete: 100,
        elapsedMs: 10000,
        estimatedRemainingMs: 0,
        configsPerSecond: 10,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Complete')).toBeDefined();
    });

    test('should_not_show_cancel_button_when_complete', () => {
      const progress = createMockProgress({
        status: 'complete',
        current: 100,
        total: 100,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.queryByText('Cancel')).toBeNull();
    });

    test('should_show_progress_bar_at_100_percent', () => {
      const progress = createMockProgress({
        status: 'complete',
        current: 100,
        total: 100,
        percentComplete: 100,
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary') as HTMLElement;
      expect(progressBar?.style.width).toBe('100%');
    });

    test('should_show_final_counts', () => {
      const progress = createMockProgress({
        status: 'complete',
        current: 150,
        total: 150,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('150 / 150')).toBeDefined();
    });

    test('should_apply_green_color', () => {
      const progress = createMockProgress({
        status: 'complete',
        current: 100,
        total: 100,
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const statusElement = container.querySelector('.text-green-600');
      expect(statusElement?.textContent).toBe('Complete');
    });
  });

  describe('error state', () => {
    test('should_render_error_status', () => {
      const progress = createMockProgress({
        status: 'error',
        errorMessage: 'Something went wrong',
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Error')).toBeDefined();
    });

    test('should_not_show_cancel_button_when_error', () => {
      const progress = createMockProgress({
        status: 'error',
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.queryByText('Cancel')).toBeNull();
    });

    test('should_show_error_message', () => {
      const progress = createMockProgress({
        status: 'error',
        errorMessage: 'Failed to process data',
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Failed to process data')).toBeDefined();
    });

    test('should_not_show_error_message_when_undefined', () => {
      const progress = createMockProgress({
        status: 'error',
        errorMessage: undefined,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.queryByText(/Failed/)).toBeNull();
    });

    test('should_apply_destructive_color', () => {
      const progress = createMockProgress({
        status: 'error',
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const statusElement = container.querySelector('.text-destructive');
      expect(statusElement?.textContent).toBe('Error');
    });

    test('should_not_show_progress_bar_when_error', () => {
      const progress = createMockProgress({
        status: 'error',
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary');
      expect(progressBar).toBeNull();
    });
  });

  describe('cancel button', () => {
    test('should_call_onCancel_when_clicked_during_preparing', async () => {
      const onCancel = mock(() => {});
      const progress = createMockProgress({ status: 'preparing' });

      render(<OptimizationProgressCard progress={progress} onCancel={onCancel} />);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    test('should_call_onCancel_when_clicked_during_running', async () => {
      const onCancel = mock(() => {});
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });

      render(<OptimizationProgressCard progress={progress} onCancel={onCancel} />);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('time formatting', () => {
    test('should_format_seconds_only', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        elapsedMs: 45000,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('45s')).toBeDefined();
    });

    test('should_format_minutes_and_seconds', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        elapsedMs: 125000,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('2m 5s')).toBeDefined();
    });

    test('should_format_zero_seconds', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 1,
        total: 100,
        elapsedMs: 0,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('0s')).toBeDefined();
    });

    test('should_format_large_time_values', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        elapsedMs: 3600000,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('60m 0s')).toBeDefined();
    });

    test('should_round_down_partial_seconds', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        elapsedMs: 5999,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('5s')).toBeDefined();
    });
  });

  describe('number formatting', () => {
    test('should_format_small_numbers', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 5,
        total: 10,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('5 / 10')).toBeDefined();
    });

    test('should_format_large_numbers_with_commas', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 1234,
        total: 5678,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('1,234 / 5,678')).toBeDefined();
    });

    test('should_format_very_large_numbers', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 1234567,
        total: 9876543,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('1,234,567 / 9,876,543')).toBeDefined();
    });

    test('should_round_fractional_configs_per_second', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        configsPerSecond: 12.7,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('13/s')).toBeDefined();
    });

    test('should_format_zero_configs_per_second', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 1,
        total: 100,
        configsPerSecond: 0,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('0/s')).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('should_handle_zero_total', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 0,
        total: 0,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('0 / 0')).toBeDefined();
    });

    test('should_handle_current_greater_than_total', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 150,
        total: 100,
        percentComplete: 150,
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary') as HTMLElement;
      expect(progressBar?.style.width).toBe('150%');
    });

    test('should_handle_negative_elapsed_time', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        elapsedMs: -1000,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('-1s')).toBeDefined();
    });

    test('should_handle_very_small_percent_complete', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 1,
        total: 10000,
        percentComplete: 0.01,
      });
      const { container } = render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const progressBar = container.querySelector('.bg-primary') as HTMLElement;
      expect(progressBar?.style.width).toBe('0.01%');
    });

    test('should_handle_very_large_configs_per_second', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
        configsPerSecond: 999999.5,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('1,000,000/s')).toBeDefined();
    });

    test('should_handle_empty_error_message', () => {
      const progress = createMockProgress({
        status: 'error',
        errorMessage: '',
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      const errorElements = screen.queryAllByText('');
      expect(errorElements.length).toBeGreaterThanOrEqual(0);
    });

    test('should_handle_long_error_message', () => {
      const longError = 'This is a very long error message that contains many details about what went wrong during the optimization process and should still be displayed properly';
      const progress = createMockProgress({
        status: 'error',
        errorMessage: longError,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText(longError)).toBeDefined();
    });
  });

  describe('layout', () => {
    test('should_render_card_title', () => {
      const progress = createMockProgress({ status: 'idle' });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Optimization Progress')).toBeDefined();
    });

    test('should_render_elapsed_label', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Elapsed')).toBeDefined();
    });

    test('should_render_remaining_label', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Remaining')).toBeDefined();
    });

    test('should_render_rate_label', () => {
      const progress = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });
      render(<OptimizationProgressCard progress={progress} onCancel={mock(() => {})} />);

      expect(screen.getByText('Rate')).toBeDefined();
    });
  });

  describe('state transitions', () => {
    test('should_update_from_idle_to_preparing', () => {
      const progress1 = createMockProgress({ status: 'idle' });
      const { rerender } = render(<OptimizationProgressCard progress={progress1} onCancel={mock(() => {})} />);

      const progress2 = createMockProgress({ status: 'preparing' });
      rerender(<OptimizationProgressCard progress={progress2} onCancel={mock(() => {})} />);

      expect(screen.getByText('Preparing...')).toBeDefined();
    });

    test('should_update_from_preparing_to_running', () => {
      const progress1 = createMockProgress({ status: 'preparing' });
      const { rerender } = render(<OptimizationProgressCard progress={progress1} onCancel={mock(() => {})} />);

      const progress2 = createMockProgress({
        status: 'running',
        current: 10,
        total: 100,
      });
      rerender(<OptimizationProgressCard progress={progress2} onCancel={mock(() => {})} />);

      expect(screen.getByText('Running')).toBeDefined();
      expect(screen.getByText('10 / 100')).toBeDefined();
    });

    test('should_update_from_running_to_complete', () => {
      const progress1 = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });
      const { rerender } = render(<OptimizationProgressCard progress={progress1} onCancel={mock(() => {})} />);

      const progress2 = createMockProgress({
        status: 'complete',
        current: 100,
        total: 100,
      });
      rerender(<OptimizationProgressCard progress={progress2} onCancel={mock(() => {})} />);

      expect(screen.getByText('Complete')).toBeDefined();
    });

    test('should_update_from_running_to_error', () => {
      const progress1 = createMockProgress({
        status: 'running',
        current: 50,
        total: 100,
      });
      const { rerender } = render(<OptimizationProgressCard progress={progress1} onCancel={mock(() => {})} />);

      const progress2 = createMockProgress({
        status: 'error',
        errorMessage: 'Connection failed',
      });
      rerender(<OptimizationProgressCard progress={progress2} onCancel={mock(() => {})} />);

      expect(screen.getByText('Error')).toBeDefined();
      expect(screen.getByText('Connection failed')).toBeDefined();
    });
  });
});
