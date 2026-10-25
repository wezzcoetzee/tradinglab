'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CsvRow, StrategyConfig } from '@/lib/types';
import type { OptimizationProgress, WorkerInput, WorkerMessage } from '@/lib/backtest/optimization-types';
import type { OptimizationOutcome } from '@/lib/backtest/optimizer';

interface OptimizationState extends Omit<OptimizationOutcome, 'results'> {
  progress: OptimizationProgress;
  results: OptimizationOutcome['results'] | null;
}

const INITIAL_PROGRESS: OptimizationProgress = {
  status: 'idle',
  current: 0,
  total: 0,
  percentComplete: 0,
  elapsedMs: 0,
  estimatedRemainingMs: null,
  configsPerSecond: 0,
};

const INITIAL_STATE: OptimizationState = {
  progress: INITIAL_PROGRESS,
  results: null,
  baseline: null,
  bestResultWithDays: null,
  isTruncated: false,
  stats: { total: 0, profitable: 0, liquidated: 0 },
};

function calculateConfigsPerSecond(current: number, elapsedMs: number): number {
  return elapsedMs > 0 ? (current / elapsedMs) * 1000 : 0;
}

function calculateEstimatedRemainingMs(
  total: number,
  current: number,
  configsPerSecond: number
): number | null {
  const remaining = total - current;
  return configsPerSecond > 0 ? (remaining / configsPerSecond) * 1000 : null;
}

export function useOptimization() {
  const [state, setState] = useState<OptimizationState>(INITIAL_STATE);
  const workerRef = useRef<Worker | null>(null);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      terminateWorker();
    };
  }, [terminateWorker]);

  const setErrorStatus = useCallback((errorMessage: string) => {
    setState(prev => ({
      ...prev,
      progress: { ...prev.progress, status: 'error', errorMessage },
    }));
    terminateWorker();
  }, [terminateWorker]);

  const startOptimization = useCallback(
    (csvData: CsvRow[], strategyConfig: StrategyConfig) => {
      terminateWorker();
      setState({ ...INITIAL_STATE, progress: { ...INITIAL_PROGRESS, status: 'running' } });

      const worker = new Worker(
        new URL('@/lib/backtest/optimization.worker.ts', import.meta.url)
      );

      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const message = event.data;

        if (message.type === 'progress') {
          const configsPerSecond = calculateConfigsPerSecond(message.current, message.elapsedMs);

          setState(prev => ({
            ...prev,
            progress: {
              status: 'running',
              current: message.current,
              total: message.total,
              percentComplete: (message.current / message.total) * 100,
              elapsedMs: message.elapsedMs,
              estimatedRemainingMs: calculateEstimatedRemainingMs(message.total, message.current, configsPerSecond),
              configsPerSecond,
            },
          }));
        } else if (message.type === 'complete') {
          const { stats, totalTimeMs } = message;

          setState({
            results: message.results,
            baseline: message.baseline,
            bestResultWithDays: message.bestResultWithDays,
            isTruncated: message.isTruncated,
            stats,
            progress: {
              status: 'complete',
              current: stats.total,
              total: stats.total,
              percentComplete: 100,
              elapsedMs: totalTimeMs,
              estimatedRemainingMs: 0,
              configsPerSecond: calculateConfigsPerSecond(stats.total, totalTimeMs),
            },
          });
          terminateWorker();
        } else if (message.type === 'error') {
          setErrorStatus(message.error);
        }
      };

      worker.onerror = (error) => {
        setErrorStatus(error.message || 'Worker error occurred');
      };

      workerRef.current = worker;
      const workerInput: WorkerInput = { csvData, strategyConfig };
      worker.postMessage(workerInput);
    },
    [terminateWorker, setErrorStatus]
  );

  const cancelOptimization = useCallback(() => {
    terminateWorker();
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        status: 'idle',
      },
    }));
  }, [terminateWorker]);

  return {
    ...state,
    startOptimization,
    cancelOptimization,
  };
}
