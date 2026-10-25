# Web Worker Optimization

## Problem

Testing 1M+ backtest configurations on the main thread freezes the UI for minutes. Users can't cancel, see progress, or interact with the page.

## Solution

Offload the backtest loop to a Web Worker (`lib/backtest/optimization.worker.ts`). The main thread handles UI, progress updates, and final result display.

## Architecture

### Main Thread (`hooks/use-optimization.ts`)

1. Sends `WorkerInput` (`csvData` + `strategyConfig`) via `postMessage`
2. Listens for `progress`, `complete`, and `error` messages
3. Stores the `OptimizationOutcome` from `complete` in state

The main thread does no backtest work, so the UI stays responsive from the moment the user clicks Run.

### Worker Thread (`lib/backtest/optimization.worker.ts` → `runOptimization()` in `optimizer.ts`)

1. Computes SMA values for all periods in the range and ATR values for 10/14/20 (if enabled), using rolling sums
2. Generates all `BacktestConfig` combinations via `generateBacktestConfigs()`
3. Calls `runBacktest()` for each config in summary mode, tallying profitable/liquidated stats over every config
4. Posts `progress` every 100 configs with current count and elapsed time
5. Collects results:
   - **ATR disabled:** Full array of `BacktestResultSummary`, sorted by `compareResults`
   - **ATR enabled:** `TopKHeap(1000)` — min-heap keeping only the top 1000 survivors by total return
6. Replays the best surviving config with full day details (for chart/table)
7. Calculates the buy-and-hold baseline and posts `complete`

### Message Protocol (`lib/backtest/optimization-types.ts`)

```typescript
type WorkerMessage =
  | { type: 'progress'; current: number; total: number; elapsedMs: number }
  | ({ type: 'complete'; totalTimeMs: number } & OptimizationOutcome)
  | { type: 'error'; error: string }

interface OptimizationOutcome {
  results: BacktestResultSummary[];
  bestResultWithDays: BacktestResult | null;
  baseline: BuyAndHoldBaseline | null;
  stats: { total: number; profitable: number; liquidated: number };
  isTruncated: boolean;
}
```

## Why Compute Indicators Once in the Worker

SMA and ATR values are shared across configs, so they are computed once per run and looked up per config. Doing it in the worker (rather than on the main thread and cloning across) keeps the UI free and avoids structured-cloning up to ~1M config objects.

## Why Top-K Heap

With ATR enabled, ~1M results × ~200 bytes each ≈ 200MB. Browser tabs typically have 1-4GB memory limits. The `TopKHeap` maintains only the top 1000 results using a min-heap, keeping memory constant at ~200KB regardless of config count.

The heap uses `totalReturn` as the sort key. Results where `isLiquidated === true` are filtered out before insertion, which is why the outcome carries separate `stats` counted over every config.

## Why Replay the Best Config

Configs run in summary mode (no day-by-day array) to keep memory and message size small. The chart and day-by-day table need the full `BacktestResult` with `days[]`, so the worker replays the single best config with days before posting `complete`. One extra run is negligible.

## Cancellation

`useOptimization` calls `worker.terminate()` to kill the worker immediately. No graceful shutdown protocol — the worker is stateless and ephemeral. Cleanup happens on the React side via `useEffect` return.

## Trade-offs

| Trade-off | Chosen | Alternative |
|-----------|--------|-------------|
| Single worker | Simpler code, good enough perf | SharedArrayBuffer + multiple workers |
| Structured clone | Works everywhere | Transferable ArrayBuffers (faster, more complex) |
| Progress every 100 | Smooth UI, low overhead | Every config (too many messages) or every 1000 (jumpy progress) |
| Top-K = 1000 | Covers any reasonable analysis need | Configurable K (unnecessary complexity) |
