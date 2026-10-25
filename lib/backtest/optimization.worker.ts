import type { WorkerInput, WorkerMessage } from './optimization-types';

import { runOptimization } from './optimizer';

const post = (message: WorkerMessage) => self.postMessage(message);

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const startTime = performance.now();
  const elapsed = () => performance.now() - startTime;

  try {
    const outcome = runOptimization(event.data.csvData, event.data.strategyConfig, (current, total) =>
      post({ type: 'progress', current, total, elapsedMs: elapsed() })
    );
    post({ type: 'complete', ...outcome, totalTimeMs: elapsed() });
  } catch (error) {
    post({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
};
