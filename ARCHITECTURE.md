# Architecture

## System Overview

Client-side SMA crossover backtester with exhaustive parameter optimization. Users upload OHLC CSV data, configure strategy parameters, and the app tests every combination of SMA period × leverage × ATR config in a Web Worker.

Alongside the backtester, the app ships standalone position-size and profit calculators and a set of educational trading guides. A live price ticker in the header streams Hyperliquid mid prices over a client-side WebSocket.

**Deployment:** Next.js static export (`output: 'export'`) → Cloudflare Pages
**Runtime:** 100% browser. No backend server or database. The only external call is a client-side Hyperliquid WebSocket for live prices.

## Directory Structure

```
tradinglab/
├── app/
│   ├── layout.tsx              # Root layout, metadata, GA, JSON-LD
│   ├── page.tsx                # Home route → <Backtester />
│   ├── backtester/             # Backtester route
│   │   └── page.tsx
│   ├── calculator/
│   │   ├── position-size/      # Position size calculator
│   │   │   └── page.tsx
│   │   └── profit/             # Profit calculator
│   │       └── page.tsx
│   ├── guides/                 # Trading guides
│   │   ├── page.tsx                                  # Guides index
│   │   ├── how-to-calculate-position-size/page.tsx
│   │   ├── position-sizing-strategies/page.tsx
│   │   └── risk-reward-ratio/page.tsx
│   ├── globals.css             # Tailwind directives, CSS variables
│   ├── manifest.ts             # PWA manifest
│   ├── robots.ts               # Robots.txt
│   ├── sitemap.ts              # Sitemap
│   ├── not-found.tsx           # 404
│   ├── opengraph-image.tsx     # OG image (1200×630)
│   └── twitter-image.tsx       # Twitter card image
├── components/
│   ├── ui/                     # ShadCN primitives (17 components)
│   ├── calculators/            # Calculator feature components
│   │   ├── position-size-calculator.tsx
│   │   ├── profit-calculator.tsx
│   │   └── result-card.tsx
│   ├── backtester.tsx          # Root orchestrator
│   ├── backtest-setup.tsx      # CSV upload + validation
│   ├── strategy-config.tsx     # Parameter form
│   ├── optimization-progress.tsx # Progress bar + ETA
│   ├── results-table.tsx       # Result aggregator
│   ├── optimal-strategy-card.tsx # Best config highlight
│   ├── baseline-card.tsx       # Buy-and-hold benchmark
│   ├── metrics-cards.tsx       # Summary stats
│   ├── performance-chart.tsx   # Recharts line chart
│   ├── day-by-day-table.tsx    # Trade log
│   ├── sma-comparison-table.tsx # Results grouped by SMA
│   ├── all-configurations-table.tsx # Full results
│   ├── table-pagination.tsx    # Pagination controls
│   ├── header.tsx              # Sticky header (with live price ticker)
│   ├── footer.tsx              # Footer
│   ├── price-ticker.tsx        # Live Hyperliquid price ticker
│   ├── rolling-number.tsx      # Animated number transitions
│   ├── structured-data.tsx     # Per-page JSON-LD schema
│   ├── theme-provider.tsx      # next-themes wrapper
│   └── theme-toggle.tsx        # Dark/light toggle
├── hooks/
│   ├── use-optimization.ts     # Web Worker orchestration
│   ├── use-hyperliquid-prices.ts # Hyperliquid WebSocket live mids
│   ├── use-animated-number.ts  # Number tween hook
│   └── use-pagination.ts       # Generic pagination
├── lib/
│   ├── types.ts                # CsvRow, StrategyConfig, ValidationResult
│   ├── calculations.ts         # Position size and profit calculation logic
│   ├── formatters.ts           # Shared number/currency formatters
│   ├── csv-validator.ts        # OHLC CSV validation
│   ├── strategy-validator.ts   # Strategy input validation
│   ├── format.ts               # Currency, percent, time formatters
│   ├── chart-data.ts           # Chart point builder with downsampling
│   ├── downsample.ts           # LTTB algorithm
│   ├── utils.ts                # cn() classname utility
│   └── backtest/
│       ├── types.ts            # Engine types (Position, DayResult, BacktestConfig, etc.)
│       ├── optimization-types.ts # Worker message protocol
│       ├── constants.ts        # SMA/ATR ranges, warmup days
│       ├── backtest-runner.ts  # Core simulation loop
│       ├── backtest-engine.ts  # Engine orchestration
│       ├── position-manager.ts # Position state + PnL
│       ├── sma-calculator.ts   # SMA pre-computation
│       ├── atr-calculator.ts   # ATR pre-computation
│       ├── trailing-stop-manager.ts # ATR trailing stop logic
│       ├── leverage-config.ts  # Parameter combination generator
│       ├── fee-calculator.ts   # Trading fee calculations
│       ├── baseline-calculator.ts # Buy-and-hold baseline
│       ├── top-k-heap.ts       # Min-heap for top 1000 results
│       └── optimization.worker.ts # Web Worker entry point
├── public/
│   ├── BTC.csv, ETH.csv, SOL.csv  # Downloadable sample datasets
│   ├── llms.txt, llms-full.txt    # LLM discoverability
│   └── icons/images               # PWA assets, logo
├── data/                       # Source OHLC datasets (BTC, ETH, BNB, SOL, DOGE)
├── .github/workflows/
│   └── cloudflare-pages.yml    # CI: lint + test → build → deploy
└── docs/                       # This documentation
```

## Data Flow

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  CSV Upload  │───▶│  csv-validator   │───▶│   CsvRow[]      │
│  (PapaParse) │    │  (OHLC schema)   │    │                 │
└─────────────┘    └──────────────────┘    └────────┬────────┘
                                                     │
┌─────────────┐    ┌──────────────────┐              │
│ Strategy     │───▶│strategy-validator│───▶StrategyConfig
│ Config Form  │    │                  │              │
└─────────────┘    └──────────────────┘              │
                                                     ▼
                                           ┌─────────────────┐
                                           │ useOptimization  │
                                           │ (main thread)    │
                                           │                  │
                                           │ 1. Pre-compute   │
                                           │    all SMAs      │
                                           │ 2. Pre-compute   │
                                           │    all ATRs      │
                                           │ 3. Generate all  │
                                           │    configs       │
                                           └────────┬────────┘
                                                    │ postMessage
                                                    ▼
                                           ┌─────────────────┐
                                           │ Web Worker       │
                                           │                  │
                                           │ For each config: │
                                           │  runBacktest()   │
                                           │                  │
                                           │ ATR enabled?     │
                                           │  → TopKHeap(1000)│
                                           │ ATR disabled?    │
                                           │  → Full array    │
                                           └────────┬────────┘
                                                    │ onmessage
                                                    ▼
                                           ┌─────────────────┐
                                           │ Results Display  │
                                           │                  │
                                           │ • Optimal card   │
                                           │ • Metrics cards  │
                                           │ • Performance    │
                                           │   chart          │
                                           │ • Day-by-day     │
                                           │ • SMA comparison │
                                           │ • All configs    │
                                           └─────────────────┘
```

## Parameter Space

The optimizer tests every combination of:

| Parameter | Range | Count |
|-----------|-------|-------|
| SMA Period | User-defined (default 2–200) | Up to 199 |
| Long Leverage | 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0 | 9 |
| Short Leverage | Same as long | 9 |
| ATR Period | 10, 14, 20 (if enabled) | 3 |
| ATR Multiplier | 2, 2.5, 3, 3.5, 4 (if enabled) | 5 |
| ATR Close % | 10, 25, 50, 100 (if enabled) | 4 |

**Without ATR:** 199 × 9 × 9 = 16,119 configs
**With ATR:** 199 × 9 × 9 × 3 × 5 × 4 = 967,140 configs

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Static export | No server needed. Free Cloudflare Pages hosting. |
| Web Worker | Prevents UI freeze during 1M+ backtest iterations. |
| Pre-computed indicators | SMA/ATR calculated once, shared across all configs via transferable data. |
| Top-K heap | With ATR enabled (~1M results), storing all results OOMs. Heap keeps top 1000 by return. |
| LTTB downsampling | Performance charts with 1000+ days need point reduction. Preserves visual shape. |
| Summary vs Full results | Worker returns `BacktestResultSummary` (no day array). Best result re-run on main thread with full days for chart/table. |
| 160-day warmup | Largest possible SMA period needs 160 days of data before first valid signal. |

See [docs/design-docs/web-worker-optimization.md](design-docs/web-worker-optimization.md) for details.

## CI/CD Pipeline

```
Push to main
    │
    ├── Quality Job
    │   ├── bun install --frozen-lockfile
    │   ├── bun run lint
    │   └── bun test
    │
    └── Deploy Job (requires Quality)
        ├── setup-node (Node.js 22, for wrangler)
        ├── bun install --frozen-lockfile
        ├── bun run build (triggers prebuild: test + lint)
        └── wrangler-action@v4: pages deploy out/
```
