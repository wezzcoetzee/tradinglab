import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimization } from './use-optimization';
import type { CsvRow, StrategyConfig } from '@/lib/types';
import type { WorkerMessage } from '@/lib/backtest/optimization-types';

const mockCsvData: CsvRow[] = [
  { time: 1, high: 102, low: 98, close: 100, RSI: 50, date: '1/1/2024' },
  { time: 2, high: 103, low: 99, close: 101, RSI: 51, date: '2/1/2024' },
];

const mockStrategyConfig: StrategyConfig = {
  startingCapital: 1000,
  tradingFee: 0.1,
  atrEnabled: false,
};

class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  postMessage = mock(() => {});
  terminate = mock(() => {});

  simulateMessage(message: WorkerMessage) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: message }));
    }
  }

  simulateError(error: string) {
    if (this.onerror) {
      this.onerror(new ErrorEvent('error', { message: error }));
    }
  }
}

let mockWorkerInstance: MockWorker;
const originalWorker = global.Worker;

beforeEach(() => {
  mockWorkerInstance = new MockWorker();
  global.Worker = class {
    constructor() {
      return mockWorkerInstance;
    }
  } as unknown as typeof Worker;
});

describe('useOptimization', () => {
  describe('initial state', () => {
    test('should_initialize_with_idle_status', () => {
      const { result } = renderHook(() => useOptimization());

      expect(result.current.progress.status).toBe('idle');
      expect(result.current.progress.current).toBe(0);
      expect(result.current.progress.total).toBe(0);
      expect(result.current.progress.percentComplete).toBe(0);
      expect(result.current.progress.elapsedMs).toBe(0);
      expect(result.current.progress.estimatedRemainingMs).toBeNull();
      expect(result.current.progress.configsPerSecond).toBe(0);
      expect(result.current.results).toBeNull();
      expect(result.current.baseline).toBeNull();
    });

    test('should_provide_startOptimization_function', () => {
      const { result } = renderHook(() => useOptimization());

      expect(typeof result.current.startOptimization).toBe('function');
    });

    test('should_provide_cancelOptimization_function', () => {
      const { result } = renderHook(() => useOptimization());

      expect(typeof result.current.cancelOptimization).toBe('function');
    });
  });

  describe('startOptimization', () => {
    test('should_transition_to_preparing_status', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      expect(result.current.progress.status).toBe('running');
    });

    test('should_reset_results_and_baseline', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      expect(result.current.results).toBeNull();
      expect(result.current.baseline).toBeNull();
    });

    test('should_create_worker_instance', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);
    });

    test('should_post_message_with_worker_input', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      const call = mockWorkerInstance.postMessage.mock.calls[0];
      const input = call[0];

      expect(input.csvData).toEqual(mockCsvData);
      expect(input.startingCapital).toBe(1000);
      expect(input.allSMAs).toBeDefined();
      expect(input.configs).toBeDefined();
    });

    test('should_include_atr_when_enabled', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, {
          ...mockStrategyConfig,
          atrEnabled: true,
        });
      });

      const call = mockWorkerInstance.postMessage.mock.calls[0];
      const input = call[0];

      expect(input.allATRs).not.toBeNull();
    });

    test('should_exclude_atr_when_disabled', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, {
          ...mockStrategyConfig,
          atrEnabled: false,
        });
      });

      const call = mockWorkerInstance.postMessage.mock.calls[0];
      const input = call[0];

      expect(input.allATRs).toBeNull();
    });

    test('should_terminate_existing_worker_before_starting_new', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
    });
  });

  describe('progress message handling', () => {
    test('should_update_progress_from_worker_message', async () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 50,
          total: 100,
          elapsedMs: 5000,
        });
      });

      expect(result.current.progress.status).toBe('running');
      expect(result.current.progress.current).toBe(50);
      expect(result.current.progress.total).toBe(100);
      expect(result.current.progress.percentComplete).toBe(50);
      expect(result.current.progress.elapsedMs).toBe(5000);
    });

    test('should_calculate_configs_per_second', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 100,
          total: 200,
          elapsedMs: 10000,
        });
      });

      expect(result.current.progress.configsPerSecond).toBe(10);
    });

    test('should_calculate_estimated_remaining_ms', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 50,
          total: 100,
          elapsedMs: 5000,
        });
      });

      expect(result.current.progress.estimatedRemainingMs).toBe(5000);
    });

    test('should_handle_zero_elapsed_time', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 10,
          total: 100,
          elapsedMs: 0,
        });
      });

      expect(result.current.progress.configsPerSecond).toBe(0);
      expect(result.current.progress.estimatedRemainingMs).toBeNull();
    });

    test('should_handle_complete_progress', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 100,
          total: 100,
          elapsedMs: 10000,
        });
      });

      expect(result.current.progress.percentComplete).toBe(100);
    });
  });

  describe('complete message handling', () => {
    test('should_transition_to_complete_status', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'complete',
          results: [],
          totalTimeMs: 10000,
          baseline: null,
        });
      });

      expect(result.current.progress.status).toBe('complete');
    });

    test('should_set_results_and_baseline', () => {
      const { result } = renderHook(() => useOptimization());

      const mockResults = [
        {
          config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
          days: [],
          finalBalance: 1100,
          totalReturn: 10,
          totalFees: 10,
          totalTrades: 5,
          isLiquidated: false,
        },
      ];

      const mockBaseline = {
        purchasePrice: 100,
        purchaseDate: '2024-06-09',
        finalPrice: 120,
        finalDate: '2024-12-31',
        finalValue: 1200,
        percentGain: 20,
        startingCapital: 1000,
      };

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'complete',
          results: mockResults,
          totalTimeMs: 10000,
          baseline: mockBaseline,
        });
      });

      expect(result.current.results).toEqual(mockResults);
      expect(result.current.baseline).toEqual(mockBaseline);
    });

    test('should_set_progress_to_100_percent', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'complete',
          results: [],
          totalTimeMs: 10000,
          baseline: null,
        });
      });

      expect(result.current.progress.percentComplete).toBe(100);
    });

    test('should_calculate_final_configs_per_second', () => {
      const { result } = renderHook(() => useOptimization());

      const mockResults = Array.from({ length: 100 }, () => ({
        config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
        days: [],
        finalBalance: 1100,
        totalReturn: 10,
        totalFees: 10,
        totalTrades: 5,
        isLiquidated: false,
      }));

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'complete',
          results: mockResults,
          totalTimeMs: 10000,
          baseline: null,
        });
      });

      expect(result.current.progress.configsPerSecond).toBe(10);
    });

    test('should_terminate_worker_on_complete', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      const callCountBefore = mockWorkerInstance.terminate.mock.calls.length;

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'complete',
          results: [],
          totalTimeMs: 10000,
          baseline: null,
        });
      });

      expect(mockWorkerInstance.terminate.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });

  describe('error message handling', () => {
    test('should_transition_to_error_status', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'error',
          error: 'Test error',
        });
      });

      expect(result.current.progress.status).toBe('error');
    });

    test('should_set_error_message', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'error',
          error: 'Test error message',
        });
      });

      expect(result.current.progress.errorMessage).toBe('Test error message');
    });

    test('should_terminate_worker_on_error', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      const callCountBefore = mockWorkerInstance.terminate.mock.calls.length;

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'error',
          error: 'Test error',
        });
      });

      expect(mockWorkerInstance.terminate.mock.calls.length).toBeGreaterThan(callCountBefore);
    });

    test('should_preserve_progress_data_on_error', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 50,
          total: 100,
          elapsedMs: 5000,
        });
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'error',
          error: 'Test error',
        });
      });

      expect(result.current.progress.current).toBe(50);
      expect(result.current.progress.total).toBe(100);
    });
  });

  describe('worker onerror handling', () => {
    test('should_handle_worker_error_event', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateError('Worker crashed');
      });

      expect(result.current.progress.status).toBe('error');
      expect(result.current.progress.errorMessage).toBe('Worker crashed');
    });

    test('should_use_default_error_message_when_none_provided', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateError('');
      });

      expect(result.current.progress.errorMessage).toBe('Worker error occurred');
    });
  });

  describe('cancelOptimization', () => {
    test('should_terminate_worker', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      const callCountBefore = mockWorkerInstance.terminate.mock.calls.length;

      act(() => {
        result.current.cancelOptimization();
      });

      expect(mockWorkerInstance.terminate.mock.calls.length).toBeGreaterThan(callCountBefore);
    });

    test('should_reset_status_to_idle', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 50,
          total: 100,
          elapsedMs: 5000,
        });
      });

      act(() => {
        result.current.cancelOptimization();
      });

      expect(result.current.progress.status).toBe('idle');
    });

    test('should_preserve_progress_data_on_cancel', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 75,
          total: 100,
          elapsedMs: 7500,
        });
      });

      act(() => {
        result.current.cancelOptimization();
      });

      expect(result.current.progress.current).toBe(75);
      expect(result.current.progress.total).toBe(100);
    });

    test('should_not_throw_when_no_worker_exists', () => {
      const { result } = renderHook(() => useOptimization());

      expect(() => {
        act(() => {
          result.current.cancelOptimization();
        });
      }).not.toThrow();
    });
  });

  describe('cleanup', () => {
    test('should_terminate_worker_on_unmount', () => {
      const { result, unmount } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      unmount();

      expect(mockWorkerInstance.terminate).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should_handle_multiple_progress_updates', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 25,
          total: 100,
          elapsedMs: 2500,
        });
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 50,
          total: 100,
          elapsedMs: 5000,
        });
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 75,
          total: 100,
          elapsedMs: 7500,
        });
      });

      expect(result.current.progress.current).toBe(75);
      expect(result.current.progress.percentComplete).toBe(75);
    });

    test('should_handle_empty_csv_data', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization([], mockStrategyConfig);
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalled();
    });

    test('should_handle_zero_total_time_on_complete', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'complete',
          results: [
            {
              config: { smaPeriod: 20, longLeverage: 1, shortLeverage: 1, startingCapital: 1000, feeRate: 0.1 },
              days: [],
              finalBalance: 1100,
              totalReturn: 10,
              totalFees: 10,
              totalTrades: 5,
              isLiquidated: false,
            },
          ],
          totalTimeMs: 0,
          baseline: null,
        });
      });

      expect(result.current.progress.configsPerSecond).toBe(0);
    });

    test('should_handle_large_dataset', () => {
      const { result } = renderHook(() => useOptimization());

      const largeCsvData = Array.from({ length: 10000 }, (_, i) => ({
        time: i,
        high: 100 + i,
        low: 98 + i,
        close: 99 + i,
        RSI: 50,
        date: `${i}/1/2024`,
      }));

      act(() => {
        result.current.startOptimization(largeCsvData, mockStrategyConfig);
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalled();
    });

    test('should_handle_restart_optimization_mid_run', () => {
      const { result } = renderHook(() => useOptimization());

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      act(() => {
        mockWorkerInstance.simulateMessage({
          type: 'progress',
          current: 50,
          total: 100,
          elapsedMs: 5000,
        });
      });

      act(() => {
        result.current.startOptimization(mockCsvData, mockStrategyConfig);
      });

      expect(result.current.progress.current).toBe(0);
      expect(result.current.results).toBeNull();
    });
  });
});
