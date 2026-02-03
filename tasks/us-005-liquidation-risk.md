# US-005: Liquidation and Risk Management

**Description:** As a developer, I need to detect liquidation events (balance ≤ $0) and mark those configurations as failed while continuing optimization.

## Acceptance Criteria

- [ ] Check balance after each trade and fee deduction
- [ ] If balance ≤ $0, mark configuration as "LIQUIDATED"
- [ ] Record liquidation date and final balance
- [ ] Stop processing that specific configuration, continue testing others
- [ ] Display liquidated configurations in results table with red indicator
- [ ] Typecheck passes

## Liquidation Detection

### Check Points
1. After closing a position (P&L realized)
2. After deducting trading fees
3. Before opening next position

### Logic
```typescript
function checkLiquidation(balance: number): boolean {
  return balance <= 0;
}

// In backtest loop
const newBalance = balance + profitLoss - tradingFee;
if (checkLiquidation(newBalance)) {
  return {
    liquidated: true,
    liquidationDate: currentDate,
    finalBalance: newBalance,
  };
}
```

## Liquidation Example

```
Initial: $1,000 balance
Leverage: 3x LONG
Position value: $3,000
Entry price: $50,000

Day 1: Price drops to $48,333 (-3.33%)
Loss on position: $3,000 × 0.0333 = $100
Fee to close: $3,000 × 3 × 0.001 = $9
New balance: $1,000 - $100 - $9 = $891

Day 2: Price drops to $46,000 (-8% from entry)
Loss on position: $3,000 × 0.08 = $240
Fee to close: $9
New balance: $891 - $240 - $9 = $642

Day 5: Price drops to $33,333 (-33.33% from entry)
Loss on position: $3,000 × 0.3333 = $1,000
Fee to close: $9
New balance: $642 - $1,000 - $9 = -$367

→ LIQUIDATED on Day 5
→ Record: { date: "05-01-2024", finalBalance: -$367 }
→ Stop testing this configuration
→ Continue with next configuration
```

## Results Display

### Table Indicator
- Show "LIQUIDATED" badge in red
- Display liquidation date
- Show final balance (negative)
- Row background: light red (#fee)
- Sort liquidated configs to bottom by default

### Metrics
- Total configurations tested
- Number liquidated
- Liquidation rate %
- Most common liquidation scenarios (high leverage + low SMA)
