# US-004: ATR Trailing Stop Loss Implementation

**Description:** As a developer, I need to implement ATR trailing stop loss that triggers once per position and holds funds on sideline until position reverses.

## Acceptance Criteria

- [ ] Calculate ATR using high/low data for configurable period (10/14/20)
- [ ] Track highest HIGH when LONG, lowest LOW when SHORT
- [ ] Trigger stop when: LONG and price drops to (highest_high - ATR × multiplier), or SHORT and price rises to (lowest_low + ATR × multiplier)
- [ ] On trigger, close specified percentage (10%/25%/50%/100%) once per position
- [ ] Hold closed funds on sideline (do not apply leverage to sideline funds)
- [ ] Remaining position continues with original leverage until SMA cross
- [ ] When position reverses, combine remaining position value + sideline funds as new position capital
- [ ] Reset highest/lowest tracking on SMA cross
- [ ] Typecheck passes

## ATR Calculation

```typescript
function calculateATR(high: number[], low: number[], close: number[], period: number): number[] {
  const trueRange: number[] = [];

  for (let i = 0; i < high.length; i++) {
    if (i === 0) {
      trueRange.push(high[i] - low[i]);
    } else {
      const tr = Math.max(
        high[i] - low[i],
        Math.abs(high[i] - close[i - 1]),
        Math.abs(low[i] - close[i - 1])
      );
      trueRange.push(tr);
    }
  }

  // Calculate SMA of true range
  return calculateSMA(trueRange, period);
}
```

## Stop Loss Logic

### LONG Position
1. Track `highestHigh` since position opened
2. Each day: `highestHigh = Math.max(highestHigh, currentHigh)`
3. Stop trigger: `currentPrice <= highestHigh - (ATR × multiplier)`
4. On trigger (once only):
   - Close `closePercent%` of position
   - Move closed funds to sideline
   - Remaining position continues with original leverage

### SHORT Position
1. Track `lowestLow` since position opened
2. Each day: `lowestLow = Math.min(lowestLow, currentLow)`
3. Stop trigger: `currentPrice >= lowestLow + (ATR × multiplier)`
4. On trigger (once only):
   - Close `closePercent%` of position
   - Move closed funds to sideline
   - Remaining position continues with original leverage

## Example Scenario

```
Initial: $10,000 balance, 2x leverage, LONG at $50,000
Position value: $20,000
ATR: $1,000, Multiplier: 3, Close%: 50%

Day 1: Price $52,000, highestHigh = $52,000
Day 2: Price $51,000, highestHigh = $52,000
Day 3: Price $48,500 (drops to $52,000 - $3,000)
  → STOP TRIGGERED
  → Close 50% of position ($10,000 worth)
  → Realize P&L on closed portion: ($48,500/$50,000 - 1) × $10,000 = -$300
  → Sideline: $10,000 - $300 = $9,700
  → Remaining position: $10,000 at 2x leverage (continues)

Day 10: SMA cross, position reverses to SHORT
  → Close remaining LONG position (realize P&L)
  → New capital = remaining position value + sideline ($9,700)
  → Open SHORT with combined capital
  → Reset lowestLow tracking
```

## Configuration Matrix

When ATR enabled, test all combinations:
- **Periods**: [10, 14, 20]
- **Multipliers**: [2, 2.5, 3, 3.5, 4]
- **Close %**: [10, 25, 50, 100]
- **Total ATR configs**: 3 × 5 × 4 = 60

Combined with base: 11,421 × 60 = 685,260 total configurations
