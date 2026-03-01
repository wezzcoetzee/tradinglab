# Tech Debt Tracker

## Active Debt

| ID | Area | Description | Severity |
|----|------|-------------|----------|
| TD-1 | Testing | `usePagination` hook has no tests | Low |
| TD-2 | Testing | 13 of 20 feature components lack tests (backtest-setup, strategy-config, performance-chart, backtester, baseline-card, metrics-cards, sma-comparison-table, all-configurations-table, table-pagination, header, footer, theme-provider, theme-toggle) | Medium |
| TD-3 | Testing | No E2E tests for full upload → optimize → results flow | Medium |
| TD-4 | Types | `test-setup.ts` uses `@ts-expect-error` for happy-dom type mismatches | Low |
| TD-5 | Build | No bundle size analysis or budget | Low |
| TD-6 | A11y | No accessibility audit beyond Radix defaults | Medium |
| TD-7 | Engine | `backtest-engine.ts` exists alongside `backtest-runner.ts` — unclear boundary between the two | Low |
| TD-8 | Validation | `validateTradingParameters` TP ordering check is dead code — sorts before checking order | Low |

## Resolved Debt

_None tracked yet._
