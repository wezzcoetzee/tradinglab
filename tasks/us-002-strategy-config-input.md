# US-002: Strategy Configuration Input

**Description:** As a user, I want to configure my starting capital and trading fees so the backtest reflects realistic trading conditions.

## Acceptance Criteria

- [ ] Input field for starting capital (dollar amount, default $10,000)
- [ ] Input field for trading fee (percentage, e.g., 0.1 for 0.1%)
- [ ] Fee is calculated as: notional_value × fee_rate (notional = position × leverage)
- [ ] Checkbox to enable/disable ATR trailing stop loss
- [ ] When ATR enabled, show dropdowns for: period (10/14/20), multiplier (2/2.5/3/3.5/4), close % (10%/25%/50%/100%)
- [ ] All inputs validate numeric ranges
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Configuration Options

### Base Settings
- **Starting Capital**: Number input, default $10,000, min $100
- **Trading Fee**: Percentage input, default 0.1%, typical range 0.05%-0.5%

### ATR Trailing Stop Loss (Optional)
- **Enable/Disable**: Checkbox
- **Period**: Dropdown [10, 14, 20] days
- **Multiplier**: Dropdown [2, 2.5, 3, 3.5, 4]
- **Close %**: Dropdown [10%, 25%, 50%, 100%]

## Technical Notes

### Fee Calculation
```typescript
// Example: $1,000 balance, 2x leverage, 0.1% fee
const positionValue = balance * leverage; // $2,000
const notionalValue = positionValue * leverage; // $4,000
const fee = notionalValue * feeRate; // $4,000 × 0.001 = $4
```

### Validation Rules
- Starting capital: positive number > 0
- Trading fee: 0 <= fee <= 100 (percentage)
- All ATR dropdowns: only allow specified values
