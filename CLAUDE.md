# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server (localhost:3000)
bun run build    # Production build
bun run lint     # Run ESLint
bun test         # Run all tests
bun test <file>  # Run single test file
```

## Architecture

Crypto trading strategy backtester with exhaustive parameter optimization.

### Data Flow

1. **CSV Upload** → `lib/csv-validator.ts` validates OHLC data with RSI column
2. **Strategy Config** → `lib/strategy-validator.ts` validates user inputs (capital, fees, SMA range, ATR toggle)
3. **Optimization** → `hooks/use-optimization.ts` orchestrates Web Worker execution
4. **Worker** → `lib/backtest/optimization.worker.ts` runs all parameter combinations in background thread
5. **Results** → Top-K heap (`lib/backtest/top-k-heap.ts`) when ATR enabled, full results otherwise

### Backtest Engine (`lib/backtest/`)

- `backtest-runner.ts` - Core simulation loop processing daily OHLC data
- `position-manager.ts` - Long/short position state, PnL calculations
- `sma-calculator.ts` - Pre-computes SMA values for all periods (2-200)
- `atr-calculator.ts` - Pre-computes ATR for periods 10/14/20
- `trailing-stop-manager.ts` - ATR-based trailing stop logic with partial closes
- `leverage-config.ts` - Generates all parameter combinations (SMA × leverage × ATR configs)
- `fee-calculator.ts` - Trading fee calculations for position transitions

### Key Types (`lib/backtest/types.ts`)

- `BacktestConfig` - Single simulation parameters (SMA period, leverages, ATR config)
- `BacktestResult` - Full result with day-by-day details
- `BacktestResultSummary` - Result without day details (used in worker for memory efficiency)
- `Position` - Current position state including trailing stop

### Components

- `backtest-setup.tsx` - CSV file upload and validation UI
- `strategy-config.tsx` - Parameter input form
- `optimization-progress.tsx` - Real-time progress with cancel
- `results-table.tsx` - Top results with pagination
- `sma-comparison-table.tsx` - SMA period grouped comparison
- `day-by-day-table.tsx` - Detailed trade log for best result

## Testing

Tests use Bun's test runner with `happy-dom` for DOM. Test files are colocated with source (`.test.ts`/`.test.tsx`).

## Path Aliases

`@/*` maps to project root (configured in `tsconfig.json`).
