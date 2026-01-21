# Leverage Optimization PRD

## Overview

Introduce leverage optimization to the SMA/EMA backtesting strategy. The system will test all combinations of MA periods AND leverage settings to find the optimal configuration for maximizing returns while managing risk.

## Problem Statement

Currently, the backtest engine tests SMA/EMA periods from min to max but assumes 1x leverage for all positions. Real traders use varying leverage levels, and optimal leverage differs between LONG and SHORT positions based on market characteristics.

## Solution

Add independent LONG and SHORT leverage parameters that are optimized alongside MA period selection. The system will test all combinations and identify the best performing configuration including leverage.

---

## Technical Specifications

### Leverage Parameters

| Parameter | Range | Increment | Default |
|-----------|-------|-----------|---------|
| Long Leverage | 0.5x - 3x | 0.25 | 1x |
| Short Leverage | 0.5x - 3x | 0.25 | 1x |

**Leverage Values**: `[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]` (11 values each)

### Liquidation Logic

With leverage, a position can be liquidated (portfolio wiped out) if losses exceed the margin:

```
Liquidation Threshold = 100% / Leverage

Examples:
- 2x leverage: Liquidated at 50% adverse price move
- 3x leverage: Liquidated at 33.3% adverse price move
- 1x leverage: Cannot be liquidated (100% move impossible)
```

**LONG Liquidation**: If price drops by `(1 / longLeverage) * 100%` from entry, portfolio = 0
**SHORT Liquidation**: If price rises by `(1 / shortLeverage) * 100%` from entry, portfolio = 0

### Fee Calculation

When switching from LONG to SHORT (or vice versa), **2 trading fees** are incurred:
1. Exit fee from closing the current position
2. Entry fee for opening the new position

This is already handled in the current simulator but must be preserved with leverage.

### Portfolio Value with Leverage

**LONG Position**:
```
portfolioValue = entryCapital * (1 + (priceChange * longLeverage))
where priceChange = (currentPrice - entryPrice) / entryPrice
```

**SHORT Position**:
```
portfolioValue = entryCapital * (1 + (-priceChange * shortLeverage))
where priceChange = (currentPrice - entryPrice) / entryPrice
```

### Optimization Matrix

The engine will test all combinations:
- MA periods: `smaMin` to `smaMax` (e.g., 10 to 200 = 191 periods)
- Long leverage: 11 values
- Short leverage: 11 values
- MA types: SMA and EMA

**Total combinations per MA type**: `periods × 11 × 11 = periods × 121`

For 191 periods: `191 × 121 = 23,111 combinations per MA type`

### Performance Optimization

To manage computation:
1. **Single leverage mode**: When user sets a single leverage value (not a range), skip the leverage optimization loop
2. **Leverage range mode**: When user enables optimization, test all combinations
3. **Progress feedback**: Show optimization progress in UI

---

## User Stories

### US-1: Configure Long Leverage
**As a** trader
**I want to** set the leverage for LONG positions
**So that** I can amplify gains (and losses) when the strategy goes long

**Acceptance Criteria**:
- [ ] Slider or input for Long Leverage in the backtest form
- [ ] Range: 0.5x to 3x
- [ ] Increment: 0.25
- [ ] Default: 1x
- [ ] Displays current value clearly

### US-2: Configure Short Leverage
**As a** trader
**I want to** set the leverage for SHORT positions
**So that** I can amplify gains (and losses) when the strategy goes short

**Acceptance Criteria**:
- [ ] Slider or input for Short Leverage in the backtest form
- [ ] Range: 0.5x to 3x
- [ ] Increment: 0.25
- [ ] Default: 1x
- [ ] Displays current value clearly

### US-3: Enable Leverage Optimization
**As a** trader
**I want to** enable leverage optimization mode
**So that** the system finds the best LONG/SHORT leverage combination

**Acceptance Criteria**:
- [ ] Toggle to enable/disable leverage optimization
- [ ] When disabled: Use fixed leverage values from US-1 and US-2
- [ ] When enabled: Test all leverage combinations (0.5x to 3x)
- [ ] Clear indication of which mode is active

### US-4: Liquidation Handling
**As a** trader
**I want** the backtest to accurately simulate liquidation events
**So that** I understand the real risk of using leverage

**Acceptance Criteria**:
- [ ] Portfolio value drops to 0 when liquidation threshold is breached
- [ ] LONG: Liquidated if price drops by 1/leverage from entry
- [ ] SHORT: Liquidated if price rises by 1/leverage from entry
- [ ] Once liquidated, strategy cannot recover (stays at 0)
- [ ] Liquidation events are tracked and reported

### US-5: View Optimal Leverage in Results
**As a** trader
**I want to** see the optimal leverage alongside the best MA period
**So that** I know the complete optimal strategy configuration

**Acceptance Criteria**:
- [ ] Summary stats show best Long Leverage for SMA/EMA
- [ ] Summary stats show best Short Leverage for SMA/EMA
- [ ] Results table includes leverage columns when optimization is enabled
- [ ] Best result clearly displays: Period + Long Leverage + Short Leverage

### US-6: Portfolio Value Reflects Leverage
**As a** trader
**I want** daily portfolio values to reflect leveraged gains/losses
**So that** I can see the amplified equity curve

**Acceptance Criteria**:
- [ ] Daily data shows leveraged portfolio values
- [ ] Chart displays leveraged equity curve
- [ ] Drawdowns are accurately amplified by leverage

### US-7: Results Table with Leverage
**As a** trader
**I want to** see leverage information in the results table
**So that** I can compare different leverage configurations

**Acceptance Criteria**:
- [ ] MA Summary Table shows Long Leverage column
- [ ] MA Summary Table shows Short Leverage column
- [ ] Sortable by leverage columns
- [ ] When optimization disabled, leverage columns show fixed values

### US-8: Export Includes Leverage
**As a** trader
**I want** CSV exports to include leverage data
**So that** I can analyze results externally

**Acceptance Criteria**:
- [ ] CSV export includes longLeverage column
- [ ] CSV export includes shortLeverage column
- [ ] Export includes liquidation events if any occurred

---

## Implementation Plan

### Phase 1: Type Updates
1. Update `BacktestParams` to include leverage parameters
2. Update `MaResult` to include leverage info
3. Add `LeverageConfig` type
4. Update API request/response types

### Phase 2: Simulator Updates
1. Add leverage parameters to `SimulatorParams`
2. Implement leveraged P&L calculation for LONG
3. Implement leveraged P&L calculation for SHORT
4. Add liquidation detection and handling
5. Track liquidation events

### Phase 3: Engine Updates
1. Add leverage optimization loop to `runBacktest`
2. Modify result selection to consider leverage
3. Update `MaResult` generation with leverage data
4. Ensure performance with expanded search space

### Phase 4: UI Updates
1. Add Long Leverage input to BacktestForm
2. Add Short Leverage input to BacktestForm
3. Add Leverage Optimization toggle
4. Update SummaryStats to show optimal leverage
5. Update MaSummaryTable with leverage columns
6. Update PortfolioChart tooltips
7. Update CSV export

### Phase 5: Testing & Polish
1. Test liquidation scenarios
2. Test edge cases (0.5x leverage, 3x leverage)
3. Performance testing with full optimization
4. UI polish and responsive design

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/backtest/types.ts` | Add leverage types to interfaces |
| `lib/backtest/simulator.ts` | Implement leveraged calculations + liquidation |
| `lib/backtest/engine.ts` | Add leverage optimization loop |
| `app/api/backtest/route.ts` | Handle new parameters |
| `components/backtest/backtest-form.tsx` | Add leverage inputs + toggle |
| `components/backtest/summary-stats.tsx` | Display optimal leverage |
| `components/backtest/ma-summary-table.tsx` | Add leverage columns |
| `components/backtest/csv-export.tsx` | Include leverage in export |
| `hooks/use-url-params.ts` | Persist leverage params in URL |

---

## Out of Scope

- Margin calls / partial liquidation
- Variable leverage during a position
- Stop-loss orders (separate feature)
- Funding rates for perpetuals
- Cross vs Isolated margin modes

---

## Success Metrics

1. Users can find optimal leverage configuration
2. Liquidation events are accurately simulated
3. Performance remains acceptable (<10s for full optimization)
4. UI clearly communicates leverage risk
