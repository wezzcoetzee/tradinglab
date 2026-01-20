# PRD: ATR-Based Trailing Stop Loss

## Introduction

Add an ATR-based trailing stop loss exit mechanism to the existing BTC SMA trading strategy. The trailing stop protects profits by dynamically adjusting the exit price based on the Average True Range (ATR) indicator. Entry logic remains unchanged (long when Close > 44-period SMA, short when Close < 44-period SMA).

## Goals

- Implement ATR(14) calculation using close-to-close approximation
- Add trailing stop logic that only tightens, never loosens
- Protect profits on winning trades while allowing room for normal volatility
- Expose ATR multiplier (k) as a configurable parameter (default: 2.5)
- Maintain full compatibility with existing backtest infrastructure

## User Stories

### US-001: Add ATR calculation module (close-only approximation)
**Description:** As a developer, I need ATR values calculated for each bar so the trailing stop can use them.

**Acceptance Criteria:**
- [ ] Create `lib/backtest/atr.ts` with `calculateAtr(closePrices: number[], period: number): (number | null)[]`
- [ ] True Range approximation: `TR = abs(close - previousClose)` (close-to-close volatility)
- [ ] ATR is simple moving average of TR over `period` bars
- [ ] Returns `null` for bars with insufficient data (< period + 1 bars, since we need previous close)
- [ ] Typecheck passes

**Note:** Using close-to-close approximation instead of traditional high-low-close ATR since database only stores close prices. This is less accurate but functional.

### US-002: Extend simulator state for trailing stop tracking
**Description:** As a developer, I need to track the highest/lowest close since entry to calculate the trailing stop price.

**Acceptance Criteria:**
- [ ] Add `highestCloseSinceEntry: number | null` to `SimulatorState`
- [ ] Add `lowestCloseSinceEntry: number | null` to `SimulatorState`
- [ ] Initialize to `null` when no position, set to entry close when position opens
- [ ] Update on each bar while position is open
- [ ] Typecheck passes

### US-003: Add ATR multiplier parameter
**Description:** As a user, I want to configure the ATR multiplier (k) to control how tight the trailing stop is.

**Acceptance Criteria:**
- [ ] Add `atrMultiplier: number` to `BacktestParams` (default: 2.5)
- [ ] Add `atrPeriod: number` to `BacktestParams` (default: 14)
- [ ] Expose in UI form with validation (k > 0)
- [ ] Typecheck passes

### US-004: Implement trailing stop exit logic for long positions
**Description:** As a trader, I want my long position to exit when price falls below the trailing stop.

**Acceptance Criteria:**
- [ ] On position open: `highestCloseSinceEntry = closePrice`
- [ ] On each bar: `highestCloseSinceEntry = max(highestCloseSinceEntry, closePrice)`
- [ ] Calculate `stopPrice = highestCloseSinceEntry - (k * ATR)`
- [ ] Exit long if `closePrice < stopPrice`
- [ ] Stop must only tighten (higher stop price), never loosen
- [ ] Typecheck passes

### US-005: Implement trailing stop exit logic for short positions
**Description:** As a trader, I want my short position to exit when price rises above the trailing stop.

**Acceptance Criteria:**
- [ ] On position open: `lowestCloseSinceEntry = closePrice`
- [ ] On each bar: `lowestCloseSinceEntry = min(lowestCloseSinceEntry, closePrice)`
- [ ] Calculate `stopPrice = lowestCloseSinceEntry + (k * ATR)`
- [ ] Exit short if `closePrice > stopPrice`
- [ ] Stop must only tighten (lower stop price), never loosen
- [ ] Typecheck passes

### US-006: Add unit tests for ATR calculation
**Description:** As a developer, I need tests to verify ATR calculation correctness.

**Acceptance Criteria:**
- [ ] Create `src/lib/calculations/atr.test.ts`
- [ ] Test happy path with known values
- [ ] Test edge cases (insufficient data, single bar, negative prices)
- [ ] Test rolling calculation correctness against naive implementation
- [ ] All tests pass

### US-007: Add unit tests for trailing stop logic
**Description:** As a developer, I need tests to verify trailing stop behavior.

**Acceptance Criteria:**
- [ ] Test long position stop triggers correctly
- [ ] Test short position stop triggers correctly
- [ ] Test stop only tightens, never loosens
- [ ] Test stop does not trigger prematurely
- [ ] Test interaction with existing entry/exit logic
- [ ] All tests pass

### US-008: Validate with backtest
**Description:** As a developer, I need to verify the trailing stop works correctly in full backtest.

**Acceptance Criteria:**
- [ ] Run backtest with ATR trailing stop enabled
- [ ] Verify trades exit at expected stop prices
- [ ] Compare performance metrics with/without trailing stop
- [ ] No regression in existing backtest functionality
- [ ] Build passes

## Functional Requirements

- FR-1: Calculate ATR(14) using close-to-close approximation: `TR = |close - prevClose|`
- FR-2: Track highest close since entry for long positions
- FR-3: Track lowest close since entry for short positions
- FR-4: For long: exit when `close < highestClose - (k * ATR)`
- FR-5: For short: exit when `close > lowestClose + (k * ATR)`
- FR-6: Trailing stop must only tighten (move in profitable direction), never loosen
- FR-7: Use close price (not intrabar price) for all stop evaluations
- FR-8: Default ATR period = 14, default multiplier k = 2.5
- FR-9: Both parameters must be configurable via BacktestParams

## Non-Goals

- No partial position exits
- No modification to entry logic (SMA crossover unchanged)
- No intrabar stop evaluation (close price only)
- No stop-and-reverse (exit on stop does not trigger opposite position)
- No time-based stops or profit targets

## Technical Considerations

- Follow existing `sma.ts` pattern for `atr.ts` module structure
- Using close-to-close approximation for ATR (no high/low data required)
- Trailing stop state resets on position close
- Stop evaluation happens after SMA signal check in simulation loop
- Maintain backward compatibility - trailing stop should be optional (disable when k=0 or atrPeriod=0)

## Success Metrics

- Trailing stop triggers at mathematically correct prices
- No false exits (stop triggers only when condition met)
- Backtest results show expected behavior on historical data
- All existing tests continue to pass
- Type safety maintained (no `any` casts)

## Open Questions

- Should trailing stop exit override SMA signal? (e.g., SMA says stay long but stop triggered)
  - **Proposed**: Yes, stop takes priority - it's a risk management override
- Should there be a UI toggle to enable/disable trailing stop entirely?
  - **Proposed**: Yes, set k=0 to disable

---

## Files to Modify

| File | Change |
|------|--------|
| `lib/backtest/atr.ts` | NEW - ATR calculation (close-to-close approximation) |
| `lib/backtest/types.ts` | Extend SimulatorState, BacktestParams |
| `lib/backtest/simulator.ts` | Add trailing stop logic in simulation loop |
| `lib/backtest/index.ts` | Export ATR module |
| `src/lib/calculations/atr.test.ts` | NEW - ATR unit tests |
| `components/backtest/backtest-form.tsx` | Add k and atrPeriod parameter inputs |

## Verification

1. Run `npm run test` - all tests pass
2. Run `npm run build` - no type errors
3. Run backtest with k=2.5 and verify stop triggers appear in results
4. Compare backtest with k=0 (disabled) to confirm baseline unchanged
