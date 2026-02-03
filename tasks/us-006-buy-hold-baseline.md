# US-006: Buy-and-Hold Baseline Calculation

**Description:** As a user, I want to see how much I would have made by simply buying and holding the asset so I can compare strategy performance.

## Acceptance Criteria

- [ ] Calculate: (starting_capital / price_on_day_160) × price_on_final_day
- [ ] Use day 160 as purchase date (same start as strategy)
- [ ] Display baseline value prominently alongside optimal strategy
- [ ] Calculate percentage gain for buy-and-hold: ((final - starting) / starting) × 100
- [ ] Typecheck passes

## Calculation Logic

```typescript
function calculateBuyAndHold(
  startingCapital: number,
  priceData: PriceData[]
): number {
  const day160Price = priceData[159].close; // Day 160 (0-indexed)
  const finalPrice = priceData[priceData.length - 1].close;

  const shares = startingCapital / day160Price;
  const finalValue = shares * finalPrice;

  return finalValue;
}
```

## Example

```
Starting capital: $10,000
Day 160 price: $40,000
Final day price: $60,000

Shares purchased: $10,000 / $40,000 = 0.25 BTC
Final value: 0.25 × $60,000 = $15,000

Percentage gain: (($15,000 - $10,000) / $10,000) × 100 = 50%
```

## Display Requirements

### Prominent Display
- Show in results header section
- Label: "Buy & Hold Baseline"
- Format: "$15,000.00 (+50.0%)"

### Comparison Metrics
For each strategy result:
- **% vs Hold**: `((strategy_final - hold_final) / hold_final) × 100`
- Example: Strategy final = $18,000, Hold = $15,000
  - % vs Hold = (($18,000 - $15,000) / $15,000) × 100 = +20%

### Visual Indicators
- Green if strategy outperforms hold
- Red if strategy underperforms hold
- Yellow if within ±5% of hold
