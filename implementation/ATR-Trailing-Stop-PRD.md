# ATR Trailing Stop Loss - PRD

## Overview

Add an ATR (Average True Range) Trailing Stop Loss feature to the backtest tool. The trailing stop tracks peak price after position entry and triggers exit when price retraces by ATR × Multiplier from the peak.

## Behavior

### Long Position
1. Enter LONG when price crosses above MA
2. Track `highestSinceEntry` (starts at entry price)
3. Each bar: `highestSinceEntry = max(highestSinceEntry, closePrice)`
4. Stop level: `stopPrice = highestSinceEntry - (ATR × multiplier)`
5. Exit triggers when `closePrice < stopPrice` OR MA signal reverses

### Short Position
1. Enter SHORT when price crosses below MA
2. Track `lowestSinceEntry` (starts at entry price)
3. Each bar: `lowestSinceEntry = min(lowestSinceEntry, closePrice)`
4. Stop level: `stopPrice = lowestSinceEntry + (ATR × multiplier)`
5. Exit triggers when `closePrice > stopPrice` OR MA signal reverses

### ATR Calculation (Close-Only Approximation)
Since data only contains close prices:
- True Range approximation: `|close - previousClose|`
- ATR = Simple Moving Average of TR over period

## Configuration

| Parameter | Values | Default |
|-----------|--------|---------|
| ATR Enabled | on/off toggle | off |
| ATR Period | 10, 14, 20 (fixed options) | 14 |
| ATR Multiplier | 2.0, 2.5, 3.0, 3.5, 4.0 | 2.5 |
| Profit Take % | 1-100% | 100 |

**Profit Take %**: When stop triggers, close this percentage of position. Remainder holds until MA signal reverses.

---

## User Stories

### US-001: Toggle ATR Trailing Stop
**As a** trader
**I want** to enable/disable ATR trailing stop per backtest
**So that** I can compare strategy performance with and without the feature

**Acceptance Criteria:**
- [ ] Toggle switch in UI form labeled "ATR Trailing Stop"
- [ ] Default: disabled
- [ ] When disabled, backtest uses MA-signal-only exits (current behavior)
- [ ] When enabled, ATR stop is checked on each bar alongside MA signal
- [ ] Toggle state persists in URL params

**Files to modify:**
- `lib/backtest/types.ts` - Add `atrEnabled: boolean` to `BacktestParams`
- `components/backtest/backtest-form.tsx` - Add toggle control
- `hooks/use-url-params.ts` - Add `atr` param key
- `app/api/backtest/route.ts` - Accept and validate `atrEnabled`

---

### US-002: Configure ATR Period
**As a** trader
**I want** to select ATR period from fixed options (10, 14, 20)
**So that** I can test different volatility lookback windows

**Acceptance Criteria:**
- [ ] Dropdown/select with options: 10, 14, 20
- [ ] Default: 14
- [ ] Control disabled when ATR toggle is off
- [ ] Period persists in URL params
- [ ] API validates period is one of [10, 14, 20]

**Files to modify:**
- `lib/backtest/types.ts` - Add `atrPeriod: 10 | 14 | 20` to `BacktestParams`
- `components/backtest/backtest-form.tsx` - Add period selector
- `hooks/use-url-params.ts` - Add `atrp` param key
- `app/api/backtest/route.ts` - Validate against allowed values

---

### US-003: Configure ATR Multiplier
**As a** trader
**I want** to set ATR multiplier between 2.0-4.0 (0.5 steps)
**So that** I can adjust stop distance based on risk tolerance

**Acceptance Criteria:**
- [ ] Slider or dropdown with values: 2.0, 2.5, 3.0, 3.5, 4.0
- [ ] Default: 2.5
- [ ] Control disabled when ATR toggle is off
- [ ] Current value displayed as badge (e.g., "2.5×")
- [ ] Multiplier persists in URL params

**Files to modify:**
- `lib/backtest/types.ts` - Add `atrMultiplier: number` to `BacktestParams`
- `components/backtest/backtest-form.tsx` - Add multiplier control
- `hooks/use-url-params.ts` - Add `atrm` param key
- `app/api/backtest/route.ts` - Validate range [2.0, 4.0]

---

### US-004: Configure Profit Take Percentage
**As a** trader
**I want** to specify what percentage of position to close when stop triggers
**So that** I can take partial profits while letting remainder run

**Acceptance Criteria:**
- [ ] Slider with range 1-100%
- [ ] Default: 100 (full close)
- [ ] Control disabled when ATR toggle is off
- [ ] Label shows current value (e.g., "Close 50%")
- [ ] When < 100%, remaining position exits only on MA reversal
- [ ] Partial close percentage persists in URL params

**Files to modify:**
- `lib/backtest/types.ts` - Add `atrProfitTakePercent: number` to `BacktestParams`
- `components/backtest/backtest-form.tsx` - Add percentage slider
- `hooks/use-url-params.ts` - Add `atrptp` param key
- `app/api/backtest/route.ts` - Validate range [1, 100]

---

### US-005: Calculate ATR from Close Prices
**As a** developer
**I want** ATR calculated using close-only approximation
**So that** the feature works with available price data

**Acceptance Criteria:**
- [ ] Create `lib/backtest/atr.ts` following SMA/EMA pattern
- [ ] TR approximation: `Math.abs(close - previousClose)`
- [ ] ATR = SMA of TR over specified period
- [ ] First `period` bars return null (warmup)
- [ ] Export `calculateAtr(prices: number[], period: number): (number | null)[]`
- [ ] Lint/typecheck passes

**Files to create:**
- `lib/backtest/atr.ts`

**Files to modify:**
- `lib/backtest/index.ts` - Export ATR calculator

---

### US-006: Implement Trailing Stop in Simulator
**As a** developer
**I want** the simulator to check ATR stop on each bar
**So that** positions exit when stop is triggered

**Acceptance Criteria:**
- [ ] Track `peakPrice` during position (high for LONG, low for SHORT)
- [ ] Update peak each bar: `max/min(peak, closePrice)`
- [ ] Calculate stop: `peak ∓ (ATR × multiplier)`
- [ ] Stop only tightens (ratchet), never loosens
- [ ] Exit if `closePrice` crosses stop level
- [ ] Exit occurs BEFORE checking MA signal (stop takes priority)
- [ ] Partial close: reduce position, set flag to ignore further ATR stops
- [ ] After partial close, remaining position exits only on MA reversal
- [ ] Lint/typecheck passes

**Files to modify:**
- `lib/backtest/simulator.ts` - Add ATR stop logic to position loop

---

### US-007: Pass ATR Values to Simulator
**As a** developer
**I want** pre-calculated ATR values passed to the simulator
**So that** ATR doesn't need recalculation per bar

**Acceptance Criteria:**
- [ ] Engine calculates ATR values before simulation loop
- [ ] ATR values array passed to `simulateMaStrategy()`
- [ ] `SimulatorParams` interface extended with ATR config
- [ ] ATR calculation skipped if `atrEnabled: false`
- [ ] Lint/typecheck passes

**Files to modify:**
- `lib/backtest/engine.ts` - Calculate ATR, pass to simulator
- `lib/backtest/simulator.ts` - Accept ATR in params

---

### US-008: Track ATR Stop Statistics
**As a** trader
**I want** to see how many times ATR stop triggered
**So that** I can evaluate the feature's impact

**Acceptance Criteria:**
- [ ] Add to `MaResult`: `atrStopsTriggered: number`
- [ ] Add to `MaResult`: `atrPartialCloses: number`
- [ ] Count increments each time ATR stop (not MA signal) causes exit
- [ ] Displayed in results summary
- [ ] Lint/typecheck passes

**Files to modify:**
- `lib/backtest/types.ts` - Extend `MaResult`
- `lib/backtest/simulator.ts` - Track counts

---

### US-009: Display ATR Results in Dashboard
**As a** trader
**I want** to see ATR stop metrics in the results
**So that** I understand the feature's impact on performance

**Acceptance Criteria:**
- [ ] Show ATR config used (period, multiplier, profit %)
- [ ] Show stops triggered count
- [ ] Show partial closes count (if applicable)
- [ ] Only display when ATR was enabled
- [ ] Lint/typecheck passes

**Files to modify:**
- `components/backtest/results-*.tsx` - Add ATR metrics display

---

## Technical Architecture

### New Type Definitions

```typescript
// lib/backtest/types.ts

export interface AtrConfig {
  enabled: boolean;
  period: 10 | 14 | 20;
  multiplier: number;      // 2.0, 2.5, 3.0, 3.5, 4.0
  profitTakePercent: number; // 1-100
}

// Add to BacktestParams:
export interface BacktestParams {
  // ... existing fields
  atr: AtrConfig;
}

// Add to MaResult:
export interface MaResult {
  // ... existing fields
  atrStopsTriggered: number;
  atrPartialCloses: number;
}
```

### Simulator State Additions

```typescript
// In simulator loop, track:
let peakPrice = entryPrice;      // highestSinceEntry (LONG) or lowestSinceEntry (SHORT)
let atrStopUsed = false;         // Flag after partial close to ignore further ATR stops
let remainingPositionRatio = 1;  // 1.0 = full position, 0.5 = half after partial close
```

### Data Flow

```
UI Form → URL Params → API Request → BacktestParams
                                          ↓
                                    runBacktest()
                                          ↓
                            ┌─────────────┴─────────────┐
                            ↓                           ↓
                    calculateAtr()              calculateSmas()
                            ↓                           ↓
                            └─────────────┬─────────────┘
                                          ↓
                                simulateMaStrategy()
                                (with ATR stop check)
                                          ↓
                                    MaResult
                                          ↓
                                    API Response
```

---

## Implementation Order

1. **US-005**: Create ATR calculator (`atr.ts`)
2. **US-001, US-002, US-003, US-004**: Add types and UI controls
3. **US-007**: Wire ATR to engine
4. **US-006**: Implement stop logic in simulator
5. **US-008**: Add statistics tracking
6. **US-009**: Display results in dashboard

---

## Non-Goals

- No ATR period optimization (only fixed values: 10, 14, 20)
- No multiple partial closes (one partial close max per position)
- No intrabar stop checks (close price only)
- No export of individual stop events (just aggregate counts)

---

## Testing Checklist

- [ ] ATR disabled: behavior identical to current
- [ ] ATR enabled, 100% profit take: full position closes on stop
- [ ] ATR enabled, 50% profit take: half closes, half waits for MA
- [ ] Stop only tightens (never loosens)
- [ ] LONG stop: triggers when price drops below `peak - ATR*mult`
- [ ] SHORT stop: triggers when price rises above `trough + ATR*mult`
- [ ] Liquidation still works correctly with ATR enabled
- [ ] URL params persist all ATR settings
- [ ] Build and lint pass
