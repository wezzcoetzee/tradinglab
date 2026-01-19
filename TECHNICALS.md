# BTC Trading Strategy - Technical Documentation

This document describes the Excel-based BTC trading model (`data/btc 2025-10.xlsm`) that serves as the reference implementation for this application.

## Overview

The model implements a moving average crossover strategy for Bitcoin trading, supporting both Simple Moving Average (SMA) and Exponential Moving Average (EMA) indicators. It calculates trading signals, applies leverage and fees, and compares strategy performance against a buy-and-hold benchmark.

## Workbook Structure

| Sheet | Purpose |
|-------|---------|
| **data** | Historical BTC prices with all trading calculations (~3927 rows) |
| **inputs and tables** | Configuration parameters and sensitivity analysis |
| **charts** | 4 charts visualizing optimization results |

---

## Input Parameters

All configurable inputs are located in the **inputs and tables** sheet.

### Strategy Parameters

| Cell | Parameter | Default | Description |
|------|-----------|---------|-------------|
| N9 | SMA Duration | 44 | Period for Simple Moving Average calculation |
| N10 | EMA Duration | 44 | Period for Exponential Moving Average calculation |
| K15 | Buy on Long Signal? | 1 | Enable long positions (1=true, 0=false) |
| K16 | Short on Short Signal? | 1 | Enable short positions (1=true, 0=false) |
| K17 | Long Leverage | 2.25x | Leverage multiplier for long positions |
| K18 | Short Leverage | 1x | Leverage multiplier for short positions |

### Capital & Fees

| Cell | Parameter | Default | Description |
|------|-----------|---------|-------------|
| K20 | Initial Capital | $1,000 | Starting portfolio value in USD |
| K21 | Gas Fee | $0 | Fixed fee per trade in USD |
| K22 | Exchange Fee | 0.05% | Percentage fee per trade |

### Optimization Settings

| Cell | Parameter | Default | Description |
|------|-----------|---------|-------------|
| K3 | Maximum MA Duration | 200 | Upper bound for MA period optimization |
| K5 | Data Points per Year | 365 | Used for annualized return calculations |

---

## Data Sheet Structure

The **data** sheet contains historical prices and all intermediate calculations.

### Column Layout

| Column | Content | Description |
|--------|---------|-------------|
| A | Index | Row number for reference |
| B | Timestamp | Unix timestamp of the price point |
| C | Close Price | BTC closing price in USD |
| D | Date | Human-readable date (calculated from timestamp) |
| F | SMA | Simple Moving Average value |
| G | EMA | Exponential Moving Average value |
| J | Long SMA Signal | Trading signal based on SMA (1=long, 0=short) |
| K | Long EMA Signal | Trading signal based on EMA (1=long, 0=short) |
| N | HODL Equity | Buy-and-hold equity curve |
| O | SMA Trading Equity | Strategy equity curve using SMA signals |
| P | EMA Trading Equity | Strategy equity curve using EMA signals |
| R | SMA Max Drawdown | Running maximum drawdown for SMA strategy |
| S | HODL Max Drawdown | Running maximum drawdown for buy-and-hold |

---

## Calculation Logic

### Simple Moving Average (SMA)

```
SMA = AVERAGE(Close[row - period + 1] : Close[row])
```

The SMA is the arithmetic mean of the closing prices over the specified period.

### Exponential Moving Average (EMA)

The EMA uses a smoothing factor that gives more weight to recent prices.

**First value (initialization):**

```
EMA[period] = SMA[period]
```

**Subsequent values:**

```
EMA[row] = EMA[row-1] + (2 / (period + 1)) * (Close[row] - EMA[row-1])
```

The smoothing multiplier `2 / (period + 1)` is the standard EMA formula.

### Signal Generation

Signals are generated with hysteresis to prevent whipsawing:

```
IF price < MA * (1 - threshold) THEN signal = 0 (short/neutral)
ELSE IF price > MA * (1 + threshold) THEN signal = 1 (long)
ELSE signal = previous_signal (maintain position)
```

**Signal values:**

- `1` = Long position (bullish, price above MA)
- `0` = Short/neutral position (bearish, price below MA)

### Trading Equity Calculation

The equity curve is calculated by applying:

1. **Daily returns** based on position and price changes
2. **Leverage** multiplier (different for long vs short positions)
3. **Exchange fees** deducted on signal changes (position switches)
4. **Gas fees** deducted as fixed cost on each trade

```
If signal changes:
    equity = equity * (1 - exchange_fee) - gas_fee

Daily return = price_change_pct * leverage * signal_direction
equity = equity * (1 + daily_return)
```

### Maximum Drawdown

Tracked as a running calculation:

```
peak = MAX(peak, current_equity)
drawdown = (peak - current_equity) / peak
max_drawdown = MAX(max_drawdown, drawdown)
```

---

## Output Metrics

### Performance Summary (inputs and tables sheet)

| Cell | Metric | Description |
|------|--------|-------------|
| K26 | HODL Return Factor | Total return multiple for buy-and-hold |
| L26 | HODL Annualized Return | Annualized percentage return for HODL |
| K27 | SMA Return Factor | Total return multiple for SMA strategy |
| L27 | SMA Annualized Return | Annualized percentage return for SMA |
| K28 | EMA Return Factor | Total return multiple for EMA strategy |
| L28 | EMA Annualized Return | Annualized percentage return for EMA |
| P12 | Max Drawdown HODL | Maximum peak-to-trough decline for HODL |
| Q12 | Max Drawdown SMA | Maximum peak-to-trough decline for SMA |

### Annualized Return Calculation

```
years = data_points / data_points_per_year
annualized_return = (return_factor ^ (1 / years)) - 1
```

---

## Sensitivity Analysis

### MA Duration Optimization

Located in columns B-F, rows 5-200+ of the **inputs and tables** sheet.

Tests each MA period from 1 to maximum duration and records:

- SMA annualized return
- EMA annualized return
- HODL annualized return (constant baseline)

This data populates the optimization charts.

### Leverage Sensitivity

Located in columns J-N, rows 33+ of the **inputs and tables** sheet.

Shows strategy performance at different leverage levels to identify optimal leverage for the given MA parameters.

---

## Charts

The **charts** sheet contains 4 visualizations:

1. **SMA Optimization Curve** - Annualized returns vs MA period for SMA strategy
2. **EMA Optimization Curve** - Annualized returns vs MA period for EMA strategy
3. **Strategy Comparison** - Overlay of SMA, EMA, and HODL returns across periods
4. **Leverage Sensitivity** - Returns at different leverage multipliers

---

## Data Requirements

### Input Price Data Format

| Field | Type | Description |
|-------|------|-------------|
| Timestamp | Unix integer | Seconds since epoch (UTC) |
| Close | Decimal | Closing price in USD |

The model expects daily price data. Data should be sorted chronologically (oldest first).

### Minimum Data Requirements

- At least `MAX_MA_DURATION + 1` data points for valid calculations
- Consistent time intervals (daily recommended)
- No missing price data within the series

---

## Usage Instructions

### Basic Backtesting

1. Update price data in the **data** sheet (columns B, C)
2. Set desired MA periods in cells N9 (SMA) and N10 (EMA)
3. Configure leverage in cells K17 and K18
4. Review results in cells K26-L28

### Optimization

1. Set maximum MA duration in cell K3
2. Review optimization tables in **inputs and tables** sheet
3. Identify optimal MA period from charts
4. Apply optimal period to N9/N10 for detailed analysis

### Parameter Sensitivity

Adjust parameters individually and observe impact on:

- Return factor vs HODL baseline
- Maximum drawdown
- Signal frequency (more trades = more fees)

---

## Implementation Notes

This Excel model serves as the reference implementation. The web application (`src/lib/calculations/`) mirrors these calculations:

| Excel | Application |
|-------|-------------|
| SMA/EMA formulas | `src/lib/calculations/indicators.ts` |
| Signal generation | `src/lib/calculations/signals.ts` |
| Return calculations | `src/lib/calculations/returns.ts` |
| Optimization loop | `src/lib/calculations/optimizer.ts` |

When making changes, ensure both implementations remain synchronized.
