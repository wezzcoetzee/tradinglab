'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CsvRow, StrategyConfig } from '@/lib/types';
import type { OptimizationProgress, WorkerInput, WorkerMessage } from '@/lib/backtest/optimization-types';
import type { BacktestResult, BuyAndHoldBaseline } from '@/lib/backtest/types';

import { calculateAllATRs } from '@/lib/backtest/atr-calculator';
import { generateBacktestConfigs } from '@/lib/backtest/leverage-config';
import { calculateAllSMAs, extractClosePrices } from '@/lib/backtest/sma-calculator';

interface OptimizationState {
  progress: OptimizationProgress;
  results: BacktestResult[] | null;
  baseline: BuyAndHoldBaseline | null;
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
  const [state, setState] = useState<OptimizationState>({
    progress: INITIAL_PROGRESS,
    results: null,
    baseline: null,
  });

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

  const startOptimization = useCallback(
    (csvData: CsvRow[], strategyConfig: StrategyConfig) => {
      terminateWorker();

      setState({
        progress: { ...INITIAL_PROGRESS, status: 'preparing' },
        results: null,
        baseline: null,
      });

      const closePrices = extractClosePrices(csvData);
      const allSMAs = calculateAllSMAs(closePrices);
      const allATRs = strategyConfig.atrEnabled ? calculateAllATRs(csvData) : null;

      const configs = generateBacktestConfigs(
        strategyConfig.startingCapital,
        strategyConfig.tradingFee,
        strategyConfig.atrEnabled
      );

      const workerInput: WorkerInput = {
        csvData,
        allSMAs: Array.from(allSMAs.entries()),
        allATRs: allATRs ? Array.from(allATRs.entries()) : null,
        configs,
        startingCapital: strategyConfig.startingCapital,
      };

      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          status: 'running',
          total: configs.length,
        },
      }));

      const worker = new Worker(
        new URL('@/lib/backtest/optimization.worker.ts', import.meta.url)
      );

      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const message = event.data;

        if (message.type === 'progress') {
          const configsPerSecond = calculateConfigsPerSecond(message.current, message.elapsedMs);
          const estimatedRemainingMs = calculateEstimatedRemainingMs(
            message.total,
            message.current,
            configsPerSecond
          );

          setState(prev => ({
            ...prev,
            progress: {
              status: 'running',
              current: message.current,
              total: message.total,
              percentComplete: (message.current / message.total) * 100,
              elapsedMs: message.elapsedMs,
              estimatedRemainingMs,
              configsPerSecond,
            },
          }));
        } else if (message.type === 'complete') {
          const configsPerSecond = calculateConfigsPerSecond(
            message.results.length,
            message.totalTimeMs
          );

          setState({
            progress: {
              status: 'complete',
              current: message.results.length,
              total: message.results.length,
              percentComplete: 100,
              elapsedMs: message.totalTimeMs,
              estimatedRemainingMs: 0,
              configsPerSecond,
            },
            results: message.results,
            baseline: message.baseline,
          });
          terminateWorker();
        } else if (message.type === 'error') {
          setState(prev => ({
            ...prev,
            progress: {
              ...prev.progress,
              status: 'error',
              errorMessage: message.error,
            },
          }));
          terminateWorker();
        }
      };

      worker.onerror = (error) => {
        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            status: 'error',
            errorMessage: error.message || 'Worker error occurred',
          },
        }));
        terminateWorker();
      };

      workerRef.current = worker;
      worker.postMessage(workerInput);
    },
    [terminateWorker]
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
    progress: state.progress,
    results: state.results,
    baseline: state.baseline,
    startOptimization,
    cancelOptimization,
  };
}
