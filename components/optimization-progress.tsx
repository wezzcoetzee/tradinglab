'use client';

import type { OptimizationProgress } from '@/lib/backtest/optimization-types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatTime } from '@/lib/format';

interface OptimizationProgressProps {
  progress: OptimizationProgress;
  onCancel: () => void;
}

function getStatusText(status: OptimizationProgress['status']): string {
  switch (status) {
    case 'idle':
      return 'Ready';
    case 'preparing':
      return 'Preparing...';
    case 'running':
      return 'Running';
    case 'complete':
      return 'Complete';
    case 'error':
      return 'Error';
  }
}

function getStatusColor(status: OptimizationProgress['status']): string {
  switch (status) {
    case 'idle':
      return 'text-muted-foreground';
    case 'preparing':
    case 'running':
      return 'text-blue-600';
    case 'complete':
      return 'text-green-600';
    case 'error':
      return 'text-destructive';
  }
}

export function OptimizationProgressCard({ progress, onCancel }: OptimizationProgressProps) {
  const showProgress = progress.status === 'running' || progress.status === 'complete';
  const showCancel = progress.status === 'preparing' || progress.status === 'running';

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Optimization Progress</CardTitle>
        {showCancel && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${getStatusColor(progress.status)}`}>
            {getStatusText(progress.status)}
          </span>
          {showProgress && (
            <span className="text-sm text-muted-foreground">
              {formatNumber(progress.current)} / {formatNumber(progress.total)}
            </span>
          )}
        </div>

        {showProgress && (
          <>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Elapsed</div>
                <div className="font-mono">{formatTime(progress.elapsedMs)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Remaining</div>
                <div className="font-mono">
                  {progress.estimatedRemainingMs !== null
                    ? formatTime(progress.estimatedRemainingMs)
                    : '--'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Rate</div>
                <div className="font-mono">{formatNumber(progress.configsPerSecond)}/s</div>
              </div>
            </div>
          </>
        )}

        {progress.status === 'error' && progress.errorMessage && (
          <div className="text-sm text-destructive">{progress.errorMessage}</div>
        )}
      </CardContent>
    </Card>
  );
}
