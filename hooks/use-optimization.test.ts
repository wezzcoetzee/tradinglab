import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useOptimization } from './use-optimization';
import type { CsvRow, StrategyConfig } from '@/lib/types';
import type { WorkerMessage } from '@/lib/backtest/optimization-types';

const mockCsvData: CsvRow[] = [
  { high: 102, low: 98, close: 100, date: '1/1/2024' },
  { high: 103, low: 99, close: 101, date: '2/1/2024' },
];

const mockStrategyConfig: StrategyConfig = {
  startingCapital: 1000,
  tradingFee: 0.1,
  atrEnabled: false,
  smaMin: 20,
  smaMax: 40,
};

class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  postMessage = mock(() => {});
  terminate = mock(() => {});

  simulateMessage(message: WorkerMessage) {
    this.onmessage?.(new MessageEvent('message', { data: message }));
  }

  simulateError(error: string) {
    this.onerror?.(new ErrorEvent('error', { message: error }));
  }
}

let mockWorkerInstance: MockWorker;

beforeEach(() => {
  mockWorkerInstance = new MockWorker();
  global.Worker = class {
    constructor() {
      return mockWorkerInstance;
    }
  } as unknown as typeof Worker;
});

function startedHook() {
  const hook = renderHook(() => useOptimization());
  act(() => {
    hook.result.current.startOptimization(mockCsvData, mockStrategyConfig);
  });
  return hook;
}

function progress(current: number, total: number, elapsedMs: number): WorkerMessage {
  return { type: 'progress', current, total, elapsedMs };
}

describe('useOptimization', () => {
  test('should_start_idle_with_no_results', () => {
    const { result } = renderHook(() => useOptimization());

    expect(result.current.progress.status).toBe('idle');
    expect(result.current.results).toBeNull();
    expect(result.current.baseline).toBeNull();
  });

  describe('startOptimization', () => {
    test('should_run_and_post_input_to_worker', () => {
      const { result } = startedHook();

      expect(result.current.progress.status).toBe('running');
      expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);
      const [input] = mockWorkerInstance.postMessage.mock.calls[0] as unknown as [unknown];
      expect(input).toEqual({ csvData: mockCsvData, strategyConfig: mockStrategyConfig });
    });

    test('should_terminate_previous_worker_and_reset_progress_on_restart', () => {
      const { result } = startedHook();
      act(() => mockWorkerInstance.simulateMessage(progress(50, 100, 5000)));

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
      expect(result.current.progress.current).toBe(0);
      expect(result.current.results).toBeNull();
    });
  });

  describe('progress messages', () => {
    test.each([
      { name: 'half_done', current: 50, total: 100, elapsedMs: 5000, percent: 50, rate: 10, remaining: 5000 },
      { name: 'zero_elapsed', current: 10, total: 100, elapsedMs: 0, percent: 10, rate: 0, remaining: null },
    ])('should_compute_progress_math_when_$name', ({ current, total, elapsedMs, percent, rate, remaining }) => {
      const { result } = startedHook();

      act(() => mockWorkerInstance.simulateMessage(progress(current, total, elapsedMs)));

      expect(result.current.progress).toMatchObject({
        status: 'running',
        current,
        total,
        elapsedMs,
        percentComplete: percent,
        configsPerSecond: rate,
        estimatedRemainingMs: remaining,
      });
    });
  });

  describe('complete message', () => {
    test('should_store_outcome_and_terminate_worker', () => {
      const { result } = startedHook();
      const terminatesBefore = mockWorkerInstance.terminate.mock.calls.length;
      const mockResults = Array.from({ length: 100 }, () => ({
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1100,
        totalReturn: 10,
        totalFees: 10,
        totalTrades: 5,
        isLiquidated: false,
      }));
      const mockBaseline = {
        purchasePrice: 100,
        purchaseDate: '2024-06-09',
        finalPrice: 120,
        finalDate: '2024-12-31',
        finalValue: 1200,
        percentGain: 20,
        startingCapital: 1000,
      };
      const stats = { total: 100, profitable: 40, liquidated: 2 };

      act(() =>
        mockWorkerInstance.simulateMessage({
          type: 'complete',
          results: mockResults,
          stats,
          bestResultWithDays: mockResults[0],
          totalTimeMs: 10000,
          baseline: mockBaseline,
          isTruncated: false,
        })
      );

      expect(result.current.progress.status).toBe('complete');
      expect(result.current.progress.percentComplete).toBe(100);
      expect(result.current.progress.configsPerSecond).toBe(10);
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.baseline).toEqual(mockBaseline);
      expect(result.current.stats).toEqual(stats);
      expect(result.current.bestResultWithDays).toEqual(mockResults[0]);
      expect(mockWorkerInstance.terminate.mock.calls.length).toBeGreaterThan(terminatesBefore);
    });
  });

  describe('errors', () => {
    test('should_set_error_message_keep_progress_and_terminate_on_error_message', () => {
      const { result } = startedHook();
      act(() => mockWorkerInstance.simulateMessage(progress(50, 100, 5000)));
      const terminatesBefore = mockWorkerInstance.terminate.mock.calls.length;

      act(() => mockWorkerInstance.simulateMessage({ type: 'error', error: 'Test error message' }));

      expect(result.current.progress.status).toBe('error');
      expect(result.current.progress.errorMessage).toBe('Test error message');
      expect(result.current.progress.current).toBe(50);
      expect(mockWorkerInstance.terminate.mock.calls.length).toBeGreaterThan(terminatesBefore);
    });

    test.each([
      { message: 'Worker crashed', expected: 'Worker crashed' },
      { message: '', expected: 'Worker error occurred' },
    ])('should_report_"$expected"_on_worker_onerror', ({ message, expected }) => {
      const { result } = startedHook();

      act(() => mockWorkerInstance.simulateError(message));

      expect(result.current.progress.status).toBe('error');
      expect(result.current.progress.errorMessage).toBe(expected);
    });
  });

  describe('cancelOptimization', () => {
    test('should_terminate_worker_go_idle_and_keep_progress_data', () => {
      const { result } = startedHook();
      act(() => mockWorkerInstance.simulateMessage(progress(75, 100, 7500)));

      act(() => {
        result.current.cancelOptimization();
      });

      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
      expect(result.current.progress.status).toBe('idle');
      expect(result.current.progress.current).toBe(75);
      expect(result.current.progress.total).toBe(100);
    });

    test('should_not_throw_when_no_worker_exists', () => {
      const { result } = renderHook(() => useOptimization());

      expect(() => act(() => result.current.cancelOptimization())).not.toThrow();
    });
  });

  test('should_terminate_worker_on_unmount', () => {
    const { unmount } = startedHook();

    unmount();

    expect(mockWorkerInstance.terminate).toHaveBeenCalled();
  });
});
