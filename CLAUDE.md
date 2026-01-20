# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun dev                    # Start Next.js dev server

# Build & Lint
bun run build              # Production build
bun run lint               # ESLint

# Database
bun run db:migrate         # Run Prisma migrations
bun run db:seed            # Seed BTC price data
bun run db:reset           # Reset database and re-seed
```

## Architecture

This is an SMA (Simple Moving Average) strategy backtesting application for Bitcoin trading. Users can compare SMA-based trading strategies against HODL performance.

### Data Flow

1. Historical BTC price data stored in PostgreSQL via Prisma (`data/btc-price-data.json` → `PriceData` table)
2. `/api/backtest` endpoint receives strategy parameters and runs simulations
3. Backtest engine (`lib/backtest/`) processes all SMA periods in range, returns best performer
4. Dashboard displays results via charts and tables

### Core Modules

**lib/backtest/**
- `types.ts` - Shared types: `BacktestParams`, `SmaResult`, `Position`, `TrailingStopConfig`
- `engine.ts` - Orchestrates backtest: `runBacktest()` iterates SMA periods, `runSingleSmaBacktest()` for individual runs
- `simulator.ts` - Trading simulation: position management, leverage, liquidation, trailing stops, fee calculation
- `sma.ts` - SMA calculation
- `atr.ts` - ATR (Average True Range) calculation for trailing stops

**Key Constants**
- `WARMUP_DAYS = 200` in engine.ts - Data points before simulation starts

### Database

Prisma with PostgreSQL adapter. Schema at `prisma/schema.prisma`:
- `PriceData` - Historical BTC prices (unixTimestamp, date, closePrice)
- `SavedOptimizationResult` - Persisted optimization results
- `StrategyConfig` - Saved strategy configurations

Generated Prisma client outputs to `generated/prisma/`.

### Frontend

- Next.js 16 App Router with React 19
- ShadCN components (`components/ui/`)
- Main dashboard at `components/backtest/dashboard.tsx`
- URL-based state persistence via `hooks/use-url-params.ts`

### Path Aliases

`@/*` maps to project root (configured in tsconfig.json)
