# US-003: Backtest Engine Core Logic

**Description:** As a developer, I need the backtest engine to simulate trading across all parameter combinations with correct SMA, leverage, and position mechanics.

## Acceptance Criteria

- [ ] Skip first 160 days (warmup period) for all strategies to ensure fair comparison
- [ ] Calculate SMA for periods 20D-160D (141 total periods)
- [ ] Execute trades at 00:00 UTC daily based on close price vs SMA
- [ ] LONG position: close > SMA, profits when price rises
- [ ] SHORT position: close < SMA, profits when price falls (inverse)
- [ ] Position transitions: close existing position before opening opposite position
- [ ] Test leverage 1x-3x in 0.25x increments (9 values) separately for LONG and SHORT
- [ ] Position value = balance × leverage
- [ ] Deduct fees on each trade: fee = position_value × leverage × fee_rate
- [ ] Typecheck passes

## Position Logic

### LONG Position
- **Entry condition**: close > SMA
- **Profit calculation**: `(new_price / entry_price - 1) × position_value`
- **Example**: Entry at $50k, exit at $55k with $10k position @ 2x leverage
  - Position value = $10k × 2 = $20k
  - Profit = ($55k / $50k - 1) × $20k = 0.1 × $20k = $2k

### SHORT Position
- **Entry condition**: close < SMA
- **Profit calculation**: `(entry_price / new_price - 1) × position_value`
- **Example**: Entry at $50k, exit at $40k with $10k position @ 2x leverage
  - Position value = $10k × 2 = $20k
  - Profit = ($50k / $40k - 1) × $20k = 0.25 × $20k = $5k

## SMA Calculation

```typescript
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN); // Not enough data
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}
```

## Trading Rules

1. **Day 1-160**: Calculate SMAs, no trading
2. **Day 161+**: Execute daily trades at 00:00 UTC
3. **Position transitions**:
   - NONE → LONG: Open long position
   - NONE → SHORT: Open short position
   - LONG → SHORT: Close long, open short (2 fees)
   - SHORT → LONG: Close short, open long (2 fees)
   - LONG → NONE: Close long
   - SHORT → NONE: Close short

## Leverage Testing Matrix

- **LONG leverage**: [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0]
- **SHORT leverage**: [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0]
- **Total combinations**: 141 SMAs × 9 LONG × 9 SHORT = 11,421 configs
