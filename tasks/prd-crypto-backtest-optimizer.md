# PRD: Crypto Moving Average Backtest Optimizer

## Introduction

A Next.js application that backtests Simple Moving Average (SMA) trading strategies with leverage and ATR trailing stop loss optimization for cryptocurrency trading. Users upload historical price data via CSV, and the app exhaustively tests all combinations of SMAs (20D-160D), leverage ratios (1x-3x), and ATR stop loss configurations to identify the optimal strategy. Results compare strategy performance against simple buy-and-hold.

## Goals

- Enable exhaustive backtesting of SMA-based strategies across 11,340+ parameter combinations
- Support SHORT positions with inverse profit mechanics (profit when price drops)
- Implement leverage optimization (1x-3x in 0.25x increments) with separate LONG/SHORT ratios
- Include optional ATR trailing stop loss (triggers once per position, funds held on sideline)
- Calculate fees based on notional value (position size × leverage)
- Handle liquidation scenarios (balance ≤ $0) while continuing to test other configurations
- Display optimal strategy with comprehensive metrics vs buy-and-hold baseline
- Provide day-by-day performance tracking and SMA comparison heatmap

## Functional Requirements

**FR-1: CSV Data Import**

- System must accept CSV files with headers: time, high, low, close, RSI, date
- Date format must be DD-MM-YYYY
- Must reject files with <160 days of data
- Must validate all required columns are present and non-empty

**FR-2: SMA Calculation**

- Calculate Simple Moving Average for periods 20D through 160D
- SMA = sum of last N close prices / N
- All strategies skip first 160 days for fair comparison baseline

**FR-3: Position Logic**

- LONG position when close > SMA: profit = (new_price / entry_price - 1) × position_value
- SHORT position when close < SMA: profit = (entry_price / new_price - 1) × position_value
- Position value = account_balance × leverage
- Close existing position before opening opposite position

**FR-4: Leverage Application**

- Test LONG leverage: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0
- Test SHORT leverage: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0
- LONG and SHORT leverage are independent (can differ)
- Position value = balance × leverage

**FR-5: Fee Calculation**

- Deduct fee on each position open and close
- Fee = position_value × leverage × fee_rate
- Example: $1000 balance, 2x leverage, 0.1% fee = $1000 × 2 × 0.001 = $2 fee

**FR-6: ATR Trailing Stop Loss**

- Calculate ATR based on high-low range over period (10, 14, or 20 days)
- Track highest HIGH when LONG, lowest LOW when SHORT
- Trigger stop once per position when price moves against position by (ATR × multiplier)
- Close specified percentage (10%, 25%, 50%, or 100%)
- Hold closed funds on sideline without leverage
- Combine sideline + remaining position value when position reverses

**FR-7: Liquidation Detection**

- Check if balance ≤ $0 after each trade
- Mark configuration as liquidated, record date and final balance
- Continue testing other configurations

**FR-8: Buy-and-Hold Baseline**

- Calculate baseline: starting_capital × (final_price / day_160_price)
- Use day 160 as baseline purchase date for fair comparison

**FR-9: Exhaustive Optimization**

- Test every combination of SMA × LONG leverage × SHORT leverage × (ATR configs if enabled)
- Display live progress with percentage complete
- Identify configuration with highest final portfolio value

**FR-10: Results Visualization**

- Display optimal strategy parameters and metrics prominently
- Show SMA comparison table with color-coded performance
- Show day-by-day progression table for optimal strategy
- All tables must be sortable and responsive

## Non-Goals (Out of Scope)

- Multiple asset comparison in single run (one CSV at a time)
- Real-time trading execution or API integration with exchanges
- Portfolio optimization across multiple assets
- Transaction gas fees or slippage modeling
- Advanced order types (limit orders, market orders, stop-limit)
- Backtesting strategies other than SMA-based (no EMA, RSI strategies, etc.)
- Historical data fetching from external APIs
- User authentication or saved strategy configurations
- PDF or Excel export of results (CSV export only via browser if needed)
- Partial position scaling (beyond ATR stop loss)
- Compound interest or reinvestment modeling
- Tax calculations or reporting

## Technical Considerations

### Architecture

- Next.js App Router with server actions for CSV processing
- Client-side optimization execution (Web Workers for non-blocking computation)
- ShadCN components for UI (Button, Input, Card, Table, Progress, Badge)
- TailwindCSS for styling and color scales

### Performance

- Web Worker for backtest calculations to prevent UI blocking
- Virtualized tables for day-by-day data (thousands of rows)
- Memoize SMA calculations across configurations
- Progress updates every 100 configurations (not every single one)

### Data Structures

```typescript
type Position = 'LONG' | 'SHORT' | 'NONE'

interface PriceData {
  date: string // DD-MM-YYYY
  high: number
  low: number
  close: number
  rsi: number
}

interface StrategyConfig {
  sma: number // 20-160
  longLeverage: number // 1-3 in 0.25 increments
  shortLeverage: number // 1-3 in 0.25 increments
  atrEnabled: boolean
  atrPeriod?: 10 | 14 | 20
  atrMultiplier?: 2 | 2.5 | 3 | 3.5 | 4
  atrClosePercent?: 10 | 25 | 50 | 100
}

interface BacktestResult {
  config: StrategyConfig
  finalValue: number
  liquidated: boolean
  liquidationDate?: string
  percentGain: number
  percentVsHold: number
  trades: number
}
```

### State Management

- React state for UI inputs and results
- Web Worker message passing for backtest progress
- No external state management library needed

## Success Metrics

- User can upload CSV and see results in <30 seconds for configs without ATR
- Optimization progress updates smoothly without UI lag
- Results tables render instantly with virtualization for 10,000+ rows
- Backtest calculations match expected values (unit tested against known scenarios)
- All components accessible and responsive on mobile/tablet/desktop
- Zero TypeScript errors (`bun run typecheck`)

## Open Questions

1. Should we provide sample CSV files for testing?
2. Should users be able to export optimized strategy parameters as JSON for future reference?
3. Do we need ability to compare results between multiple CSV uploads (e.g., BTC vs ETH)?
4. Should liquidated configurations be excluded from the SMA comparison table or shown with warning?
5. For very large datasets (>1000 days), should we implement result caching between runs?
6. Should we add a "quick test" mode that tests fewer combinations (e.g., every 10th SMA, every other leverage)?

## Implementation Notes

### ATR Calculation

```
True Range = max(high - low, abs(high - prev_close), abs(low - prev_close))
ATR = moving average of True Range over period
```

### SHORT Position Profit Calculation

```
Entry: price = $50,000, position_value = $10,000 × 2x = $20,000
Exit: price = $40,000 (20% drop)
Profit: (50000 / 40000 - 1) × 20000 = 0.25 × 20000 = $5,000 gain
New balance: $10,000 + $5,000 = $15,000
```

### Liquidation Example

```
Balance: $1,000
Leverage: 3x
Position value: $3,000 LONG at $50,000
Price drops to $48,333 (-3.33%)
Loss: $3,000 × 0.0333 = $100
Fee to close: $3,000 × 3 × 0.001 = $9
New balance: $1,000 - $100 - $9 = $891
If price drops further causing balance ≤ $0 → LIQUIDATED
```

### Day 160 Warmup Logic

```
Day 1-160: Load data, calculate SMAs, no trading
Day 161: First possible trade execution
- All strategies start with same starting capital on same day
- Buy-and-hold baseline also purchases on day 161
```
