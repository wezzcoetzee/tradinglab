# SMA Backtester

## Overview

Exhaustive SMA crossover strategy backtester. Tests every combination of SMA period, long/short leverage, and optional ATR trailing stop parameters against user-provided OHLC data.

## Input

### CSV Data
- Required columns: `high`, `low`, `close`, `date`
- Minimum rows: 160 (warmup period for largest SMA)
- Parsed with PapaParse, validated by `csv-validator.ts`
- Example CSVs provided: BTC, ETH, SOL (daily OHLC)

### Strategy Configuration
- **Starting capital:** Positive number (default: $1,000)
- **Trading fee:** Percentage per trade (default: 0.05%)
- **SMA range:** Min and max period to test (default: 2–200)
- **ATR trailing stops:** Toggle (default: off)

Validated by `strategy-validator.ts` with real-time error feedback.

## Trading Logic

### Signal Generation
- `close > SMA` → LONG position
- `close < SMA` → SHORT position
- `close == SMA` → No position (NONE)

### Position Actions
| Current | Target | Action |
|---------|--------|--------|
| NONE | LONG | OPEN_LONG |
| NONE | SHORT | OPEN_SHORT |
| LONG | SHORT | TRANSITION_LONG_TO_SHORT |
| SHORT | LONG | TRANSITION_SHORT_TO_LONG |
| LONG | NONE | CLOSE_LONG |
| SHORT | NONE | CLOSE_SHORT |
| Same | Same | HOLD |

### Fees
- Charged on every open, close, and transition
- Transitions charge double (close old + open new)
- Fee = balance × leverage × feeRate / 100
- No fee on HOLD or ATR_PARTIAL_CLOSE

### Leverage
- Applied to position value (not balance)
- Long profit: `(exitPrice / entryPrice - 1) × leverage × positionValue`
- Short profit: `(1 - exitPrice / entryPrice) × leverage × positionValue`
- Liquidation occurs when position loss exceeds balance

### ATR Trailing Stops (Optional)
- ATR periods: 10, 14, 20
- Multipliers: 2, 2.5, 3, 3.5, 4
- Close percentages: 10%, 25%, 50%, 100%

When enabled, each position gets a trailing stop at `entry ± ATR × multiplier`. The stop tracks the extreme price (highest for long, lowest for short). When triggered, the close percentage of the position is liquidated. 100% means full position close.

## Output

### Per Configuration
- Final balance and collateral value
- Total return percentage
- Total fees paid
- Total trades executed
- ATR trigger count
- Liquidation status (and day/date if liquidated)

### Aggregated Views
- **Optimal strategy:** Best non-liquidated config by total return
- **Buy-and-hold baseline:** What holding from day 160 to end would have returned
- **Metrics:** Total configs, profitable count, liquidated count, liquidation rate
- **Performance chart:** Strategy equity curve vs buy-and-hold (LTTB downsampled)
- **Day-by-day table:** Full trade log for best config
- **SMA comparison:** Best result per SMA period
- **All configurations:** Full results table with pagination

## Parameter Space

| ATR | Configs Formula | Example (SMA 2–200) |
|-----|----------------|---------------------|
| Off | `(smaMax - smaMin + 1) × 9 × 9` | 16,119 |
| On | `(smaMax - smaMin + 1) × 9 × 9 × 3 × 5 × 4` | 967,140 |

Leverage values: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0 (9 values each for long and short).
