# PRD: ATR-Based Trailing Stop Loss

## Introduction

Add an ATR-based trailing stop loss mechanism to the existing BTC trading strategy's backtest system. This feature enhances exit logic by dynamically adjusting stop levels based on market volatility, allowing partial position exits and full audit trail logging. Entry logic (44 SMA crossover) remains unchanged.

## Goals

- Implement configurable ATR-based trailing stop for long and short positions
- Provide UI form for parameter configuration with validation
- Support partial position closes when stop triggers
- Generate full audit trail with position details and P&L on each stop event
- Measure all drawdowns using closing prices only

## User Stories

### US-001: Add ATR Configuration Parameters
**Description:** As a trader, I want to configure ATR parameters through a UI form so that I can optimize the trailing stop for different market conditions.

**Acceptance Criteria:**
- [ ] ATR Period input field with default value 14
- [ ] ATR Period validates range 5-50 (reject values outside)
- [ ] ATR Multiplier (k) input field with default value 2.5
- [ ] ATR Multiplier validates range 1.0-10.0 (reject values outside)
- [ ] Partial Close Percentage input field with default value 100%
- [ ] Partial Close Percentage validates range 1-100 (reject values outside)
- [ ] Form shows validation errors inline when bounds violated
- [ ] Typecheck/lint passes

### US-002: Implement ATR Calculation
**Description:** As a developer, I need ATR calculated correctly so that trailing stops use accurate volatility measurements.

**Acceptance Criteria:**
- [ ] True Range = max(high-low, abs(high-prev_close), abs(low-prev_close))
- [ ] ATR = RMA (Wilder's smoothing) of True Range over configured period
- [ ] ATR recalculates on each bar
- [ ] ATR uses configurable period (not hardcoded)
- [ ] Typecheck/lint passes

### US-003: Implement Trailing Stop for Long Positions
**Description:** As a trader, I want a trailing stop that follows price up during long positions so that I lock in profits while allowing room for volatility.

**Acceptance Criteria:**
- [ ] On entry bar: highest_since_entry = close
- [ ] Each subsequent bar: highest_since_entry = max(highest_since_entry, close)
- [ ] stop_price = highest_since_entry - (k * ATR)
- [ ] Stop only moves up (tightens), never down (ratchet behavior)
- [ ] Exit triggers when close < stop_price
- [ ] All comparisons use closing price only
- [ ] Typecheck/lint passes

### US-004: Implement Trailing Stop for Short Positions
**Description:** As a trader, I want a trailing stop that follows price down during short positions so that I lock in profits on downtrends.

**Acceptance Criteria:**
- [ ] On entry bar: lowest_since_entry = close
- [ ] Each subsequent bar: lowest_since_entry = min(lowest_since_entry, close)
- [ ] stop_price = lowest_since_entry + (k * ATR)
- [ ] Stop only moves down (tightens), never up (ratchet behavior)
- [ ] Exit triggers when close > stop_price
- [ ] All comparisons use closing price only
- [ ] Typecheck/lint passes

### US-005: Implement Partial Position Close
**Description:** As a trader, I want to close only a percentage of my position when the trailing stop triggers so that I can take partial profits while letting the remainder run.

**Acceptance Criteria:**
- [ ] When stop triggers, close configured percentage (e.g., 50%) of position
- [ ] Remaining position continues until SMA signal reverses
- [ ] Remaining position ignores further ATR stop triggers
- [ ] Partial close percentage configurable via UI (1-100%)
- [ ] 100% = full close (original behavior)
- [ ] Typecheck/lint passes

### US-006: Implement Audit Trail Logging
**Description:** As a trader, I want a complete audit trail when stops trigger so that I can analyze my strategy performance.

**Acceptance Criteria:**
- [ ] Log entry timestamp (bar date/time)
- [ ] Log position direction (long/short)
- [ ] Log entry price
- [ ] Log exit price (close price that triggered stop)
- [ ] Log stop_price at trigger
- [ ] Log highest/lowest_since_entry value
- [ ] Log ATR value at trigger
- [ ] Log position size closed (quantity)
- [ ] Log remaining position size (if partial)
- [ ] Log realized P&L for closed portion
- [ ] Log percentage return
- [ ] Audit trail exportable/viewable in backtest results
- [ ] Typecheck/lint passes

### US-007: Integrate with Existing Backtest System
**Description:** As a trader, I want the ATR trailing stop to work seamlessly with the existing backtest so that I can compare results with and without the feature.

**Acceptance Criteria:**
- [ ] Entry logic unchanged (long when Close > 44 SMA, short when Close < 44 SMA)
- [ ] ATR trailing stop only affects exit logic
- [ ] Backtest can run with ATR stop enabled or disabled
- [ ] Results summary includes ATR stop statistics (# of stops triggered, avg gain/loss)
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: UI form must include ATR Period input (integer, default 14, range 5-50)
- FR-2: UI form must include ATR Multiplier input (decimal, default 2.5, range 1.0-10.0)
- FR-3: UI form must include Partial Close Percentage input (integer, default 100, range 1-100)
- FR-4: Form inputs must show inline validation errors when out of bounds
- FR-5: ATR calculation must use Wilder's RMA smoothing method
- FR-6: ATR period must be configurable, not hardcoded
- FR-7: Trailing stop for longs: stop_price = highest_close_since_entry - (k * ATR)
- FR-8: Trailing stop for shorts: stop_price = lowest_close_since_entry + (k * ATR)
- FR-9: Stop levels must only tighten (ratchet), never loosen
- FR-10: All price comparisons for stop triggers must use closing price only
- FR-11: Partial close must exit configured percentage, remainder holds until SMA reversal
- FR-12: After partial close, remaining position ignores ATR stop (exits only on SMA signal)
- FR-13: Each stop trigger must generate audit log with full position and P&L details
- FR-14: Backtest must support toggle to enable/disable ATR trailing stop

## Non-Goals

- No live trading implementation (backtest only)
- No intrabar price checks (closing price only)
- No multiple partial exits (one partial close per position maximum)
- No automatic parameter optimization
- No priority-based notifications or alerts

## Technical Considerations

- Integrate with existing backtest engine and data pipeline
- ATR calculation should be efficient for large datasets
- Audit trail storage should not significantly impact backtest performance
- UI form should use existing form components if available
- Consider caching ATR values to avoid recalculation

## Success Metrics

- Backtest completes within 2x time of non-ATR backtest
- All ATR stop triggers logged with complete audit data
- Parameter validation prevents invalid configurations
- Partial close accurately reflects configured percentage

## Open Questions

- Should there be preset parameter combinations (conservative/moderate/aggressive)?
- Should audit trail be stored in database or exportable CSV/JSON?
- What date range should be used for initial ATR calculation warmup period?
