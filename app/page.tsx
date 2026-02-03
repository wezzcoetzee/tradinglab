'use client';

import { useCallback, useState } from 'react';

import { CsvUpload } from '@/components/csv-upload';
import { OptimizationProgressCard } from '@/components/optimization-progress';
import { ResultsTable } from '@/components/results-table';
import { SmaComparisonTable } from '@/components/sma-comparison-table';
import { StrategyConfigForm } from '@/components/strategy-config';
import { Button } from '@/components/ui/button';
import { useOptimization } from '@/hooks/use-optimization';
import type { CsvRow, StrategyConfig } from '@/lib/types';

export default function Home() {
  const [csvData, setCsvData] = useState<CsvRow[] | null>(null);
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig | null>(null);

  const { progress, results, baseline, startOptimization, cancelOptimization } = useOptimization();

  const handleDataLoaded = useCallback((data: CsvRow[]) => {
    setCsvData(data);
  }, []);

  const handleConfigChange = useCallback((config: StrategyConfig | null) => {
    setStrategyConfig(config);
  }, []);

  const handleRunOptimization = () => {
    if (csvData && strategyConfig) {
      startOptimization(csvData, strategyConfig);
    }
  };

  const isRunning = progress.status === 'preparing' || progress.status === 'running';
  const canRunOptimization = csvData !== null && strategyConfig !== null && !isRunning;
  const showProgress = progress.status !== 'idle';

  return (
    <div className="flex min-h-screen items-start justify-center p-8">
      <div className="flex flex-col gap-8 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CsvUpload onDataLoaded={handleDataLoaded} />
          <StrategyConfigForm onConfigChange={handleConfigChange} />
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleRunOptimization}
            disabled={!canRunOptimization}
          >
            Run Optimization
          </Button>
        </div>

        {showProgress && (
          <OptimizationProgressCard progress={progress} onCancel={cancelOptimization} />
        )}

        <ResultsTable results={results ?? []} baseline={baseline} />

        <SmaComparisonTable results={results ?? []} baseline={baseline} />
      </div>
    </div>
  );
}
