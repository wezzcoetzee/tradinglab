# PRD: SMA Trading Strategy Backtester

## Introduction

Build a web dashboard to backtest Simple Moving Average (SMA) trading strategies on BTC. The tool compares different SMA periods (2D-200D) as signals to go LONG (price above SMA) or SHORT (price below SMA), accounting for trading fees, leverage, and drawdown limits. Replaces the existing Excel/VBA implementation with a cleaner, interactive solution.

## Goals

- Backtest SMA strategies across configurable period ranges (2D-200D)
- Compare SMA trading returns vs buy-and-hold (HODL)
- Visualize performance with interactive charts
- Support leverage with proper liquidation modeling
- Track maximum drawdowns for risk assessment
- Calculate annualized and total returns

## User Stories

### US-001: Seed price data to database

**Description:** As a user, I need historical BTC price data loaded into the database so I can run backtests.

**Acceptance Criteria:**

- [x] Parse `btc-price-data.json` and insert into database
- [x] Store: timestamp, close_price, date
- [x] Database schema created with proper indexes on date
- [x] Seed script can be re-run without duplicating data

### US-002: Configure backtest parameters

**Description:** As a user, I want to set my backtest parameters so I can customize the strategy.

**Acceptance Criteria:**

- [x] Input fields for: Initial Capital, Exchange Fee (%), SMA Period Range (min/max)
- [x] Leverage selector: same for long/short, or separate values
- [x] Toggle: Buy on Long Signal, Short on Short Signal
- [x] Gas fee per trade (optional, default 0)
- [ ] Parameters persist in URL or local storage

### US-003: Calculate SMA values

**Description:** As a developer, I need to calculate SMA values for each period so they can be used for signal generation.

**Acceptance Criteria:**

- [x] Calculate SMA for periods 2 to 200 days
- [x] SMA = average of last N close prices
- [x] Handle insufficient data at start (no SMA until N days of data)

### US-004: Generate trading signals

**Description:** As a user, I need the system to generate LONG/SHORT signals based on price vs SMA.

**Acceptance Criteria:**

- [x] LONG signal when close_price > SMA
- [x] SHORT signal when close_price < SMA
- [x] Track signal changes (position switches)

### US-005: Simulate trading with fees

**Description:** As a user, I want trading fees applied realistically so returns reflect actual trading costs.

**Acceptance Criteria:**

- [x] Apply exchange fee on every trade
- [x] Position switch (LONG to SHORT) incurs 2x fee (close + open)
- [x] Starting position uses initial capital minus fee
- [x] Portfolio value compounds (ending balance becomes next trade's starting balance)

### US-006: Model leverage and liquidation

**Description:** As a user, I want leverage applied to positions so I can see amplified returns and understand liquidation risk.

**Acceptance Criteria:**

- [x] Multiply position size by leverage factor
- [x] Calculate liquidation threshold: if drawdown >= 100%/leverage, account wiped
- [x] Example: 2x leverage = liquidation at 50% drawdown
- [x] Strategy stops if account hits 0 or below
- [x] Support separate leverage for long/short positions

### US-007: Calculate HODL benchmark

**Description:** As a user, I want to see what buy-and-hold returns would be so I can compare against the SMA strategy.

**Acceptance Criteria:**

- [x] Calculate BTC quantity purchasable with initial capital at start date
- [x] Track portfolio value = quantity * current_close_price
- [x] Display final HODL return and max drawdown

### US-008: Track maximum drawdown

**Description:** As a user, I want to see the maximum drawdown for both strategies to understand risk.

**Acceptance Criteria:**

- [x] Track peak portfolio value throughout backtest
- [x] Drawdown = (peak - current) / peak
- [x] Record maximum drawdown reached
- [x] Display for both SMA strategy and HODL

### US-009: Display results table

**Description:** As a user, I want to see a comparison table of all SMA periods so I can identify optimal parameters.

**Acceptance Criteria:**

- [x] Table columns: SMA Period, Total Return %, Annualized Return %, Max Drawdown %, vs HODL
- [x] Sortable by any column
- [x] Color coding: green for positive, red for negative returns
- [x] Highlight best performing SMA period

### US-010: Visualize performance charts

**Description:** As a user, I want interactive charts so I can analyze strategy performance visually.

**Acceptance Criteria:**

- [x] Chart 1: SMA Period vs Annualized Return (line chart)
- [x] Chart 2: Portfolio Value over Time - SMA vs HODL comparison
- [ ] Chart 3: Heatmap of returns by SMA period and leverage
- [x] Charts are interactive (hover for values, zoom)

### US-011: Export results

**Description:** As a user, I want to export backtest results so I can analyze further in Excel or share.

**Acceptance Criteria:**

- [x] Export to CSV button
- [x] Include all SMA periods with their metrics
- [x] Include input parameters used

## Functional Requirements

- FR-1: Database stores price data with schema: id, timestamp, close_price, date
- FR-2: Backtest engine calculates SMA values for configurable period range
- FR-3: Trading simulator tracks position (LONG/SHORT/NONE), entry price, and portfolio value
- FR-4: Fee calculation: `trade_value * (exchange_fee_percent / 100) + gas_fee`
- FR-5: Position switch fee: 2x the single trade fee
- FR-6: Leverage multiplies both gains and losses: `return * leverage`
- FR-7: Liquidation occurs when: `drawdown_percent >= (100 / leverage)`
- FR-8: HODL calculation: `(initial_capital / start_price) * current_price`
- FR-9: Annualized return: `((final_value / initial_value) ^ (365 / days)) - 1`
- FR-10: Max drawdown tracking: continuous peak comparison throughout backtest
- FR-11: Results persist in browser session until new backtest run

## Non-Goals

- No funding fee calculations (average to zero over time, too complex)
- No real-time trading or exchange integration
- No EMA or other indicator types (SMA only)
- No multi-asset support (BTC only)
- No authentication or multi-user support
- No backtesting of date ranges (uses full dataset)

## Technical Considerations

- **Stack**: Next.js with React
- **Database**: PostgreSQL
- **ORM**: Prisma (type-safe, works well with Next.js)
- **Charts**: Recharts (React-native, good for dashboards)
- **Styling**: Tailwind CSS
- **Calculations**: Server-side API routes for heavy computation
- **Data format**: btc-price-data.json seeded to PostgreSQL on setup

## Success Metrics

- Backtest completes in under 5 seconds for full 2-200 SMA range
- Results match existing Excel calculations within 0.01% tolerance
- All SMA periods visible in a single scrollable table
- Charts render without lag when switching parameters

## Open Questions

1. ~~What is the structure of `btc-price-data.json`?~~ **Resolved**: `{unixTimestamp, date, closePrice}[]` - starts 2014-12-01
2. ~~What tech stack do you prefer?~~ **Resolved: Next.js + PostgreSQL**
3. Should there be preset "quick configs" (conservative/aggressive leverage)? (Nice-to-have, skip for MVP)
4. ~~Date range of the price data?~~ **Resolved**: Starts 2014-12-01, ends 2025-10-02

---

## Implementation Plan

### Phase 1: Project Setup

1. Initialize Next.js project with TypeScript
2. Set up PostgreSQL + Prisma
3. Create Prisma schema:

   ```prisma
   model PriceData {
     id          Int      @id @default(autoincrement())
     timestamp   Int      @unique  // Unix timestamp
     date        DateTime
     closePrice  Float
   }
   ```

4. Create seed script from `btc-price-data.json`

### Phase 2: Core Backtest Engine

5. Implement SMA calculation utility
2. Build trading simulator:
   - Position tracking (LONG/SHORT/NONE)
   - Fee calculation (single + position switch)
   - Portfolio value updates with compounding
3. Add leverage logic with liquidation
4. Implement HODL benchmark
5. Add drawdown tracking

### Phase 3: API Routes

10. `POST /api/backtest` - Run backtest with parameters
2. `GET /api/price-data` - Get date range info

### Phase 4: Web Dashboard

12. Parameter input form component
2. Results table with sorting
3. Charts (Recharts):
    - SMA Period vs Return
    - Portfolio over time
4. CSV export button

### Phase 5: Validation & Polish

16. Compare results with Excel spreadsheet
2. Add loading states and error handling
3. URL parameter persistence (future)

---

## Files Created

### Database & Seeding

- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Seed script for price data

### Backtest Engine

- `lib/backtest/types.ts` - Type definitions
- `lib/backtest/sma.ts` - SMA calculation
- `lib/backtest/simulator.ts` - Trading simulation
- `lib/backtest/engine.ts` - Main orchestration
- `lib/backtest/index.ts` - Exports
- `lib/db.ts` - Prisma client singleton

### API Routes

- `app/api/backtest/route.ts` - POST endpoint for running backtests
- `app/api/price-data/route.ts` - GET endpoint for price data info

### UI Components

- `components/backtest/backtest-form.tsx` - Parameter input form
- `components/backtest/results-table.tsx` - Sortable results table
- `components/backtest/portfolio-chart.tsx` - Portfolio over time chart
- `components/backtest/sma-return-chart.tsx` - SMA period vs return chart
- `components/backtest/summary-stats.tsx` - Key metrics display
- `components/backtest/csv-export.tsx` - CSV export button
- `components/backtest/dashboard.tsx` - Main dashboard component
- `components/backtest/index.ts` - Exports

### Main Page

- `app/page.tsx` - Dashboard entry point

## Verification

- Compare results with existing Excel for known inputs
- Manual calculation spot-check for a single SMA period
- Load test with full date range
