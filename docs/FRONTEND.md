# Frontend

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── ThemeProvider
├── Header
│   ├── PriceTicker                          # Live Hyperliquid mids (useHyperliquidPrices)
│   └── ThemeToggle
├── Home (app/page.tsx)
│   └── Backtester                          # Root orchestrator, owns csvData + strategyConfig state
│       ├── BacktestSetup                   # CSV upload, validation, example downloads
│       │   └── Button (Run Optimization)   # Passed as actionButton prop
│       ├── StrategyConfigForm              # Capital, fees, SMA range, ATR toggle
│       ├── OptimizationProgressCard        # Progress bar, ETA, configs/sec, cancel
│       └── ResultsTable                    # Renders all result sub-components
│           ├── BaselineCard                # Buy-and-hold benchmark
│           ├── OptimalStrategyCard         # Best config highlight
│           ├── MetricsCards                # Total configs, profitable, liquidated
│           ├── PerformanceChart            # Recharts line chart (strategy vs hold)
│           ├── DayByDayTable               # Trade log with virtual scrolling
│           ├── SmaComparisonTable          # Results grouped by SMA period
│           └── AllConfigurationsTable      # Full results with all parameters
├── Backtester (app/backtester/page.tsx)     # Dedicated backtester route
├── PositionSizeCalculator (app/calculator/position-size/)
│   └── ResultCard                          # Reusable result display card
├── ProfitCalculator (app/calculator/profit/)
│   └── ResultCard
├── Guides (app/guides/page.tsx)            # Trading guides index with card grid
└── Footer
```

## State Management

No external state library. React `useState` + `useCallback` in `Backtester`, with a single custom hook for the heavy lifting.

### State Ownership

| State | Owner | Type |
|-------|-------|------|
| `csvData` | `Backtester` | `CsvRow[] \| null` |
| `strategyConfig` | `Backtester` | `StrategyConfig \| null` |
| Optimization progress, results, baseline | `useOptimization` hook | `OptimizationState` |
| Pagination | `usePagination` hook (per table) | Generic `<T>` |
| Theme | `ThemeProvider` (next-themes) | System/light/dark |

### useOptimization Hook

Central hook managing Web Worker lifecycle:

1. **Pre-computes** SMA and ATR arrays on main thread
2. **Generates** all `BacktestConfig` combinations
3. **Spawns** Web Worker, sends `WorkerInput` via `postMessage`
4. **Receives** progress updates (every 100 configs) and final results
5. **Re-runs** best config on main thread with full day details for chart/table
6. **Cleans up** worker on cancel, error, or unmount

Returns: `progress`, `results`, `baseline`, `bestResultWithDays`, `isTruncated`, `totalConfigsTested`, `startOptimization`, `cancelOptimization`

## Conventions

### File Organization
- Feature components in `components/` (flat, except `calculators/` subdirectory)
- Calculator components in `components/calculators/`
- ShadCN primitives in `components/ui/`
- Tests colocated: `foo.tsx` → `foo.test.tsx`
- One export per file (named exports, no default exports except pages)

### Naming
- `kebab-case` file names
- `PascalCase` components and types
- `camelCase` functions and variables
- `SCREAMING_SNAKE_CASE` constants

### Imports
- `@/*` path alias for all internal imports
- Group: external → internal → relative

### Components
- `'use client'` directive only on components that use hooks or browser APIs
- Props interfaces defined inline or colocated (not in separate files)
- ShadCN components used as-is, not wrapped

### Testing
- Bun test runner with `happy-dom` (configured in `test-setup.ts`)
- Testing Library for component tests (render, screen, userEvent)
- Direct function calls for unit tests (no mocking framework)
- Test file naming: `*.test.ts` or `*.test.tsx`

## ShadCN Configuration

```json
{
  "style": "new-york",
  "tailwind": { "baseColor": "neutral", "cssVariables": true },
  "iconLibrary": "lucide"
}
```

**Installed primitives:** Alert, Badge, Button, Card, Chart, Checkbox, Dialog, DropdownMenu, Form, Input, Label, Pagination, RadioGroup, Select, Skeleton, Switch, Table

## Key Patterns

### Pagination
Every table uses the `usePagination<T>` hook. The `TablePagination` component renders controls from the hook's return value.

### Virtual Scrolling
`@tanstack/react-virtual` used in `DayByDayTable` for performant rendering of large trade logs. Most other tables use pagination instead.

### Chart Downsampling
`PerformanceChart` uses `buildChartData()` which applies LTTB downsampling to keep chart point count manageable. ATR stop events are always preserved regardless of downsampling.
