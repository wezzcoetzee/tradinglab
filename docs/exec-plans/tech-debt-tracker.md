# Tech Debt Tracker

## Active Debt

| ID | Area | Description | Severity |
|----|------|-------------|----------|
| TD-1 | Testing | `usePagination` hook has no tests | Low |
| TD-2 | Testing | 15 of 21 feature components lack tests (strategy-config, performance-chart, baseline-card, metrics-cards, sma-comparison-table, all-configurations-table, table-pagination, header, footer, price-ticker, rolling-number, structured-data, theme-provider, theme-toggle, calculators/result-card) | Medium |
| TD-3 | Testing | No E2E tests for full upload → optimize → results flow | Medium |
| TD-4 | Types | `test-setup.ts` uses `@ts-expect-error` for happy-dom type mismatches | Low |
| TD-5 | Build | No bundle size analysis or budget | Low |
| TD-6 | A11y | No accessibility audit beyond Radix defaults | Medium |
| TD-7 | Engine | `backtest-engine.ts` exists alongside `backtest-runner.ts` — unclear boundary between the two | Low |
| TD-8 | Validation | `validateTradingParameters` TP ordering check is dead code — sorts before checking order | Low |

## Resolved Debt

| ID | Area | Description | Resolution |
|----|------|-------------|------------|
| TD-9 | Testing | happy-dom v20 broke all DOM component tests (273 failures) — its query-selector parser eagerly constructs `new this.window.SyntaxError(...)`, which `Window` doesn't expose | `test-setup.ts` now uses `GlobalWindow` instead of `Window` (exposes JS global constructors) |
