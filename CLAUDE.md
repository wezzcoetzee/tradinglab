# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun --bun run dev         # Start dev server on port 3000

# Build & Test
bun --bun run build       # Production build
bun --bun run test        # Run tests with vitest

# Database
bunx prisma generate      # Generate Prisma client
bunx prisma db push       # Push schema to database
bun run prisma/seed.ts    # Seed price data

# Data extraction
bun run scripts/extract-excel.ts  # Extract BTC data from Excel
```

## Architecture

**TanStack Start** full-stack React app with file-based routing and server functions.

### Data Flow

1. **Server functions** (`src/data/trading.server.ts`) fetch data from PostgreSQL via Prisma
2. **Route loaders** prefetch data server-side before rendering
3. **Calculation modules** (`src/lib/calculations/`) process strategy logic client-side

### Key Layers

- **Routes** (`src/routes/`): TanStack Router file-based routing with loaders
  - `trading/index.tsx`: Main dashboard with strategy calculations
  - `trading/optimize.tsx`: MA period optimization analysis

- **Server Functions** (`src/data/trading.server.ts`): `createServerFn` for RPC-style data fetching
  - `getPriceData`: Fetches historical BTC prices
  - `calculateStrategy`: Runs backtest with given parameters
  - `getOptimizationData`: Runs optimization across MA periods

- **Calculations** (`src/lib/calculations/`):
  - `indicators.ts`: SMA/EMA calculations
  - `signals.ts`: Signal generation (long/short/neutral)
  - `returns.ts`: Return and drawdown calculations
  - `optimizer.ts`: Brute-force MA period optimization

- **Types** (`src/lib/types/trading.ts`): Core trading types (`PricePoint`, `StrategyParams`, `StrategyResult`, `OptimizationResult`)

### Database

- PostgreSQL with Prisma ORM
- Generated client in `generated/prisma/`
- Schema defines `PriceData` (historical prices) and `StrategyConfig` (saved configs)

### Path Alias

`@/*` maps to `src/*`
