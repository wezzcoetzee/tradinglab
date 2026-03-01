# Product Sense

## What TradingLab Is

A free, browser-based tool for crypto traders to backtest SMA crossover strategies against historical OHLC data, calculate position sizes, and analyze profit scenarios. The core value proposition: exhaustive parameter optimization finds the best-performing configuration across thousands of SMA period, leverage, and ATR trailing stop combinations, complemented by standalone trading calculators.

**URL:** https://tradinglab.vip

## What TradingLab Is Not

- Not a trading platform (no live trading, no exchange integration)
- Not a portfolio tracker
- Not multi-strategy (SMA crossover only for backtesting, by design)
- Not a data provider (users bring their own CSV for backtesting)

## User Mental Model

The user thinks in terms of: "If I had traded BTC with this SMA period and this leverage over the past N years, how would I have done versus just holding?"

They want to:
1. Find the optimal SMA period for a given asset and timeframe
2. Understand how leverage amplifies returns (and risk of liquidation)
3. See if ATR-based trailing stops improve outcomes
4. Compare strategy performance against buy-and-hold
5. Calculate position sizes based on risk tolerance
6. Model profit/loss across multiple take-profit levels

## Core Flows

### Backtester Flow

#### 1. Upload Data
User uploads a CSV with columns: `high`, `low`, `close`, `date`. Example CSVs (BTC, ETH, SOL) are provided for download. PapaParse handles parsing; `csv-validator.ts` validates schema and minimum row count (160 days for warmup).

### 2. Configure Strategy
User sets:
- **Starting capital** (default: $1,000)
- **Trading fee** (default: 0.05%)
- **SMA range** (default: 2–200)
- **ATR trailing stops** (toggle, default: off)

All fields validate in real-time via `strategy-validator.ts`.

### 3. Run Optimization
Click "Run Optimization" → progress bar shows configs/sec, ETA, completion percentage. User can cancel mid-run. The Web Worker tests every parameter combination.

### 4. Review Results
Results appear in multiple views:
- **Optimal Strategy Card** — best config with final value, return %, vs hold
- **Baseline Card** — buy-and-hold benchmark for comparison
- **Metrics Cards** — total configs tested, profitable count, liquidation rate
- **Performance Chart** — line chart comparing strategy equity curve vs buy-and-hold
- **Day-by-Day Table** — full trade log for the best strategy
- **SMA Comparison Table** — best result per SMA period
- **All Configurations Table** — every tested config with sortable columns

### Position Size Calculator Flow

User enters trade type (LONG/SHORT), entry price, stop loss price, leverage, and risk amount. The calculator returns position size, margin required, risk distance, and maximum loss. Validates that stop loss is on the correct side of entry for the trade direction.

### Profit Calculator Flow

User enters trade type, entry price, stop loss, leverage, position size, and up to 4 take-profit levels. The calculator returns per-TP profit breakdown, total/average profit, ROI, risk-reward ratios, and margin. Position is split equally across take-profit levels.

### Guides

Static index page linking to trading educational content. Card-based layout with categorized guides.

## Key Product Decisions

| Decision | Why |
|----------|-----|
| Client-side only | Privacy (no data leaves browser), zero hosting cost, instant feedback |
| Exhaustive search | Users trust brute-force over heuristic optimization — they see every combination was tested |
| Buy-and-hold baseline | Every result is compared to "just holding" — the strategy must beat passive |
| ATR as optional | ATR trailing stops add 60× more configs — users opt-in when they want deeper analysis |
| Top-K with ATR | ~1M results would crash the browser. Top 1000 by return is sufficient for decision-making |
| Example CSVs | Reduces friction to first value — user can try the tool without sourcing data |

## User Personas

### Crypto Trader
Has historical OHLC data from TradingView or similar. Wants to validate whether a specific SMA period works for their asset. Cares about leverage impact and liquidation risk.

### Strategy Researcher
Tests multiple assets and timeframes systematically. Exports results mentally (no export feature yet). Compares SMA performance across different market conditions.
