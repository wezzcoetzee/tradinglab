# Web Worker Optimization

## Problem

Testing 1M+ backtest configurations on the main thread freezes the UI for minutes. Users can't cancel, see progress, or interact with the page.

## Solution

Offload the backtest loop to a Web Worker (`lib/backtest/optimization.worker.ts`). The main thread handles UI, progress updates, and final result display.

## Architecture

### Main Thread (`hooks/use-optimization.ts`)

1. Pre-computes SMA values for all periods in the configured range
2. Pre-computes ATR values for periods 10/14/20 (if ATR enabled)
3. Generates all `BacktestConfig` combinations via `generateBacktestConfigs()`
4. Serializes pre-computed data as `WorkerInput` and sends via `postMessage`
5. Listens for `progress`, `complete`, and `error` messages
6. On completion, re-runs the best config with full day details (for chart/table rendering)

### Worker Thread (`lib/backtest/optimization.worker.ts`)

1. Receives `WorkerInput` with CSV data, pre-computed SMAs/ATRs, and config list
2. Reconstructs `Map` objects from serialized entries (Maps aren't transferable)
3. Iterates through all configs, calling `runBacktest()` for each
4. Posts `progress` message every 100 configs with current count and elapsed time
5. Collects results:
   - **ATR disabled:** Full array of `BacktestResultSummary`
   - **ATR enabled:** `TopKHeap(1000)` — min-heap keeping only top 1000 by total return
6. Calculates buy-and-hold baseline via `calculateBuyAndHoldBaseline()`
7. Posts `complete` message with sorted results, baseline, and timing

### Message Protocol (`lib/backtest/optimization-types.ts`)

```typescript
type WorkerMessage =
  | { type: 'progress'; current: number; total: number; elapsedMs: number }
  | { type: 'complete'; results: BacktestResultSummary[]; baseline: BuyAndHoldBaseline | null;
      totalConfigs: number; totalTimeMs: number; isTruncated: boolean }
  | { type: 'error'; error: string }
```

## Why Pre-Compute on Main Thread

SMA and ATR values are shared across configs. Computing them once on the main thread and transferring to the worker avoids redundant calculation. For 199 SMA periods × 1000 data points, this saves ~199,000 redundant SMA computations per backtest run.

## Why Top-K Heap

With ATR enabled, ~1M results × ~200 bytes each ≈ 200MB. Browser tabs typically have 1-4GB memory limits. The `TopKHeap` maintains only the top 1000 results using a min-heap, keeping memory constant at ~200KB regardless of config count.

The heap uses `totalReturn` as the sort key. Results where `isLiquidated === true` are filtered out before insertion.

## Why Re-Run Best on Main Thread

The worker returns `BacktestResultSummary` (no day-by-day array) to minimize message transfer size. For the performance chart and day-by-day table, we need the full `BacktestResult` with `days[]`. Re-running a single config takes <1ms — negligible cost for the data needed.

## Cancellation

`useOptimization` calls `worker.terminate()` to kill the worker immediately. No graceful shutdown protocol — the worker is stateless and ephemeral. Cleanup happens on the React side via `useEffect` return.

## Trade-offs

| Trade-off | Chosen | Alternative |
|-----------|--------|-------------|
| Single worker | Simpler code, good enough perf | SharedArrayBuffer + multiple workers |
| Structured clone | Works everywhere | Transferable ArrayBuffers (faster, more complex) |
| Progress every 100 | Smooth UI, low overhead | Every config (too many messages) or every 1000 (jumpy progress) |
| Top-K = 1000 | Covers any reasonable analysis need | Configurable K (unnecessary complexity) |
