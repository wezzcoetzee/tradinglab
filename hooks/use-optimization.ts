'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CsvRow, StrategyConfig } from '@/lib/types';
import type { OptimizationProgress, WorkerInput, WorkerMessage } from '@/lib/backtest/optimization-types';
import type { BacktestResult, BacktestResultSummary, BuyAndHoldBaseline } from '@/lib/backtest/types';

import { runBacktest } from '@/lib/backtest/backtest-runner';

import { calculateAllATRs } from '@/lib/backtest/atr-calculator';
import { generateBacktestConfigs } from '@/lib/backtest/leverage-config';
import { calculateAllSMAs, extractClosePrices } from '@/lib/backtest/sma-calculator';

interface OptimizationState {
  progress: OptimizationProgress;
  results: BacktestResultSummary[] | null;
  baseline: BuyAndHoldBaseline | null;
  bestResultWithDays: BacktestResult | null;
  isTruncated: boolean;
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
    bestResultWithDays: null,
    isTruncated: false,
  });

  const workerRef = useRef<Worker | null>(null);
  const dataRef = useRef<{
    csvData: CsvRow[];
    allSMAs: Map<number, number[]>;
    allATRs: Map<10 | 14 | 20, number[]> | null;
  } | null>(null);

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
        bestResultWithDays: null,
        isTruncated: false,
      });

      const closePrices = extractClosePrices(csvData);
      const allSMAs = calculateAllSMAs(closePrices);
      const allATRs = strategyConfig.atrEnabled ? calculateAllATRs(csvData) : null;

      dataRef.current = { csvData, allSMAs, allATRs };

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
        atrEnabled: strategyConfig.atrEnabled,
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
          const percentComplete = (message.current / message.total) * 100;

          setState(prev => ({
            ...prev,
            progress: {
              status: 'running',
              current: message.current,
              total: message.total,
              percentComplete,
              elapsedMs: message.elapsedMs,
              estimatedRemainingMs,
              configsPerSecond,
            },
          }));
        } else if (message.type === 'complete') {
          const configsPerSecond = calculateConfigsPerSecond(
            message.totalConfigs,
            message.totalTimeMs
          );

          const sortedResults = [...message.results].sort((a, b) => {
            if (a.isLiquidated !== b.isLiquidated) return a.isLiquidated ? 1 : -1;
            return b.totalReturn - a.totalReturn;
          });
          const bestSummary = sortedResults.find(r => !r.isLiquidated);

          let bestResultWithDays: BacktestResult | null = null;
          if (bestSummary && dataRef.current) {
            const { csvData, allSMAs, allATRs } = dataRef.current;
            const smaValues = allSMAs.get(bestSummary.config.smaPeriod);
            const atrValues = bestSummary.config.atr && allATRs
              ? allATRs.get(bestSummary.config.atr.period) ?? null
              : null;
            if (smaValues) {
              bestResultWithDays = runBacktest(csvData, smaValues, bestSummary.config, atrValues);
            }
          }

          setState({
            progress: {
              status: 'complete',
              current: message.totalConfigs,
              total: message.totalConfigs,
              percentComplete: 100,
              elapsedMs: message.totalTimeMs,
              estimatedRemainingMs: 0,
              configsPerSecond,
            },
            results: message.results,
            baseline: message.baseline,
            bestResultWithDays,
            isTruncated: message.isTruncated,
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
    bestResultWithDays: state.bestResultWithDays,
    isTruncated: state.isTruncated,
    startOptimization,
    cancelOptimization,
  };
}
