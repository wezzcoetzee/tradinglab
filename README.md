# TradingLab

A crypto trading strategy backtester that exhaustively optimizes SMA crossover strategies with configurable leverage and ATR-based trailing stops.

## Features

- **CSV Data Import** - Upload historical OHLC data
- **Exhaustive Optimization** - Tests all combinations of SMA periods (2-200), long/short leverage, and ATR configurations
- **ATR Trailing Stops** - Optional trailing stop loss with configurable ATR period, multiplier, and partial close percentage
- **Web Worker Execution** - Runs optimization in background thread to keep UI responsive
- **Buy & Hold Baseline** - Compare strategy performance against simple buy and hold
- **Day-by-Day Analysis** - Detailed trade log for the best performing strategy
- **Position Size Calculator** - Calculate optimal position size based on risk tolerance and stop loss distance
- **Profit Calculator** - Estimate profit, loss, and risk/reward ratio across multiple take profit targets
- **Trading Guides** - Educational guides covering position sizing, risk management, and risk/reward ratios
- **Live Price Ticker** - Real-time crypto mid prices streamed from Hyperliquid via WebSocket

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime

### Installation

```bash
bun install
```

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
bun run build
bun start
```

### Testing

```bash
bun test
```

## Usage

### 1. Prepare CSV Data

Your CSV file must contain these columns:

| Column | Description |
|--------|-------------|
| `high` | Period high price |
| `low` | Period low price |
| `close` | Period close price |
| `date` | Human-readable date string (DD/MM/YYYY) |

### 2. Configure Strategy

- **Starting Capital** - Initial portfolio value
- **Trading Fee** - Fee percentage per trade (e.g., 0.05 for 0.05%)
- **SMA Range** - Min/max SMA periods to test (2-200)
- **ATR Trailing Stop** - Enable to test ATR-based stop loss configurations

### 3. Run Optimization

Click "Run Optimization" to test all parameter combinations. The optimizer will:

1. Pre-compute SMA values for all periods
2. Pre-compute ATR values (if enabled) for periods 10, 14, and 20
3. Run backtests for each configuration combination
4. Track and display the top performing strategies

### 4. Analyze Results

- **Results Table** - Top strategies sorted by total return
- **SMA Comparison** - Performance grouped by SMA period
- **Day-by-Day Table** - Detailed trade log for the best strategy

## Strategy Logic

The backtester implements a simple SMA crossover strategy:

- **Long** when price > SMA
- **Short** when price < SMA

With ATR trailing stops enabled:
- Stop triggers when price moves ATR × multiplier against position from extreme
- Partial close (10%, 25%, 50%, or 100%) executed on trigger
- Capital moved to sideline until next position opens

## Tech Stack

- [Next.js](https://nextjs.org/) 16 with App Router
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Radix UI](https://www.radix-ui.com/) primitives
- [Bun](https://bun.sh/) runtime and test runner
- [Hyperliquid SDK](https://github.com/nktkas/hyperliquid) for live price streaming
