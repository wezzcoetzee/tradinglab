# Product Requirements Document: SMA/EMA Backtesting Tool

## Overview

A simplified backtesting tool that compares SMA and EMA trading strategies against a HODL baseline for Bitcoin, matching the calculations in the btc.xlsm Excel reference.

## User Stories

### US-1: Configure Backtest Parameters

As a trader, I want to set my initial capital, exchange fees, and MA range so that I can customize the backtest to my trading conditions.

**Acceptance Criteria:**
- Input for initial capital (default: $1000)
- Input for exchange fee percentage (default: 0%)
- Input for gas fee per trade (default: $0)
- Input for MA period range (min: 2, max: 200)

### US-2: Configure Trading Signals

As a trader, I want to toggle whether to go LONG when above MA and/or SHORT when below MA, so that I can test different strategies.

**Acceptance Criteria:**
- Checkbox "Buy on Long Signal" (when price > MA, hold BTC vs hold cash)
- Checkbox "Short on Short Signal" (when price < MA, short BTC vs hold cash)
- Both checkboxes independent

### US-3: View Summary Results Table

As a trader, I want to see a table comparing returns for each MA period, so that I can identify the best performing SMA and EMA durations.

**Acceptance Criteria:**
- Table columns: Duration, SMA Return %, EMA Return %, HODL Return %
- Rows from smaMin to smaMax (e.g., 2 to 200)
- Color coding: green for positive returns, red for negative
- Sortable by any column
- Highlight row with best SMA and best EMA

### US-4: View Detailed Data Table

As a trader, I want to see day-by-day data for a selected MA period, so that I can analyze the trading signals and portfolio value over time.

**Acceptance Criteria:**
- Virtual scrolling for performance (potentially 2500+ rows)
- Columns: Day, Date, Close Price, SMA, EMA, SMA Signal, EMA Signal, HODL Value, SMA Balance, EMA Balance
- Click row in summary table to select period for detail view

### US-5: Match Excel Calculations

As a trader, I want the calculations to match the btc.xlsm reference file exactly, so that I can trust the results.

**Acceptance Criteria:**
- SMA = simple arithmetic mean of last N close prices
- EMA = exponential moving average with k = 2/(period+1)
- Signal = 1 if close > MA, else 0
- Fees applied on each position change (entering AND exiting)
- Results match Excel within rounding tolerance

## Out of Scope (for this iteration)

- Leverage
- ATR trailing stops
- Multiple assets
- Chart visualizations

## Technical Notes

- Use existing PostgreSQL database (PriceData table)
- Frontend: Next.js with ShadCN components
- Virtual scrolling library (@tanstack/react-virtual) for data table

## Calculation Logic

### SMA (Simple Moving Average)

```
SMA[i] = AVERAGE(Close[i-period+1] : Close[i])
```

### EMA (Exponential Moving Average)

```
k = 2 / (period + 1)
EMA[period-1] = SMA[period-1]  // First EMA = SMA
EMA[i] = Close[i] × k + EMA[i-1] × (1-k)
```

### Signals

```
SMA_Signal = Close > SMA ? 1 : 0
EMA_Signal = Close > EMA ? 1 : 0
```

### Portfolio Values

```
HODL = InitialCapital × (CurrentPrice / FirstPrice)

For SMA/EMA Trading:
- If buyOnLong=true and signal=1: Hold BTC
- If shortOnShort=true and signal=0: Short BTC
- If buyOnLong=false and signal=1: Hold cash
- If shortOnShort=false and signal=0: Hold cash
- Apply fee on each position change
```

## Verification Checklist

1. Run `bun dev` and test UI renders
2. Compare backtest results with Excel file for same inputs:
   - Initial capital: $1000
   - Fee: 0%
   - SMA range: 2-200
   - buyOnLong: true, shortOnShort: false
3. Verify summary table matches expected returns
4. Verify daily data table matches Sheet 1 for selected period
5. Run `bun run lint` and `bun run build`
